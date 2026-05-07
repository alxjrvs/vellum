import { useContext } from 'react';
import { CharacterContext, type CharacterContextValue } from './CharacterContext';

export function useCharacter(): CharacterContextValue {
  const ctx = useContext(CharacterContext);
  if (!ctx) {
    throw new Error('useCharacter must be used inside a <CharacterProvider>');
  }
  return ctx;
}
