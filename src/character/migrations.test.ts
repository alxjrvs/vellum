import { describe, expect, it } from 'vitest';
import { LEGACY_VERSION, migrateToCurrentVersion } from './migrations';
import { parseCharacter } from './parseCharacter';
import { makeCharacter } from './fixtures';
import { CHARACTER_SCHEMA_VERSION } from './types';

function legacyPayload(): Record<string, unknown> {
  const raw = JSON.parse(JSON.stringify(makeCharacter())) as Record<string, unknown>;
  delete raw.version;
  return raw;
}

describe('migrateToCurrentVersion', () => {
  it('normalizes a legacy (missing version) payload up to the current version', () => {
    const legacy = legacyPayload();
    expect(Object.hasOwn(legacy, 'version')).toBe(false);

    const migrated = migrateToCurrentVersion(legacy) as Record<string, unknown>;
    expect(migrated.version).toBe(CHARACTER_SCHEMA_VERSION);
  });

  it('treats a missing version as the legacy sentinel', () => {
    expect(LEGACY_VERSION).toBe(0);
    expect(LEGACY_VERSION).toBeLessThan(CHARACTER_SCHEMA_VERSION);
  });

  it('returns a current-version object untouched', () => {
    const input = JSON.parse(JSON.stringify(makeCharacter()));
    expect(migrateToCurrentVersion(input)).toEqual(input);
  });

  it('leaves a newer, unknown version unchanged for the validator to reject', () => {
    const input = { ...JSON.parse(JSON.stringify(makeCharacter())), version: 2 };
    expect(migrateToCurrentVersion(input)).toEqual(input);
  });

  it('passes non-object values through unchanged', () => {
    expect(migrateToCurrentVersion(null)).toBeNull();
    expect(migrateToCurrentVersion('hello')).toBe('hello');
    expect(migrateToCurrentVersion(['array'])).toEqual(['array']);
  });

  it('does not mutate its input', () => {
    const legacy = legacyPayload();
    migrateToCurrentVersion(legacy);
    expect(Object.hasOwn(legacy, 'version')).toBe(false);
  });
});

describe('parseCharacter with migrations', () => {
  it('migrates a legacy (missing version) payload then validates it', () => {
    const character = makeCharacter();
    const result = parseCharacter(legacyPayload());
    expect(result).toEqual({ ok: true, character });
  });

  it('accepts a current-version payload exactly as before', () => {
    const character = makeCharacter();
    const result = parseCharacter(JSON.parse(JSON.stringify(character)));
    expect(result).toEqual({ ok: true, character });
  });

  it('still rejects an unknown/newer version with a version-specific error', () => {
    const input = { ...JSON.parse(JSON.stringify(makeCharacter())), version: 2 };
    expect(parseCharacter(input)).toMatchObject({
      ok: false,
      error: expect.stringContaining('version'),
    });
  });
});
