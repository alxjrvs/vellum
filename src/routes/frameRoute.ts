import type { FrameKind } from '../themes/types';
import { FRAMES_SEGMENT, LEGACY_SCENES, LEGACY_SYSTEM_ID, type LegacyScene } from './paths';

// `/frames/ledger`, `/frames/ledger/` or `/frames/ledger/index.html` (file://).
const FRAME_SUFFIX = new RegExp(`${FRAMES_SEGMENT}/([a-z0-9_-]+)(?:/(?:index\\.html)?)?$`);
const LEGACY_SUFFIX = new RegExp(`${LEGACY_SYSTEM_ID}/([^/]+)(?:/(?:index\\.html)?)?$`);

function isLegacyScene(value: string | undefined): value is LegacyScene {
  return (LEGACY_SCENES as readonly (string | undefined)[]).includes(value);
}

/**
 * The directory the app is mounted at, with a trailing slash: `/app/`,
 * `/app/v0.3.0/`, or `/` in dev. Frame paths hang off it, so the same build
 * works wherever it is deployed.
 */
export function appRoot(pathname: string = window.location.pathname): string {
  const root = pathname.replace(FRAME_SUFFIX, '').replace(LEGACY_SUFFIX, '');
  return root.endsWith('/') ? root : root.replace(/[^/]*$/, '');
}

/** Canonical path for a frame: `/app/frames/daggerheart-gm/`. */
export function framePath(id: string, pathname?: string): string {
  // file:// has no directory index, so name the file there.
  const file = window.location.protocol === 'file:' ? 'index.html' : '';
  return `${appRoot(pathname)}${FRAMES_SEGMENT}/${id}/${file}`;
}

/** Absolute URL for a frame, with an optional query string (no leading `?`). */
export function frameUrl(id: string, query = ''): string {
  return `${window.location.origin}${framePath(id)}${query ? `?${query}` : ''}`;
}

/** The frame id the path addresses, if any. */
export function frameIdFromPath(pathname: string = window.location.pathname): string | null {
  return pathname.match(FRAME_SUFFIX)?.[1] ?? null;
}

/** `/app/daggerheart/gm/`, from before frames chose the screen. */
function sceneFromLegacyPath(pathname: string): LegacyScene | null {
  const scene = pathname.match(LEGACY_SUFFIX)?.[1];
  return isLegacyScene(scene) ? scene : null;
}

/** `#/daggerheart/gm` or `#/gm`, from before path routing. */
function sceneFromLegacyHash(hash: string): LegacyScene | null {
  if (!hash.startsWith('#/')) return null;
  const segments = hash.slice(2).split('/').filter(Boolean);
  const last = segments[segments.length - 1];
  return isLegacyScene(last) ? last : null;
}

/** `?mode=gm`, the oldest OBS links. */
function sceneFromLegacyQuery(search: string): LegacyScene | null {
  const mode = new URLSearchParams(search).get('mode') ?? undefined;
  return isLegacyScene(mode) ? mode : null;
}

/**
 * Which HUD an old address asked for. Old links named a screen, not a frame,
 * so the app uses this to pick a frame of that kind. A share link (`?c=`)
 * carries a character, so it asks for a player frame.
 */
export function kindFromLegacyUrl(
  location: Pick<Location, 'pathname' | 'search' | 'hash'> = window.location
): FrameKind | null {
  if (frameIdFromPath(location.pathname)) return null;
  return (
    sceneFromLegacyPath(location.pathname) ??
    sceneFromLegacyHash(location.hash) ??
    sceneFromLegacyQuery(location.search) ??
    (new URLSearchParams(location.search).has('c') ? 'player' : null)
  );
}

/**
 * Put the frame being worn in the address bar, in place: `/app/frames/<id>/`.
 * Old screen addresses, `#/` links and the `frame`/`mode` params they carried
 * are folded into it, and the rest of the query is kept.
 */
export function showFrameInUrl(id: string): void {
  const { pathname, search, hash } = window.location;
  const params = new URLSearchParams(search);
  params.delete('mode');
  params.delete('frame');
  const query = params.toString();
  const keepHash = sceneFromLegacyHash(hash) ? '' : hash;
  const next = `${framePath(id, pathname)}${query ? `?${query}` : ''}${keepHash}`;
  if (next !== `${pathname}${search}${hash}`) {
    window.history.replaceState(window.history.state, '', next);
  }
}
