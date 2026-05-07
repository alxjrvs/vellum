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

  describe('HOPE_INCREMENT', () => {
    it('adds 1 to hope', () => {
      const character = makeCharacter({ stats: { hope: 4, hp: [], stress: [], armorSlots: [] } });
      const next = characterReducer(character, { type: 'HOPE_INCREMENT', max: 6 });
      expect(next?.stats.hope).toBe(5);
    });

    it('caps at the supplied max', () => {
      const character = makeCharacter({ stats: { hope: 6, hp: [], stress: [], armorSlots: [] } });
      const next = characterReducer(character, { type: 'HOPE_INCREMENT', max: 6 });
      expect(next?.stats.hope).toBe(6);
    });

    it('returns null state unchanged', () => {
      expect(characterReducer(null, { type: 'HOPE_INCREMENT', max: 6 })).toBeNull();
    });
  });

  describe('HOPE_DECREMENT', () => {
    it('subtracts 1 from hope', () => {
      const character = makeCharacter({ stats: { hope: 4, hp: [], stress: [], armorSlots: [] } });
      const next = characterReducer(character, { type: 'HOPE_DECREMENT' });
      expect(next?.stats.hope).toBe(3);
    });

    it('floors at 0', () => {
      const character = makeCharacter({ stats: { hope: 0, hp: [], stress: [], armorSlots: [] } });
      const next = characterReducer(character, { type: 'HOPE_DECREMENT' });
      expect(next?.stats.hope).toBe(0);
    });

    it('returns null state unchanged', () => {
      expect(characterReducer(null, { type: 'HOPE_DECREMENT' })).toBeNull();
    });
  });

  describe('HP_TOGGLE_SLOT', () => {
    it('marks an unmarked slot', () => {
      const character = makeCharacter({ stats: { hope: 2, hp: [], stress: [], armorSlots: [] } });
      const next = characterReducer(character, { type: 'HP_TOGGLE_SLOT', index: 0 });
      expect(next?.stats.hp).toEqual([0]);
    });

    it('unmarks a marked slot', () => {
      const character = makeCharacter({
        stats: { hope: 2, hp: [0, 1], stress: [], armorSlots: [] },
      });
      const next = characterReducer(character, { type: 'HP_TOGGLE_SLOT', index: 0 });
      expect(next?.stats.hp).toEqual([1]);
    });

    it('preserves other marked slots when toggling one', () => {
      const character = makeCharacter({
        stats: { hope: 2, hp: [0, 2, 4], stress: [], armorSlots: [] },
      });
      const next = characterReducer(character, { type: 'HP_TOGGLE_SLOT', index: 1 });
      expect([...(next?.stats.hp ?? [])].sort()).toEqual([0, 1, 2, 4]);
    });

    it('returns null state unchanged', () => {
      expect(characterReducer(null, { type: 'HP_TOGGLE_SLOT', index: 0 })).toBeNull();
    });
  });

  describe('STRESS_TOGGLE_SLOT', () => {
    it('marks an unmarked slot', () => {
      const character = makeCharacter({ stats: { hope: 2, hp: [], stress: [], armorSlots: [] } });
      const next = characterReducer(character, { type: 'STRESS_TOGGLE_SLOT', index: 0 });
      expect(next?.stats.stress).toEqual([0]);
    });

    it('unmarks a marked slot', () => {
      const character = makeCharacter({
        stats: { hope: 2, hp: [], stress: [0, 1], armorSlots: [] },
      });
      const next = characterReducer(character, { type: 'STRESS_TOGGLE_SLOT', index: 0 });
      expect(next?.stats.stress).toEqual([1]);
    });

    it('preserves other marked slots when toggling one', () => {
      const character = makeCharacter({
        stats: { hope: 2, hp: [], stress: [0, 2, 4], armorSlots: [] },
      });
      const next = characterReducer(character, { type: 'STRESS_TOGGLE_SLOT', index: 1 });
      expect([...(next?.stats.stress ?? [])].sort()).toEqual([0, 1, 2, 4]);
    });

    it('returns null state unchanged', () => {
      expect(characterReducer(null, { type: 'STRESS_TOGGLE_SLOT', index: 0 })).toBeNull();
    });
  });

  describe('ARMOR_TOGGLE_SLOT', () => {
    it('marks an unmarked slot', () => {
      const character = makeCharacter({ stats: { hope: 2, hp: [], stress: [], armorSlots: [] } });
      const next = characterReducer(character, { type: 'ARMOR_TOGGLE_SLOT', index: 0 });
      expect(next?.stats.armorSlots).toEqual([0]);
    });

    it('unmarks a marked slot', () => {
      const character = makeCharacter({
        stats: { hope: 2, hp: [], stress: [], armorSlots: [0, 1] },
      });
      const next = characterReducer(character, { type: 'ARMOR_TOGGLE_SLOT', index: 0 });
      expect(next?.stats.armorSlots).toEqual([1]);
    });

    it('returns null state unchanged', () => {
      expect(characterReducer(null, { type: 'ARMOR_TOGGLE_SLOT', index: 0 })).toBeNull();
    });
  });

  describe('CONDITION_TOGGLE', () => {
    it('flips an inactive core condition to active', () => {
      const character = makeCharacter();
      const next = characterReducer(character, { type: 'CONDITION_TOGGLE', condition: 'hidden' });
      expect(next?.conditions.core.hidden).toBe(true);
    });

    it('flips an active core condition to inactive', () => {
      const character = makeCharacter({
        conditions: {
          core: { hidden: false, restrained: true, vulnerable: false },
          feature: {},
        },
      });
      const next = characterReducer(character, {
        type: 'CONDITION_TOGGLE',
        condition: 'restrained',
      });
      expect(next?.conditions.core.restrained).toBe(false);
    });

    it('does not affect other conditions when toggling one', () => {
      const character = makeCharacter({
        conditions: {
          core: { hidden: true, restrained: false, vulnerable: true },
          feature: {},
        },
      });
      const next = characterReducer(character, {
        type: 'CONDITION_TOGGLE',
        condition: 'restrained',
      });
      expect(next?.conditions.core).toEqual({
        hidden: true,
        restrained: true,
        vulnerable: true,
      });
    });

    it('returns null state unchanged', () => {
      expect(characterReducer(null, { type: 'CONDITION_TOGGLE', condition: 'hidden' })).toBeNull();
    });
  });
});
