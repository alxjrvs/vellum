import { describe, expect, it, vi } from 'vitest';
import { subscribeCommands } from '../commands/commandBus';
import { makeCharacter } from '../character/fixtures';
import { daggerheartSystem } from '../systems/daggerheart.system';
import { playerDeckState } from './playerDeckState';
import { reportDeckState, shouldLinkDeck, startDeckLink } from './deckLink';

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
