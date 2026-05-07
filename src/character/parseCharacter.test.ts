import { describe, expect, it } from 'vitest';
import { parseCharacter, parseCharacterJson } from './parseCharacter';
import { makeCharacter } from './fixtures';
import { CHARACTER_SCHEMA_VERSION } from './types';

describe('parseCharacter', () => {
  it('accepts a valid character built from the fixture', () => {
    const character = makeCharacter();
    const result = parseCharacter(JSON.parse(JSON.stringify(character)));
    expect(result).toEqual({ ok: true, character });
  });

  it('strips unknown extra keys from identity rather than including them', () => {
    const character = makeCharacter();
    const input = {
      ...character,
      identity: { ...character.identity, unknownExtra: 'should be dropped' },
    };
    const result = parseCharacter(JSON.parse(JSON.stringify(input)));
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(Object.hasOwn(result.character.identity, 'unknownExtra')).toBe(false);
    }
  });

  it('rejects a non-object value', () => {
    expect(parseCharacter('hello')).toMatchObject({ ok: false });
    expect(parseCharacter(null)).toMatchObject({ ok: false });
    expect(parseCharacter(['array'])).toMatchObject({ ok: false });
  });

  it('rejects unsupported schema versions', () => {
    const result = parseCharacter({ ...makeCharacter(), version: 2 });
    expect(result).toMatchObject({ ok: false, error: expect.stringContaining('version') });
  });

  it('rejects unknown system ids', () => {
    const character = makeCharacter();
    const input = JSON.parse(JSON.stringify({ ...character, system: 'pathfinder' }));
    const result = parseCharacter(input);
    expect(result).toMatchObject({ ok: false, error: expect.stringContaining('system') });
  });

  it('rejects missing identity name', () => {
    const character = makeCharacter();
    const input = JSON.parse(
      JSON.stringify({ ...character, identity: { ...character.identity, name: '' } })
    );
    expect(parseCharacter(input)).toMatchObject({
      ok: false,
      error: expect.stringContaining('identity.name'),
    });
  });

  it('rejects non-numeric stats.hope', () => {
    const character = makeCharacter();
    const input = JSON.parse(
      JSON.stringify({ ...character, stats: { ...character.stats, hope: 'four' } })
    );
    expect(parseCharacter(input)).toMatchObject({
      ok: false,
      error: expect.stringContaining('stats.hope'),
    });
  });

  it('rejects non-array stats.hp', () => {
    const character = makeCharacter();
    const input = JSON.parse(
      JSON.stringify({ ...character, stats: { ...character.stats, hp: 'oops' } })
    );
    expect(parseCharacter(input)).toMatchObject({
      ok: false,
      error: expect.stringContaining('stats.hp'),
    });
  });

  it('rejects missing slotCounts', () => {
    const character = makeCharacter();
    const input = JSON.parse(JSON.stringify(character)) as Record<string, unknown>;
    delete input.slotCounts;
    expect(parseCharacter(input)).toMatchObject({
      ok: false,
      error: expect.stringContaining('slotCounts'),
    });
  });

  it('rejects missing core conditions', () => {
    const character = makeCharacter();
    const input = JSON.parse(
      JSON.stringify({
        ...character,
        conditions: { core: { hidden: false }, feature: {} },
      })
    );
    expect(parseCharacter(input)).toMatchObject({
      ok: false,
      error: expect.stringContaining('conditions.core'),
    });
  });

  it('rejects non-string entries in featureConditions', () => {
    const character = makeCharacter();
    const input = JSON.parse(JSON.stringify({ ...character, featureConditions: [1, 2] }));
    expect(parseCharacter(input)).toMatchObject({
      ok: false,
      error: expect.stringContaining('featureConditions'),
    });
  });

  it('preserves optional identity fields when present and valid', () => {
    const character = makeCharacter({
      identity: { name: 'Lyra', class: 'Bard', ancestry: 'Elf', subclass: 'Wordsmith', level: 3 },
    });
    const result = parseCharacter(JSON.parse(JSON.stringify(character)));
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.character.identity).toMatchObject({
        subclass: 'Wordsmith',
        level: 3,
      });
    }
  });

  it('preserves thresholds when present and valid', () => {
    const character = makeCharacter({ thresholds: { major: 3, severe: 5 } });
    const result = parseCharacter(JSON.parse(JSON.stringify(character)));
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.character.thresholds).toEqual({ major: 3, severe: 5 });
    }
  });

  it('rejects non-numeric threshold fields', () => {
    const character = makeCharacter();
    const input = JSON.parse(
      JSON.stringify({ ...character, thresholds: { major: 'three', severe: 5 } })
    );
    expect(parseCharacter(input)).toMatchObject({
      ok: false,
      error: expect.stringContaining('thresholds.major'),
    });
  });

  it('round-trips a character built at the current schema version', () => {
    const character = makeCharacter();
    expect(character.version).toBe(CHARACTER_SCHEMA_VERSION);
  });
});

describe('parseCharacterJson', () => {
  it('returns a JSON error for malformed input', () => {
    expect(parseCharacterJson('{not json')).toMatchObject({
      ok: false,
      error: expect.stringContaining('JSON'),
    });
  });

  it('parses a valid JSON string', () => {
    const character = makeCharacter();
    const result = parseCharacterJson(JSON.stringify(character));
    expect(result).toEqual({ ok: true, character });
  });
});
