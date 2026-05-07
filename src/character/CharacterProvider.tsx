import { useEffect, useMemo, useReducer, type ReactNode } from 'react';
import { CharacterContext } from './CharacterContext';
import { characterReducer } from './reducer';
import { readCharacterFromStorage, writeCharacterToStorage } from './storage';

interface CharacterProviderProps {
  children: ReactNode;
}

export function CharacterProvider({ children }: CharacterProviderProps) {
  const [character, dispatch] = useReducer(characterReducer, null, () =>
    readCharacterFromStorage()
  );

  useEffect(() => {
    writeCharacterToStorage(character);
  }, [character]);

  const value = useMemo(() => ({ character, dispatch }), [character]);
  return <CharacterContext.Provider value={value}>{children}</CharacterContext.Provider>;
}
