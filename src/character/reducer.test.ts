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

  describe('HOPE_SET', () => {
    it('sets hope to the supplied value', () => {
      const character = makeCharacter({ stats: { hope: 2, hp: [], stress: [], armorSlots: [] } });
      const next = characterReducer(character, { type: 'HOPE_SET', value: 5, max: 6 });
      expect(next?.stats.hope).toBe(5);
    });

    it('clamps to the supplied max', () => {
      const character = makeCharacter({ stats: { hope: 4, hp: [], stress: [], armorSlots: [] } });
      const next = characterReducer(character, { type: 'HOPE_SET', value: 9, max: 6 });
      expect(next?.stats.hope).toBe(6);
    });

    it('clamps at 0 (negative values floor)', () => {
      const character = makeCharacter({ stats: { hope: 4, hp: [], stress: [], armorSlots: [] } });
      const next = characterReducer(character, { type: 'HOPE_SET', value: -3, max: 6 });
      expect(next?.stats.hope).toBe(0);
    });

    it('returns null state unchanged', () => {
      expect(characterReducer(null, { type: 'HOPE_SET', value: 3, max: 6 })).toBeNull();
    });
  });

  describe('HP_SET', () => {
    it('fills a contiguous range [0..count-1]', () => {
      const character = makeCharacter({
        slotCounts: { hp: 6, stress: 6, armorSlots: 3 },
        stats: { hope: 2, hp: [], stress: [], armorSlots: [] },
      });
      const next = characterReducer(character, { type: 'HP_SET', count: 3 });
      expect(next?.stats.hp).toEqual([0, 1, 2]);
    });

    it('replaces the previous range rather than toggling', () => {
      const character = makeCharacter({
        slotCounts: { hp: 6, stress: 6, armorSlots: 3 },
        stats: { hope: 2, hp: [0, 1, 2, 3], stress: [], armorSlots: [] },
      });
      const next = characterReducer(character, { type: 'HP_SET', count: 1 });
      expect(next?.stats.hp).toEqual([0]);
    });

    it('clamps count to slotCounts.hp (over-full requests fill the whole track)', () => {
      const character = makeCharacter({
        slotCounts: { hp: 6, stress: 6, armorSlots: 3 },
        stats: { hope: 2, hp: [], stress: [], armorSlots: [] },
      });
      const next = characterReducer(character, { type: 'HP_SET', count: 99 });
      expect(next?.stats.hp).toEqual([0, 1, 2, 3, 4, 5]);
    });

    it('empties the track when count is 0', () => {
      const character = makeCharacter({
        slotCounts: { hp: 6, stress: 6, armorSlots: 3 },
        stats: { hope: 2, hp: [0, 1, 2], stress: [], armorSlots: [] },
      });
      const next = characterReducer(character, { type: 'HP_SET', count: 0 });
      expect(next?.stats.hp).toEqual([]);
    });

    it('returns null state unchanged', () => {
      expect(characterReducer(null, { type: 'HP_SET', count: 3 })).toBeNull();
    });
  });

  describe('STRESS_SET', () => {
    it('fills a contiguous range [0..count-1]', () => {
      const character = makeCharacter({
        slotCounts: { hp: 6, stress: 6, armorSlots: 3 },
        stats: { hope: 2, hp: [], stress: [], armorSlots: [] },
      });
      const next = characterReducer(character, { type: 'STRESS_SET', count: 4 });
      expect(next?.stats.stress).toEqual([0, 1, 2, 3]);
    });

    it('clamps count to slotCounts.stress', () => {
      const character = makeCharacter({
        slotCounts: { hp: 6, stress: 6, armorSlots: 3 },
        stats: { hope: 2, hp: [], stress: [], armorSlots: [] },
      });
      const next = characterReducer(character, { type: 'STRESS_SET', count: 99 });
      expect(next?.stats.stress).toEqual([0, 1, 2, 3, 4, 5]);
    });

    it('empties the track when count is 0', () => {
      const character = makeCharacter({
        slotCounts: { hp: 6, stress: 6, armorSlots: 3 },
        stats: { hope: 2, hp: [], stress: [0, 1], armorSlots: [] },
      });
      const next = characterReducer(character, { type: 'STRESS_SET', count: 0 });
      expect(next?.stats.stress).toEqual([]);
    });

    it('returns null state unchanged', () => {
      expect(characterReducer(null, { type: 'STRESS_SET', count: 3 })).toBeNull();
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

  describe('FEATURE_CONDITION_TOGGLE', () => {
    it('flips an absent feature condition to true', () => {
      const character = makeCharacter();
      const next = characterReducer(character, {
        type: 'FEATURE_CONDITION_TOGGLE',
        name: 'On Fire',
      });
      expect(next?.conditions.feature['On Fire']).toBe(true);
    });

    it('flips an active feature condition to false', () => {
      const character = makeCharacter({
        conditions: {
          core: { hidden: false, restrained: false, vulnerable: false },
          feature: { 'On Fire': true },
        },
      });
      const next = characterReducer(character, {
        type: 'FEATURE_CONDITION_TOGGLE',
        name: 'On Fire',
      });
      expect(next?.conditions.feature['On Fire']).toBe(false);
    });

    it('does not affect other feature conditions when toggling one', () => {
      const character = makeCharacter({
        conditions: {
          core: { hidden: false, restrained: false, vulnerable: false },
          feature: { 'On Fire': true, Stunned: true },
        },
      });
      const next = characterReducer(character, {
        type: 'FEATURE_CONDITION_TOGGLE',
        name: 'On Fire',
      });
      expect(next?.conditions.feature).toEqual({ 'On Fire': false, Stunned: true });
    });

    it('returns null state unchanged', () => {
      expect(
        characterReducer(null, { type: 'FEATURE_CONDITION_TOGGLE', name: 'On Fire' })
      ).toBeNull();
    });
  });
});
