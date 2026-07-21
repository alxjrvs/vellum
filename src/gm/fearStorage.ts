import { readCharacterFromStorage } from '../character/storage';

export const FEAR_STORAGE_KEY = 'vellum:fear';

/**
 * Fear is GM state, not character state: a GM runs the Fear pool without ever
 * filling in a character sheet. It therefore lives in its own localStorage key
 * (like the ticker) rather than inside the character record, so the GM scene
 * renders with zero configuration.
 */
export function readFearFromStorage(storage: Pick<Storage, 'getItem'> = localStorage): number {
  const raw = storage.getItem(FEAR_STORAGE_KEY);
  if (raw === null) return seedFromLegacyCharacter(storage);
  const value = Number.parseInt(raw, 10);
  return Number.isFinite(value) && value >= 0 ? value : 0;
}

export function writeFearToStorage(
  value: number,
  storage: Pick<Storage, 'setItem'> = localStorage
): void {
  storage.setItem(FEAR_STORAGE_KEY, String(value));
}

/**
 * Migration seed: before Fear had its own key it was persisted as
 * `character.stats.fear`. Seed from there so an existing GM's pool survives the
 * move. Nothing writes `stats.fear` any more, so this only ever reads — but it
 * applies on *any* read while `vellum:fear` is absent, not strictly once, so
 * clearing that key re-seeds from the legacy value rather than resetting to 0.
 */
function seedFromLegacyCharacter(storage: Pick<Storage, 'getItem'>): number {
  const legacy = readCharacterFromStorage(storage)?.stats.fear;
  return typeof legacy === 'number' && legacy >= 0 ? legacy : 0;
}
