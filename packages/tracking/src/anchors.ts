/** A point on the camera frame, 0–1 from the top-left. */
export interface Point {
  readonly x: number;
  readonly y: number;
}

/** One detected face, normalized to the frame (0–1). */
export interface Face {
  readonly box: {
    readonly x: number;
    readonly y: number;
    readonly width: number;
    readonly height: number;
  };
}

/**
 * Where face-following widgets sit, as fractions of the frame: `crown` just
 * above the head, `chin` just below it. `size` is the face width, so widgets
 * can keep their distance as you lean in or back.
 */
export interface FaceAnchors {
  readonly crown: Point;
  readonly chin: Point;
  readonly size: number;
}

const clamp01 = (n: number) => Math.min(1, Math.max(0, n));

/**
 * The detector's box covers brow to mouth, so the crown sits half a face above
 * it (clear of hair) and the chin a fifth below it. `mirrored` flips x to
 * match a selfie-view camera.
 */
export function faceToAnchors(face: Face, mirrored: boolean): FaceAnchors {
  const { x, y, width, height } = face.box;
  const cx = x + width / 2;
  const fx = mirrored ? 1 - cx : cx;
  return {
    crown: { x: clamp01(fx), y: clamp01(y - height * 0.5) },
    chin: { x: clamp01(fx), y: clamp01(y + height * 1.2) },
    size: clamp01(width),
  };
}

/**
 * Exponential smoothing, so widgets glide instead of jittering with the
 * detector. `alpha` is how far to move toward the new reading (0–1).
 */
export function smoothAnchors(
  previous: FaceAnchors | null,
  next: FaceAnchors,
  alpha = 0.35
): FaceAnchors {
  if (!previous) return next;
  const lerp = (a: number, b: number) => a + (b - a) * alpha;
  const lerpPoint = (a: Point, b: Point) => ({ x: lerp(a.x, b.x), y: lerp(a.y, b.y) });
  return {
    crown: lerpPoint(previous.crown, next.crown),
    chin: lerpPoint(previous.chin, next.chin),
    size: lerp(previous.size, next.size),
  };
}

/** How long widgets hold their place after the face is lost, before going home. */
export const FACE_LOST_GRACE_MS = 1500;
