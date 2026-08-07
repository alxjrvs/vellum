import { describe, expect, it } from 'vitest';
import { STAGE_HEIGHT, STAGE_WIDTH, stageScale } from './stageScale';

describe('stageScale', () => {
  it('is 1:1 at the design canvas size', () => {
    expect(stageScale(STAGE_WIDTH, STAGE_HEIGHT)).toBe(1);
  });

  it('shrinks the canvas to fit a smaller browser source', () => {
    // The failure this replaces: a 1280-wide source rendered a 1920-wide
    // layout and clipped everything past 1280.
    expect(stageScale(1280, 720)).toBeCloseTo(2 / 3);
  });

  it("fits OBS's own 800x600 browser-source default", () => {
    // 800/1920 = 0.4167 binds before 600/1080 = 0.5556.
    expect(stageScale(800, 600)).toBeCloseTo(800 / 1920);
  });

  it('grows the canvas to fill a larger source rather than islanding it', () => {
    expect(stageScale(2560, 1440)).toBeCloseTo(4 / 3);
  });

  it('letterboxes on the binding axis for a non-16:9 source', () => {
    // Tall and narrow: width binds, so the extra height stays transparent.
    expect(stageScale(960, 1080)).toBeCloseTo(0.5);
    // Short and wide: height binds.
    expect(stageScale(1920, 540)).toBeCloseTo(0.5);
  });

  it('falls back to 1:1 for a viewport that has not been measured yet', () => {
    expect(stageScale(0, 0)).toBe(1);
    expect(stageScale(Number.NaN, Number.NaN)).toBe(1);
  });
});
