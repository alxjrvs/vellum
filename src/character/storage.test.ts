import { describe, expect, it } from 'vitest';
import { STORAGE_KEY, readCharacterFromStorage, writeCharacterToStorage } from './storage';
import { makeCharacter } from './fixtures';

function makeMemoryStorage(initial: Record<string, string> = {}) {
  const store = new Map<string, string>(Object.entries(initial));
  return {
    getItem: (key: string) => store.get(key) ?? null,
    setItem: (key: string, value: string) => {
      store.set(key, value);
    },
    removeItem: (key: string) => {
      store.delete(key);
    },
    snapshot: () => Object.fromEntries(store),
  };
}

describe('readCharacterFromStorage', () => {
  it('returns null when no value is stored', () => {
    const storage = makeMemoryStorage();
    expect(readCharacterFromStorage(storage)).toBeNull();
  });

  it('parses a stored character', () => {
    const character = makeCharacter();
    const storage = makeMemoryStorage({ [STORAGE_KEY]: JSON.stringify(character) });
    expect(readCharacterFromStorage(storage)).toEqual(character);
  });

  it('returns null on malformed JSON instead of throwing', () => {
    const storage = makeMemoryStorage({ [STORAGE_KEY]: '{not json' });
    expect(readCharacterFromStorage(storage)).toBeNull();
  });
});

describe('writeCharacterToStorage', () => {
  it('serializes the character under the storage key', () => {
    const storage = makeMemoryStorage();
    const character = makeCharacter();
    writeCharacterToStorage(character, storage);
    expect(storage.snapshot()).toEqual({ [STORAGE_KEY]: JSON.stringify(character) });
  });

  it('removes the stored value when given null', () => {
    const character = makeCharacter();
    const storage = makeMemoryStorage({ [STORAGE_KEY]: JSON.stringify(character) });
    writeCharacterToStorage(null, storage);
    expect(storage.snapshot()).toEqual({});
  });
});
