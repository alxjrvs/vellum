import { describe, expect, it } from 'vitest';
import pkg from '../package.json?raw';
import { faceToAnchors, smoothAnchors } from './anchors';
import { MEDIAPIPE_VERSION } from './assets';

const face = { box: { x: 0.4, y: 0.3, width: 0.2, height: 0.2 } };

describe('faceToAnchors', () => {
  it('puts the crown above the face and the chin below it, centred', () => {
    const a = faceToAnchors(face, false);
    expect(a.crown.x).toBeCloseTo(0.5);
    expect(a.crown.y).toBeCloseTo(0.2);
    expect(a.chin.x).toBeCloseTo(0.5);
    expect(a.chin.y).toBeCloseTo(0.54);
    expect(a.size).toBeCloseTo(0.2);
  });

  it('mirrors x for a selfie view', () => {
    const off = { box: { ...face.box, x: 0.1 } };
    expect(faceToAnchors(off, false).chin.x).toBeCloseTo(0.2);
    expect(faceToAnchors(off, true).chin.x).toBeCloseTo(0.8);
  });

  it('keeps anchors on the frame', () => {
    const a = faceToAnchors({ box: { x: 0.4, y: 0.02, width: 0.2, height: 0.9 } }, false);
    expect(a.crown.y).toBe(0);
    expect(a.chin.y).toBe(1);
  });
});

describe('smoothAnchors', () => {
  it('starts at the first reading and moves part way toward later ones', () => {
    const a = faceToAnchors(face, false);
    const b = faceToAnchors({ box: { ...face.box, x: 0.6 } }, false);
    expect(smoothAnchors(null, a)).toBe(a);
    const s = smoothAnchors(a, b, 0.5);
    expect(s.chin.x).toBeCloseTo(0.6);
  });
});

describe('MediaPipe assets', () => {
  it('names its folder after the exact pinned runtime version', () => {
    const deps = (JSON.parse(pkg) as { dependencies: Record<string, string> }).dependencies;
    expect(deps['@mediapipe/tasks-vision']).toBe(MEDIAPIPE_VERSION);
  });
});
