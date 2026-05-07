import { createContext, type Dispatch } from 'react';
import type { CharacterAction } from './reducer';
import type { CharacterState } from './types';

export interface CharacterContextValue {
  character: CharacterState | null;
  dispatch: Dispatch<CharacterAction>;
}

export const CharacterContext = createContext<CharacterContextValue | null>(null);
