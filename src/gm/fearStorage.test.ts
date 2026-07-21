import { afterEach, describe, expect, it } from 'vitest';
import { FEAR_STORAGE_KEY, readFearFromStorage, writeFearToStorage } from './fearStorage';
import { STORAGE_KEY } from '../character/storage';
import { makeCharacter } from '../character/fixtures';

afterEach(() => {
  localStorage.clear();
});

describe('fear storage', () => {
  it('reads 0 when nothing is stored and no character exists', () => {
    expect(readFearFromStorage()).toBe(0);
  });

  it('round-trips a written value', () => {
    writeFearToStorage(7);
    expect(readFearFromStorage()).toBe(7);
  });

  it('persists 0 rather than falling back to the legacy seed', () => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(
        makeCharacter({ stats: { hope: 0, fear: 9, hp: [], stress: [], armorSlots: [] } })
      )
    );
    writeFearToStorage(0);
    expect(readFearFromStorage()).toBe(0);
  });

  it('seeds once from a legacy character record when its own key is absent', () => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(
        makeCharacter({ stats: { hope: 0, fear: 4, hp: [], stress: [], armorSlots: [] } })
      )
    );
    expect(readFearFromStorage()).toBe(4);
  });

  it('falls back to 0 for a malformed stored value', () => {
    localStorage.setItem(FEAR_STORAGE_KEY, 'not-a-number');
    expect(readFearFromStorage()).toBe(0);
  });
});
