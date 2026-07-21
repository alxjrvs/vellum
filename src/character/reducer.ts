import type { CharacterState } from './types';
import type { CoreConditionId } from '../systems/types';

export type CharacterAction =
  | { type: 'SET_CHARACTER'; character: CharacterState }
  | { type: 'CLEAR_CHARACTER' }
  | { type: 'HOPE_SET'; value: number; max: number }
  | { type: 'HP_SET'; count: number }
  | { type: 'STRESS_SET'; count: number }
  | { type: 'ARMOR_TOGGLE_SLOT'; index: number }
  | { type: 'CONDITION_TOGGLE'; condition: CoreConditionId }
  | { type: 'FEATURE_CONDITION_TOGGLE'; name: string };

export function characterReducer(
  state: CharacterState | null,
  action: CharacterAction
): CharacterState | null {
  switch (action.type) {
    case 'SET_CHARACTER':
      return action.character;
    case 'CLEAR_CHARACTER':
      return null;
    case 'HOPE_SET':
      if (!state) return state;
      return {
        ...state,
        stats: { ...state.stats, hope: clamp(action.value, 0, action.max) },
      };
    case 'HP_SET':
      if (!state) return state;
      return {
        ...state,
        stats: { ...state.stats, hp: filledRange(action.count, state.slotCounts.hp) },
      };
    case 'STRESS_SET':
      if (!state) return state;
      return {
        ...state,
        stats: { ...state.stats, stress: filledRange(action.count, state.slotCounts.stress) },
      };
    case 'ARMOR_TOGGLE_SLOT':
      if (!state) return state;
      return {
        ...state,
        stats: { ...state.stats, armorSlots: toggleIndex(state.stats.armorSlots, action.index) },
      };
    case 'CONDITION_TOGGLE':
      if (!state) return state;
      return {
        ...state,
        conditions: {
          ...state.conditions,
          core: {
            ...state.conditions.core,
            [action.condition]: !state.conditions.core[action.condition],
          },
        },
      };
    case 'FEATURE_CONDITION_TOGGLE':
      if (!state) return state;
      return {
        ...state,
        conditions: {
          ...state.conditions,
          feature: {
            ...state.conditions.feature,
            [action.name]: !state.conditions.feature[action.name],
          },
        },
      };
  }
}

function toggleIndex(slots: readonly number[], index: number): readonly number[] {
  return slots.includes(index) ? slots.filter((i) => i !== index) : [...slots, index];
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(value, max));
}

/**
 * A "level" track is filled cumulatively from the left, so its marked slots
 * are always the contiguous indices `[0, 1, … count-1]`. Setting the dial to
 * N fills the N slots behind it; the count is clamped to the track length.
 */
function filledRange(count: number, length: number): readonly number[] {
  return Array.from({ length: clamp(count, 0, length) }, (_, i) => i);
}
