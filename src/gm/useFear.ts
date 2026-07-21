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
  const [fear, setFearState] = useState(readFearFromStorage);

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
