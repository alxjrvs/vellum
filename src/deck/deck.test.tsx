import { describe, expect, it, vi } from 'vitest';
import { subscribeCommands } from '../commands/commandBus';
import { makeCharacter } from '../character/fixtures';
import { daggerheartSystem } from '../systems/daggerheart.system';
import { playerDeckState } from './playerDeckState';
import { reportDeckState, shouldLinkDeck, startDeckLink } from './deckLink';
import { isAllowedOrigin, mergeStates, parsePageMessage, parsePluginMessage } from './protocol';

/** A stand-in for the browser WebSocket that records what the page sends. */
class FakeSocket extends EventTarget {
  readyState: number = WebSocket.CONNECTING;
  sent: unknown[] = [];
  send(data: string) {
    this.sent.push(JSON.parse(data));
  }
  close() {
    this.readyState = WebSocket.CLOSED;
    this.dispatchEvent(new Event('close'));
  }
  open() {
    this.readyState = WebSocket.OPEN;
    this.dispatchEvent(new Event('open'));
  }
  receive(data: unknown) {
    this.dispatchEvent(new MessageEvent('message', { data: JSON.stringify(data) }));
  }
}

describe('protocol', () => {
  it('accepts plugin commands and drops anything else', () => {
    expect(
      parsePluginMessage(
        JSON.stringify({ type: 'command', command: { type: 'frame.cycle', delta: 1 } })
      )
    ).toEqual({ type: 'command', command: { type: 'frame.cycle', delta: 1 } });
    expect(parsePluginMessage('{"type":"command","command":{"type":"explode"}}')).toBeNull();
    expect(parsePluginMessage('not json')).toBeNull();
  });

  it('keeps only well-formed parts of a page report', () => {
    const message = parsePageMessage(
      JSON.stringify({
        type: 'state',
        state: {
          tracks: {
            hope: { label: 'Hope', value: 3, max: 6 },
            hp: { label: 'HP', value: 9, max: 6 },
            mana: { label: 'Mana', value: 1, max: 2 },
          },
          conditions: { hidden: true, asleep: true, vulnerable: 'yes' },
          frame: { id: 'daggerheart', label: 'Daggerheart' },
        },
      })
    );
    expect(message).toEqual({
      type: 'state',
      state: {
        tracks: { hope: { label: 'Hope', value: 3, max: 6 } },
        conditions: { hidden: true },
        frame: { id: 'daggerheart', label: 'Daggerheart' },
      },
    });
    expect(parsePageMessage('{"type":"hello","version":1}')).toEqual({ type: 'hello', version: 1 });
    expect(parsePageMessage('{"type":"state"}')).toBeNull();
  });

  it('merges the player HUD and the GM screen into one picture', () => {
    const merged = mergeStates([
      { tracks: { hope: { label: 'Hope', value: 2, max: 6 } }, conditions: { hidden: false } },
      { tracks: { fear: { label: 'Fear', value: 4, max: 12 } }, frame: { id: 'a', label: 'A' } },
    ]);
    expect(merged.tracks).toEqual({
      hope: { label: 'Hope', value: 2, max: 6 },
      fear: { label: 'Fear', value: 4, max: 12 },
    });
    expect(merged.frame).toEqual({ id: 'a', label: 'A' });
  });

  it('only answers Vellum and a local dev server', () => {
    expect(isAllowedOrigin('https://vellumhud.com')).toBe(true);
    expect(isAllowedOrigin('http://localhost:5173')).toBe(true);
    expect(isAllowedOrigin('http://127.0.0.1:4173')).toBe(true);
    expect(isAllowedOrigin('https://vellumhud.com.evil.example')).toBe(false);
    expect(isAllowedOrigin('http://vellumhud.com')).toBe(false);
    expect(isAllowedOrigin('https://example.com')).toBe(false);
    expect(isAllowedOrigin('null')).toBe(false);
    expect(isAllowedOrigin(undefined)).toBe(false);
  });
});

describe('deck link', () => {
  it('connects only inside OBS or when the link asks', () => {
    expect(shouldLinkDeck(window)).toBe(false);
    const obs = Object.assign(Object.create(window), { obsstudio: {} }) as Window;
    expect(shouldLinkDeck(obs)).toBe(true);
    const asked = { location: { search: '?deck=1' } } as unknown as Window;
    expect(shouldLinkDeck(asked)).toBe(true);
  });

  it('says hello, reports state, relays commands and retries when closed', () => {
    vi.useFakeTimers();
    const sockets: FakeSocket[] = [];
    const stop = startDeckLink({
      createSocket: () => {
        const socket = new FakeSocket();
        sockets.push(socket);
        return socket as unknown as WebSocket;
      },
    });
    reportDeckState({ frame: { id: 'daggerheart', label: 'Daggerheart' } });
    sockets[0].open();
    expect(sockets[0].sent).toEqual([
      { type: 'hello', version: 1 },
      { type: 'state', state: { frame: { id: 'daggerheart', label: 'Daggerheart' } } },
    ]);

    reportDeckState({ tracks: { fear: { label: 'Fear', value: 1, max: 12 } } });
    expect(sockets[0].sent[2]).toEqual({
      type: 'state',
      state: {
        frame: { id: 'daggerheart', label: 'Daggerheart' },
        tracks: { fear: { label: 'Fear', value: 1, max: 12 } },
      },
    });

    const seen = vi.fn();
    const unsubscribe = subscribeCommands(seen);
    sockets[0].receive({
      type: 'command',
      command: { type: 'track.adjust', track: 'hope', delta: 1 },
    });
    sockets[0].receive({ type: 'command', command: { type: 'nope' } });
    expect(seen).toHaveBeenCalledTimes(1);
    unsubscribe();

    // The plugin went away: try again after a second, then back off.
    sockets[0].close();
    vi.advanceTimersByTime(999);
    expect(sockets).toHaveLength(1);
    vi.advanceTimersByTime(1);
    expect(sockets).toHaveLength(2);
    sockets[1].close();
    vi.advanceTimersByTime(1999);
    expect(sockets).toHaveLength(2);
    vi.advanceTimersByTime(1);
    expect(sockets).toHaveLength(3);

    stop();
    vi.advanceTimersByTime(60000);
    expect(sockets).toHaveLength(3);
    vi.useRealTimers();
  });
});

describe('playerDeckState', () => {
  it('reports HP as remaining health and leaves out armor with no slots', () => {
    const character = makeCharacter({
      stats: { hope: 2, hp: [0, 1], stress: [0], armorSlots: [] },
      slotCounts: { hp: 6, stress: 6, armorSlots: 0 },
    });
    const state = playerDeckState(character, daggerheartSystem);
    expect(state.tracks?.hp).toEqual({ label: expect.any(String), value: 4, max: 6 });
    expect(state.tracks?.hope?.value).toBe(2);
    expect(state.tracks?.stress?.value).toBe(1);
    expect(state.tracks?.armor).toBeUndefined();
    expect(state.conditions).toEqual(character.conditions.core);
  });
});
