import { useSyncExternalStore } from 'react';
import { stageScale } from './stageScale';

function subscribe(onChange: () => void): () => void {
  window.addEventListener('resize', onChange);
  return () => window.removeEventListener('resize', onChange);
}

function currentScale(): number {
  if (typeof window === 'undefined') return 1;
  return stageScale(window.innerWidth, window.innerHeight);
}

/**
 * The live fit-to-viewport scale for the design canvas, recomputed whenever the
 * viewport changes. OBS resizes the browser source's viewport in place when its
 * width/height properties are edited, so this updates without a refresh.
 */
export function useStageScale(): number {
  return useSyncExternalStore(subscribe, currentScale, () => 1);
}
