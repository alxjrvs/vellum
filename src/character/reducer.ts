import type { CharacterState } from './types';

export type CharacterAction =
  | { type: 'SET_CHARACTER'; character: CharacterState }
  | { type: 'CLEAR_CHARACTER' };

export function characterReducer(
  _state: CharacterState | null,
  action: CharacterAction
): CharacterState | null {
  switch (action.type) {
    case 'SET_CHARACTER':
      return action.character;
    case 'CLEAR_CHARACTER':
      return null;
  }
}
