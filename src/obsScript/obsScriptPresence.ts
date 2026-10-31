/**
 * The Vellum OBS script (obs/vellum.lua) announces itself to every Vellum
 * browser source every few seconds with a `vellum:obs-script` window event
 * whose detail is `{ "version": 1 }`. Hearing it is how setup can say "the
 * script is loaded" instead of asking the player to check.
 */
export const OBS_SCRIPT_EVENT = 'vellum:obs-script';

/** The script announces every 3 s; allow a couple of misses before calling it gone. */
export const OBS_SCRIPT_STALE_MS = 8000;

type Listener = () => void;

let lastSeen: number | null = null;
let version: number | null = null;
const listeners = new Set<Listener>();

function emit(): void {
  for (const listener of listeners) listener();
}

/** Start listening for the script's announcements. Returns an unsubscribe function. */
export function listenForObsScript(
  target: EventTarget = window,
  now: () => number = () => Date.now()
): () => void {
  const onEvent = (event: Event) => {
    const detail = (event as CustomEvent<unknown>).detail;
    const v =
      typeof detail === 'object' && detail !== null
        ? (detail as { version?: unknown }).version
        : undefined;
    lastSeen = now();
    version = typeof v === 'number' && Number.isInteger(v) ? v : null;
    emit();
  };
  target.addEventListener(OBS_SCRIPT_EVENT, onEvent);
  return () => target.removeEventListener(OBS_SCRIPT_EVENT, onEvent);
}

export function subscribeObsScript(listener: Listener): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

/** When the script was last heard, or null if never. */
export function obsScriptLastSeen(): number | null {
  return lastSeen;
}

export function obsScriptVersion(): number | null {
  return version;
}

export function isObsScriptLoaded(now: number = Date.now()): boolean {
  return lastSeen !== null && now - lastSeen < OBS_SCRIPT_STALE_MS;
}

/** Test-only: forget what was heard. */
export function resetObsScriptPresence(): void {
  lastSeen = null;
  version = null;
  emit();
}
