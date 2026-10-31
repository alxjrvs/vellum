import { parseCharacter } from './parseCharacter';
import type { CharacterState } from './types';

export const STORAGE_KEY = 'vellum:character';

export function readCharacterFromStorage(
  storage: Pick<Storage, 'getItem'> = localStorage
): CharacterState | null {
  const raw = storage.getItem(STORAGE_KEY);
  if (!raw) return null;
  let value: unknown;
  try {
    value = JSON.parse(raw);
  } catch {
    return null;
  }
  // Stored data can be anything: a hand edit, a half-written record, an older
  // schema. Validate (and migrate) it like an imported file, so a bad record
  // means "no character yet" instead of a HUD that crashes on load.
  const result = parseCharacter(value);
  return result.ok ? result.character : null;
}

export function writeCharacterToStorage(
  character: CharacterState | null,
  storage: Pick<Storage, 'setItem' | 'removeItem'> = localStorage
): void {
  if (character === null) {
    storage.removeItem(STORAGE_KEY);
    return;
  }
  storage.setItem(STORAGE_KEY, JSON.stringify(character));
}
