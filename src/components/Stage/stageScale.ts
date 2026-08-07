/**
 * The design canvas every scene is laid out against (architecture REQ-027).
 * Typography, pip sizes and the HUD's corner anchors are all authored in these
 * coordinates, so the canvas is a fixed frame — never a fluid one.
 */
export const STAGE_WIDTH = 1920;
export const STAGE_HEIGHT = 1080;

/**
 * The factor that fits the 1920x1080 design canvas inside a viewport of
 * `width` x `height`, preserving aspect ratio (letterboxing on the short axis).
 *
 * An OBS browser source renders at whatever width/height the user typed into
 * its properties, and that is very often not 1920x1080 — OBS's own default is
 * 800x600. Without this the canvas simply overflowed and was clipped, so a
 * narrower source showed the left slice of a 1920-wide layout with the right
 * edge of the UI cut off. Scaling means the source can be any size and still
 * shows the whole, correctly-proportioned HUD.
 *
 * Scaling *up* is allowed on purpose: a 2560x1440 source should fill its frame
 * rather than render a 1920 canvas island in the middle of it.
 */
export function stageScale(width: number, height: number): number {
  if (!(width > 0) || !(height > 0)) return 1;
  return Math.min(width / STAGE_WIDTH, height / STAGE_HEIGHT);
}
