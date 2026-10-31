import { describe, expect, it } from 'vitest';
import { contrastRatio, MIN_LABEL_PX, validateFrame } from './frameRules';
import { daggerheartTheme } from './daggerheart.theme';

describe('frameRules', () => {
  it('derives the label floor from 2.1% of the 1920 canvas', () => {
    expect(MIN_LABEL_PX).toBe(40);
  });

  it('computes WCAG contrast ratios', () => {
    expect(contrastRatio('#000000', '#ffffff')).toBeCloseTo(21, 0);
    expect(contrastRatio('#ffffff', '#ffffff')).toBeCloseTo(1, 5);
  });

  it('passes the official Daggerheart frame', () => {
    expect(validateFrame(daggerheartTheme)).toEqual([]);
  });

  it('flags a frame with small or low-contrast labels', () => {
    const bad = {
      ...daggerheartTheme,
      colors: { ...daggerheartTheme.colors, label: '#4a3a22' },
      typography: { ...daggerheartTheme.typography, fontSizeLabel: '19px' },
    };
    const problems = validateFrame(bad);
    expect(problems.some((p) => p.startsWith('fontSizeLabel'))).toBe(true);
    expect(problems.some((p) => p.startsWith('label contrast'))).toBe(true);
  });
});
