import { useContext, useEffect, useMemo, useReducer, type ReactNode } from 'react';
import { CharacterContext } from './CharacterContext';
import { characterReducer } from './reducer';
import { decodeShareParam } from './shareCode';
import { readCharacterFromStorage, writeCharacterToStorage } from './storage';
import { subscribeCommands } from '../commands/commandBus';
import { SystemContext } from '../systems/SystemContext';
import type { CharacterState } from './types';

const SHARE_PARAM = 'c';

/**
 * Resolve the initial character. A `?c=` share param wins when it decodes to a
 * valid character: it's the setup *transport*, so we consume it (clearing it
 * from the URL via `history.replaceState`) and let the persist effect promote it
 * into localStorage — the live in-session store. Otherwise fall back to storage.
 *
 * A share link is a character, so one that names no frame opens a player
 * frame: FrameProvider reads the param before this consumes it.
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
        const { pathname, hash } = window.location;
        const url = `${pathname}${query ? `?${query}` : ''}${hash}`;
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
  // Read the system optionally: commands need its limits, but a provider
  // rendered without a system (tests, isolated tools) simply takes no commands.
  const hopeMax = useContext(SystemContext)?.hope.max;

  // External inputs (OBS hotkeys, Stream Deck) arrive on the command bus.
  useEffect(() => {
    if (hopeMax === undefined) return;
    return subscribeCommands((command) =>
      dispatch({ type: 'APPLY_COMMAND', command, limits: { hopeMax } })
    );
  }, [hopeMax]);

  useEffect(() => {
    writeCharacterToStorage(character);
  }, [character]);

  const value = useMemo(() => ({ character, dispatch }), [character]);
  return <CharacterContext.Provider value={value}>{children}</CharacterContext.Provider>;
}
