import { useEffect, useMemo, useReducer, type ReactNode } from 'react';
import { CharacterContext } from './CharacterContext';
import { characterReducer } from './reducer';
import { decodeShareParam } from './shareCode';
import { readCharacterFromStorage, writeCharacterToStorage } from './storage';
import { sceneHash } from '../viewMode/useViewMode';
import type { CharacterState } from './types';

const SHARE_PARAM = 'c';

/**
 * Resolve the initial character. A `?c=` share param wins when it decodes to a
 * valid character: it's the setup *transport*, so we consume it (clearing it
 * from the URL via `history.replaceState`) and let the persist effect promote it
 * into localStorage — the live in-session store. Otherwise fall back to storage.
 *
 * Consuming the param also *addresses a scene* when the link carries none: a
 * share link is a character, which is inherently a player artifact, so it lands
 * on the player HUD rather than the scene selector. This runs in the reducer's
 * lazy initializer — before `App` reads the scene — so the hash is in place by
 * the time `useViewMode` takes its first snapshot. Links generated before the
 * scene hash existed keep working because of this.
 */
function readInitialCharacter(): CharacterState | null {
  if (typeof window !== 'undefined') {
    const params = new URLSearchParams(window.location.search);
    const shared = params.get(SHARE_PARAM);
    if (shared !== null) {
      const result = decodeShareParam(shared);
      if (result.ok) {
        params.delete(SHARE_PARAM);
        const query = params.toString();
        const hash = window.location.hash || sceneHash('player');
        const url = `${window.location.pathname}${query ? `?${query}` : ''}${hash}`;
        window.history.replaceState(window.history.state, '', url);
        return result.character;
      }
    }
  }
  return readCharacterFromStorage();
}

interface CharacterProviderProps {
  children: ReactNode;
}

export function CharacterProvider({ children }: CharacterProviderProps) {
  const [character, dispatch] = useReducer(characterReducer, null, readInitialCharacter);

  useEffect(() => {
    writeCharacterToStorage(character);
  }, [character]);

  const value = useMemo(() => ({ character, dispatch }), [character]);
  return <CharacterContext.Provider value={value}>{children}</CharacterContext.Provider>;
}
