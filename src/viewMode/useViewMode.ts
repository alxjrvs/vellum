import { useSyncExternalStore } from 'react';

export type ViewMode = 'player' | 'gm';

/**
 * The system id this build is mounted with. Scene URLs are namespaced by it so
 * the address generalizes to other systems later: `#/daggerheart/gm`.
 */
export const SYSTEM_ID = 'daggerheart';

/** The scenes Daggerheart ships. `player` is the default when nothing is addressed. */
export const SCENES: readonly ViewMode[] = ['player', 'gm'];

function isScene(value: string): value is ViewMode {
  return (SCENES as readonly string[]).includes(value);
}

/**
 * Canonical hash for a scene: `#/daggerheart/player`. Hash routing (not a path
 * route) is deliberate — it keeps `base: './'` intact so the same build runs on
 * GitHub Pages under `/vellum/app/`, from `file://`, and as an OBS browser
 * source with no server rewrites. See docs/architecture.md §8.3.
 */
export function sceneHash(scene: ViewMode): string {
  return `#/${SYSTEM_ID}/${scene}`;
}

/**
 * Parse a scene out of a location hash. Accepts the canonical
 * `#/daggerheart/gm` and the bare `#/gm`; anything else yields null so the
 * caller can fall back. The last path segment wins.
 */
function sceneFromHash(hash: string): ViewMode | null {
  const segments = hash.replace(/^#\/?/, '').split('/').filter(Boolean);
  const last = segments[segments.length - 1];
  return last !== undefined && isScene(last) ? last : null;
}

/** Legacy `?mode=gm` / `?mode=player` support so old OBS URLs keep working. */
function sceneFromLegacyQuery(search: string): ViewMode | null {
  const mode = new URLSearchParams(search).get('mode');
  return mode !== null && isScene(mode) ? mode : null;
}

function currentScene(): ViewMode {
  if (typeof window === 'undefined') return 'player';
  return (
    sceneFromHash(window.location.hash) ?? sceneFromLegacyQuery(window.location.search) ?? 'player'
  );
}

function subscribe(onChange: () => void): () => void {
  window.addEventListener('hashchange', onChange);
  window.addEventListener('popstate', onChange);
  return () => {
    window.removeEventListener('hashchange', onChange);
    window.removeEventListener('popstate', onChange);
  };
}

/**
 * Resolve the active scene from the URL, re-rendering when it changes. Scene
 * precedence: canonical hash → legacy `?mode=` query → `player` default.
 */
export function useViewMode(): ViewMode {
  return useSyncExternalStore(subscribe, currentScene, () => 'player');
}
