/**
 * Moving the app from alxjrvs.github.io to vellumhud.com changes its origin,
 * and localStorage is per-origin: a plain redirect would land every player on
 * an empty HUD. The old origin is kept alive as a redirect stub that packs its
 * `vellum:*` keys into the URL fragment and sends the player here:
 *
 *   https://vellumhud.com/app/#migrate=<base64url JSON>&to=<encoded #hash>
 *
 * The fragment is never sent to a server, so the data still never leaves the
 * player's machine. On load, {@link applyOriginHandoff} imports the keys and
 * restores the original hash route.
 */

export const HANDOFF_PREFIX = '#migrate=';
const KEY_PREFIX = 'vellum:';

type HandoffStorage = Pick<Storage, 'getItem' | 'setItem' | 'key' | 'length'>;

/** Collect every Vellum key from a storage area (the stub's side). */
export function collectVellumKeys(storage: HandoffStorage): Record<string, string> {
  const out: Record<string, string> = {};
  for (let i = 0; i < storage.length; i += 1) {
    const key = storage.key(i);
    if (key?.startsWith(KEY_PREFIX)) {
      const value = storage.getItem(key);
      if (value !== null) out[key] = value;
    }
  }
  return out;
}

/** Build the fragment the stub redirects to. `hash` is the original route. */
export function encodeHandoff(keys: Record<string, string>, hash: string): string {
  const bytes = new TextEncoder().encode(JSON.stringify(keys));
  let binary = '';
  for (const byte of bytes) binary += String.fromCharCode(byte);
  const payload = btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  return `${HANDOFF_PREFIX}${payload}&to=${encodeURIComponent(hash)}`;
}

/**
 * Parse a handoff fragment. Returns null for anything that is not a well-formed
 * handoff, so a hand-typed or truncated URL is simply ignored.
 */
export function decodeHandoff(
  hash: string
): { readonly keys: Record<string, string>; readonly to: string } | null {
  if (!hash.startsWith(HANDOFF_PREFIX)) return null;
  const [payload = '', ...rest] = hash.slice(HANDOFF_PREFIX.length).split('&to=');
  try {
    let base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
    if (base64.length % 4) base64 += '='.repeat(4 - (base64.length % 4));
    const binary = atob(base64);
    const bytes = Uint8Array.from(binary, (c) => c.charCodeAt(0));
    const parsed: unknown = JSON.parse(new TextDecoder().decode(bytes));
    if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) return null;
    const keys: Record<string, string> = {};
    for (const [key, value] of Object.entries(parsed)) {
      if (key.startsWith(KEY_PREFIX) && typeof value === 'string') keys[key] = value;
    }
    const to = decodeURIComponent(rest.join('&to='));
    return { keys, to: to.startsWith('#') ? to : '' };
  } catch {
    return null;
  }
}

/**
 * Import a handoff, if the current URL carries one, then strip it from the
 * address bar. Keys already present here win: once a player has used the new
 * origin, a stale bookmark to the old one must not roll their HUD back.
 * Returns the number of keys imported.
 */
export function applyOriginHandoff(
  location: Pick<Location, 'hash' | 'pathname' | 'search'> = window.location,
  history: Pick<History, 'replaceState'> = window.history,
  storage: Pick<Storage, 'getItem' | 'setItem'> = localStorage
): number {
  const handoff = decodeHandoff(location.hash);
  if (!handoff) return 0;
  let imported = 0;
  for (const [key, value] of Object.entries(handoff.keys)) {
    if (storage.getItem(key) === null) {
      storage.setItem(key, value);
      imported += 1;
    }
  }
  history.replaceState(null, '', `${location.pathname}${location.search}${handoff.to}`);
  return imported;
}
