import { describe, expect, it } from 'vitest';
import { themeToCssVars } from './cssVars';
import { daggerheartTheme } from './daggerheart.theme';

describe('themeToCssVars', () => {
  it('emits CSS custom properties for every color token, kebab-cased and color-prefixed', () => {
    const vars = themeToCssVars(daggerheartTheme);
    expect(vars['--color-plate']).toBe('#1b140b');
    expect(vars['--color-plate-raised']).toBe('#2a2013');
    expect(vars['--color-label']).toBe('#e2d3ad');
    expect(vars['--color-signal-ink']).toBe('#1a1208');
    expect(vars['--color-nameplate']).toBe('#f3e6c4');
  });

  it('emits a token for every chassis color the frame overrides', () => {
    const vars = themeToCssVars(daggerheartTheme);
    for (const name of Object.keys(daggerheartTheme.colors)) {
      const kebab = name.replace(/[A-Z]/g, (m) => `-${m.toLowerCase()}`);
      expect(vars[`--color-${kebab}`]).toBeDefined();
    }
  });

  it('emits CSS custom properties for typography tokens', () => {
    const vars = themeToCssVars(daggerheartTheme);
    expect(vars['--font-family-display']).toContain('Barlow Condensed');
    expect(vars['--font-size-base']).toBe('26px');
    expect(vars['--font-size-label']).toBe('40px');
    expect(vars['--font-size-value']).toBe('64px');
  });

  it('emits CSS custom properties for layout tokens', () => {
    const vars = themeToCssVars(daggerheartTheme);
    expect(vars['--spacing-md']).toBe('18px');
    expect(vars['--spacing-xl']).toBe('48px');
    expect(vars['--track-height']).toBe('24px');
    expect(vars['--edge-width']).toBe('14px');
  });

  it('does not emit the per-stat track display choices as CSS', () => {
    const vars = themeToCssVars(daggerheartTheme);
    expect(Object.keys(vars).some((k) => k.includes('hope'))).toBe(false);
  });
});
