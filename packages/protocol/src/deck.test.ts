import { describe, expect, it } from 'vitest';
import { isAllowedOrigin, mergeStates, parsePageMessage, parsePluginMessage } from './deck';

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
