import { useEffect, useMemo } from 'react';
import { reportDeckState } from './deckLink';
import type { DeckState } from './protocol';

/** Report part of what this page shows to the Stream Deck plugin, whenever it changes. */
export function useDeckReport(state: DeckState): void {
  // Report on content, not identity: callers build a fresh object every render.
  const key = JSON.stringify(state);
  const stable = useMemo(() => JSON.parse(key) as DeckState, [key]);
  useEffect(() => {
    reportDeckState(stable);
  }, [stable]);
}
