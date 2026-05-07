import { describe, expect, it } from 'vitest';
import { characterReducer } from './reducer';
import { makeCharacter } from './fixtures';

describe('characterReducer', () => {
  it('SET_CHARACTER replaces null state with the provided character', () => {
    const character = makeCharacter();
    expect(characterReducer(null, { type: 'SET_CHARACTER', character })).toEqual(character);
  });

  it('SET_CHARACTER replaces an existing character', () => {
    const previous = makeCharacter({ identity: { name: 'Old', class: 'Bard', ancestry: 'Elf' } });
    const next = makeCharacter({ identity: { name: 'New', class: 'Wizard', ancestry: 'Human' } });
    expect(characterReducer(previous, { type: 'SET_CHARACTER', character: next })).toEqual(next);
  });

  it('CLEAR_CHARACTER returns null', () => {
    const character = makeCharacter();
    expect(characterReducer(character, { type: 'CLEAR_CHARACTER' })).toBeNull();
  });
});
