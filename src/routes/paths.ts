/**
 * Path pieces shared by the app and the build (vite.config.ts writes a page
 * for each one, since the app is static and has no server rewrites).
 */

/** Every frame has its own address: `/app/frames/<frame id>/`. */
export const FRAMES_SEGMENT = 'frames';

/**
 * The bundled frames, by id. The build writes a page for each; a test keeps
 * this in step with FRAME_LIBRARY (which the build can't import: it pulls in
 * the app's components).
 */
export const BUNDLED_FRAME_IDS: readonly string[] = [
  'daggerheart-player',
  'daggerheart-gm',
  'daggerheart-ledger',
];

/**
 * The page served for a frame id the build doesn't know about (one of My
 * frames). The host rewrites `/app/frames/<id>/` to it; see deploy/_redirects.
 */
export const FRAME_FALLBACK_ID = '_';

/**
 * Addresses from before frames chose the screen: `/app/daggerheart/player/`
 * and `/app/daggerheart/gm/`. The build keeps a page at each so OBS sources
 * pointed at them still load, and the app moves them to a frame address.
 */
export const LEGACY_SYSTEM_ID = 'daggerheart';
export const LEGACY_SCENES = ['player', 'gm'] as const;
export type LegacyScene = (typeof LEGACY_SCENES)[number];
