/** The player's chosen frame, remembered per browser (and per OBS source profile). */
export const FRAME_STORAGE_KEY = 'vellum:frame';

/** The URL query parameter that pins a frame, so an OBS source needs no setup. */
export const FRAME_QUERY_PARAM = 'frame';

export function readFrameFromUrl(search: string = window.location.search): string | null {
  const value = new URLSearchParams(search).get(FRAME_QUERY_PARAM);
  return value && value.length > 0 ? value : null;
}

export function readStoredFrame(): string | null {
  try {
    return localStorage.getItem(FRAME_STORAGE_KEY);
  } catch {
    return null;
  }
}

export function writeStoredFrame(id: string): void {
  try {
    localStorage.setItem(FRAME_STORAGE_KEY, id);
  } catch {
    // Storage blocked: the choice lasts for this session only.
  }
}
