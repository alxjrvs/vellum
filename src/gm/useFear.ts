import { useCallback, useState } from 'react';
import { readFearFromStorage, writeFearToStorage } from './fearStorage';

interface FearControls {
  readonly fear: number;
  readonly setFear: (value: number) => void;
}

/**
 * The GM's Fear pool, persisted to its own localStorage key. Values are clamped
 * to `[0, max]` on write so callers can pass raw deltas.
 */
export function useFear(max: number): FearControls {
  // Clamp on read too, not just on write: a stored value can exceed `max` via a
  // hand-edited key or a legacy `stats.fear` from a larger track, which would
  // otherwise render more filled pips than the track has and leave "+" enabled.
  const [fear, setFearState] = useState(() => Math.min(readFearFromStorage(), max));

  const setFear = useCallback(
    (value: number) => {
      const clamped = Math.max(0, Math.min(value, max));
      setFearState(clamped);
      writeFearToStorage(clamped);
    },
    [max]
  );

  return { fear, setFear };
}
