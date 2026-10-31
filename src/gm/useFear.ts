import { useCallback, useEffect, useState } from 'react';
import { subscribeCommands } from '../commands/commandBus';
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

  // External inputs (OBS hotkeys, Stream Deck) can gain or spend Fear too.
  useEffect(
    () =>
      subscribeCommands((command) => {
        if (command.type !== 'track.adjust' && command.type !== 'track.set') return;
        if (command.track !== 'fear') return;
        setFearState((current) => {
          const target = command.type === 'track.adjust' ? current + command.delta : command.value;
          const clamped = Math.max(0, Math.min(target, max));
          writeFearToStorage(clamped);
          return clamped;
        });
      }),
    [max]
  );

  return { fear, setFear };
}
