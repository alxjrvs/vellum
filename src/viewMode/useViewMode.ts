import { useSyncExternalStore } from 'react';

import { SCENES, SYSTEM_ID, type ViewMode } from './routes';

export { SCENES, SYSTEM_ID, type ViewMode };

function isScene(value: string): value is ViewMode {
  return (SCENES as readonly string[]).includes(value);
}

// `/daggerheart/gm`, `/daggerheart/gm/` or `/daggerheart/gm/index.html` (file://).
const SCENE_SUFFIX = new RegExp(`${SYSTEM_ID}/([^/]+)(?:/(?:index\\.html)?)?$`);

/**
 * The directory the app is mounted at, with a trailing slash: `/app/`,
 * `/app/v0.3.0/`, or `/` in dev. Scene paths hang off it, so the same build
 * works wherever it is deployed. The build writes a copy of index.html into
 * each scene directory so a scene path loads without server rewrites.
 */
export function appRoot(pathname: string = window.location.pathname): string {
  const root = pathname.replace(SCENE_SUFFIX, '');
  return root.endsWith('/') ? root : root.replace(/[^/]*$/, '');
}

/** Canonical path for a scene: `/app/daggerheart/player/`. */
export function scenePath(scene: ViewMode, pathname?: string): string {
  // file:// has no directory index, so name the file there.
  const file = window.location.protocol === 'file:' ? 'index.html' : '';
  return `${appRoot(pathname)}${SYSTEM_ID}/${scene}/${file}`;
}

/** Absolute URL for a scene, with an optional query string (no leading `?`). */
export function sceneUrl(scene: ViewMode, query = ''): string {
  return `${window.location.origin}${scenePath(scene)}${query ? `?${query}` : ''}`;
}

function sceneFromPath(pathname: string): ViewMode | null {
  const match = pathname.match(SCENE_SUFFIX);
  return match?.[1] !== undefined && isScene(match[1]) ? match[1] : null;
}

/**
 * Parse a scene out of an old `#/daggerheart/gm` or `#/gm` hash. Only used to
 * redirect links made before path routing.
 */
function sceneFromLegacyHash(hash: string): ViewMode | null {
  if (!hash.startsWith('#/')) return null;
  const segments = hash.slice(2).split('/').filter(Boolean);
  const last = segments[segments.length - 1];
  return last !== undefined && isScene(last) ? last : null;
}

/** Legacy `?mode=gm` / `?mode=player` support so old OBS URLs keep working. */
function sceneFromLegacyQuery(search: string): ViewMode | null {
  const mode = new URLSearchParams(search).get('mode');
  return mode !== null && isScene(mode) ? mode : null;
}

/**
 * Rewrite a pre-path-routing URL (`/app/#/daggerheart/gm`, `/app/?mode=gm`)
 * to its scene path in place, keeping the rest of the query. OBS sources made
 * before the switch keep working. Returns true when it rewrote the URL.
 */
export function migrateLegacyRoute(): boolean {
  const { pathname, search, hash } = window.location;
  if (sceneFromPath(pathname)) return false;
  const scene = sceneFromLegacyHash(hash) ?? sceneFromLegacyQuery(search);
  if (!scene) return false;
  const params = new URLSearchParams(search);
  params.delete('mode');
  const query = params.toString();
  const keepHash = sceneFromLegacyHash(hash) ? '' : hash;
  window.history.replaceState(
    window.history.state,
    '',
    `${scenePath(scene, pathname)}${query ? `?${query}` : ''}${keepHash}`
  );
  return true;
}

/**
 * The active scene, or `null` when the URL addresses none — the bare `/app/`
 * route. `null` is a real state, not a fallback: it renders the game + role
 * selector so the app is navigable without hand-typing a path.
 */
function currentScene(): ViewMode | null {
  if (typeof window === 'undefined') return null;
  return (
    sceneFromPath(window.location.pathname) ??
    sceneFromLegacyHash(window.location.hash) ??
    sceneFromLegacyQuery(window.location.search)
  );
}

function subscribe(onChange: () => void): () => void {
  window.addEventListener('popstate', onChange);
  return () => window.removeEventListener('popstate', onChange);
}

/** Resolve the active scene from the URL path, re-rendering on navigation. */
export function useViewMode(): ViewMode | null {
  return useSyncExternalStore(subscribe, currentScene, () => null);
}
