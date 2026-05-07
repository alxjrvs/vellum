import type { CharacterState } from './types';

export type CharacterAction =
  | { type: 'SET_CHARACTER'; character: CharacterState }
  | { type: 'CLEAR_CHARACTER' }
  | { type: 'HOPE_INCREMENT'; max: number }
  | { type: 'HOPE_DECREMENT' }
  | { type: 'HP_TOGGLE_SLOT'; index: number }
  | { type: 'STRESS_TOGGLE_SLOT'; index: number };

export function characterReducer(
  state: CharacterState | null,
  action: CharacterAction
): CharacterState | null {
  switch (action.type) {
    case 'SET_CHARACTER':
      return action.character;
    case 'CLEAR_CHARACTER':
      return null;
    case 'HOPE_INCREMENT':
      if (!state) return state;
      return {
        ...state,
        stats: { ...state.stats, hope: Math.min(state.stats.hope + 1, action.max) },
      };
    case 'HOPE_DECREMENT':
      if (!state) return state;
      return {
        ...state,
        stats: { ...state.stats, hope: Math.max(state.stats.hope - 1, 0) },
      };
    case 'HP_TOGGLE_SLOT':
      if (!state) return state;
      return {
        ...state,
        stats: { ...state.stats, hp: toggleIndex(state.stats.hp, action.index) },
      };
    case 'STRESS_TOGGLE_SLOT':
      if (!state) return state;
      return {
        ...state,
        stats: { ...state.stats, stress: toggleIndex(state.stats.stress, action.index) },
      };
  }
}

function toggleIndex(slots: readonly number[], index: number): readonly number[] {
  return slots.includes(index) ? slots.filter((i) => i !== index) : [...slots, index];
}
