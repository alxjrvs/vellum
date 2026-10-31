import {
  BUNDLED_FRAME_IDS,
  FRAMES_SEGMENT,
  FRAME_FALLBACK_ID,
  LEGACY_SCENES,
  LEGACY_SYSTEM_ID,
} from './paths';

/**
 * The pages a build serves besides the root, each a copy of index.html two
 * directories deep: one per bundled frame (`frames/<id>/`), the fallback the
 * host serves for any other frame id (one of My frames), and the old screen
 * addresses so existing OBS sources keep loading. Used by vite.config.ts and
 * checked by scripts/check-obs-bundle.ts.
 */
export function routePages(): string[] {
  return [
    ...BUNDLED_FRAME_IDS.map((id) => `${FRAMES_SEGMENT}/${id}`),
    `${FRAMES_SEGMENT}/${FRAME_FALLBACK_ID}`,
    ...LEGACY_SCENES.map((scene) => `${LEGACY_SYSTEM_ID}/${scene}`),
  ];
}
