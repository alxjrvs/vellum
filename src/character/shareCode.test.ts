import { describe, expect, it } from 'vitest';
import { decodeShareParam, encodeCharacterToShareParam } from './shareCode';
import { makeCharacter } from './fixtures';

describe('shareCode', () => {
  it('round-trips a character through encode → decode', () => {
    const character = makeCharacter({
      identity: { name: 'Lyra', class: 'Bard', ancestry: 'Elf', subclass: 'Wordsmith', level: 3 },
      stats: {
        hope: 4,
        hp: [1, 1, 0, 0, 0, 0],
        stress: [1, 0, 0, 0, 0, 0],
        armorSlots: [1, 0, 0],
      },
    });

    const result = decodeShareParam(encodeCharacterToShareParam(character));
    expect(result).toEqual({ ok: true, character });
  });

  it('round-trips a character with Unicode in its name', () => {
    const character = makeCharacter({
      identity: { name: 'S★raphïne 竜', class: 'Bard', ancestry: 'Elf' },
    });

    const result = decodeShareParam(encodeCharacterToShareParam(character));
    expect(result).toEqual({ ok: true, character });
  });

  it('emits a URL-safe param with no +, /, =, or whitespace', () => {
    // A payload picked to force `+`/`/` bytes under standard base64.
    const character = makeCharacter({
      identity: { name: '🎲🐉 ~ ?&=/+ ~ 竜王', class: 'Wizard', ancestry: 'Human' },
    });

    const param = encodeCharacterToShareParam(character);
    expect(param).not.toMatch(/[+/=\s]/);
    expect(param).toMatch(/^[A-Za-z0-9\-_]+$/);
  });

  it('returns ok:false for a non-base64 param without throwing', () => {
    const result = decodeShareParam('!!!not base64!!!');
    expect(result.ok).toBe(false);
  });

  it('returns ok:false when the decoded payload is not valid JSON', () => {
    const param = encodeCharacterToShareParam(makeCharacter()).slice(0, 8);
    const result = decodeShareParam(param);
    expect(result.ok).toBe(false);
  });

  it('returns ok:false for valid JSON that is not a character', () => {
    const bytes = new TextEncoder().encode(JSON.stringify({ hello: 'world' }));
    let binary = '';
    for (const byte of bytes) binary += String.fromCharCode(byte);
    const param = btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');

    const result = decodeShareParam(param);
    expect(result.ok).toBe(false);
  });

  it('returns ok:false for an empty param without throwing', () => {
    expect(decodeShareParam('').ok).toBe(false);
  });
});
