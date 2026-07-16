import { CHARACTER_SCHEMA_VERSION } from './types';

/**
 * Upgrades a raw character object by exactly one schema version. A migrator
 * receives an object it may treat as its source version and must return a new
 * object stamped with the next version — never mutating its input.
 */
export type Migrator = (raw: Record<string, unknown>) => Record<string, unknown>;

/**
 * Sentinel version for legacy, pre-versioning payloads. Real-world characters
 * saved to localStorage or shared via URL before the `version` field existed
 * carry no version at all; we treat their absence as version 0 so the standard
 * one-step migration path can lift them to version 1.
 */
export const LEGACY_VERSION = 0;

/**
 * Registry of one-step upgrades keyed by *source* schema version: the entry for
 * key N upgrades a version-N object to version N+1. `migrateToCurrentVersion`
 * chains these in sequence up to {@link CHARACTER_SCHEMA_VERSION}.
 *
 * Adding a future v1 → v2 migration is a single entry: `[1, (raw) => ({ ... })]`
 * (alongside bumping `CHARACTER_SCHEMA_VERSION` in `types.ts`).
 */
export const migrations: ReadonlyMap<number, Migrator> = new Map<number, Migrator>([
  // Legacy (unversioned) → v1: pre-versioning payloads lacked a `version`
  // field. Stamp it as v1 so the existing validator accepts them unchanged.
  [LEGACY_VERSION, (raw) => ({ ...raw, version: 1 })],
]);

/**
 * Read the schema version a raw object claims to be.
 *
 * - A missing/`undefined` version means a legacy pre-versioning payload → {@link LEGACY_VERSION}.
 * - An integer version is taken at face value.
 * - Anything else (non-integer number, wrong type) is uninterpretable → `null`,
 *   signalling that no migration path applies and validation should decide.
 */
function detectVersion(raw: Record<string, unknown>): number | null {
  const version = raw.version;
  if (version === undefined) return LEGACY_VERSION;
  if (typeof version === 'number' && Number.isInteger(version)) return version;
  return null;
}

/**
 * Apply migrations in sequence to lift a raw character object up to
 * {@link CHARACTER_SCHEMA_VERSION}, then return it for the normal validator to
 * check. Never throws and never mutates its input.
 *
 * A current-version object is returned untouched. A legacy (unversioned) object
 * is normalized to v1. An object whose version is newer than the current schema,
 * or older with no registered migrator, is returned as-is so `parseCharacter`
 * rejects it with a helpful, version-specific error.
 */
export function migrateToCurrentVersion(raw: unknown): unknown {
  if (typeof raw !== 'object' || raw === null || Array.isArray(raw)) return raw;

  let current = raw as Record<string, unknown>;
  let version = detectVersion(current);
  if (version === null) return current;

  while (version < CHARACTER_SCHEMA_VERSION) {
    const migrate = migrations.get(version);
    if (!migrate) return current; // no path forward — let validation reject it

    current = migrate(current);

    const next = detectVersion(current);
    // Guard against a migrator that fails to advance the version, so the loop
    // can never spin forever on a malformed registry entry.
    if (next === null || next <= version) return current;
    version = next;
  }

  return current;
}
