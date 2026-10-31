import type { FrameKind } from '../themes/types';

/**
 * Whether a screen has been launched is kept per kind of frame: a GM launching
 * the Fear view says nothing about whether a player has launched their HUD,
 * and the two can be open in the same browser profile. (The keys predate
 * frames choosing the screen, and are kept so nobody is sent back to setup.)
 */
export function launchStorageKey(scene: FrameKind): string {
  return `vellum:launched:${scene}`;
}

/**
 * `null` means "never recorded" — distinct from an explicit `false`. Callers use
 * it to pick a per-scene default: the player scene treats an existing character
 * as already-launched (so upgrading users aren't sent back through setup), while
 * the GM scene defaults to showing its how-to first.
 */
export function readLaunchedFromStorage(
  scene: FrameKind,
  storage: Pick<Storage, 'getItem'> = localStorage
): boolean | null {
  const raw = storage.getItem(launchStorageKey(scene));
  if (raw === null) return null;
  return raw === 'true';
}

export function writeLaunchedToStorage(
  scene: FrameKind,
  launched: boolean,
  storage: Pick<Storage, 'setItem'> = localStorage
): void {
  storage.setItem(launchStorageKey(scene), String(launched));
}
