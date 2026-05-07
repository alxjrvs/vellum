import type { CharacterState } from './types';

export const STORAGE_KEY = 'vellum:character';

export function readCharacterFromStorage(
  storage: Pick<Storage, 'getItem'> = localStorage
): CharacterState | null {
  const raw = storage.getItem(STORAGE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as CharacterState;
  } catch {
    return null;
  }
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
