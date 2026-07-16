import { describe, expect, it } from 'vitest';
import { themeToCssVars } from './cssVars';
import { daggerheartTheme } from './daggerheart.theme';

describe('themeToCssVars', () => {
  it('emits CSS custom properties for every color token, kebab-cased and color-prefixed', () => {
    const vars = themeToCssVars(daggerheartTheme);
    expect(vars['--color-parchment']).toBe('#f3e6c4');
    expect(vars['--color-ink']).toBe('#1a1208');
    expect(vars['--color-card-surface']).toBe('rgba(243, 230, 196, 0.96)');
    expect(vars['--color-ink-muted']).toBe('#5a4a32');
    expect(vars['--color-accent']).toBe('#c2612f');
  });

  it('emits CSS custom properties for the new HUD/heart color tokens', () => {
    const vars = themeToCssVars(daggerheartTheme);
    expect(vars['--color-health']).toBe('#e4443a');
    expect(vars['--color-steel']).toBe('#7fa0c4');
    expect(vars['--color-hud-surface']).toBe('rgba(22, 15, 7, 0.74)');
    expect(vars['--color-hud-surface-strong']).toBe('rgba(14, 9, 4, 0.9)');
    expect(vars['--color-hud-border']).toBe('rgba(201, 161, 74, 0.55)');
  });

  it('emits CSS custom properties for typography tokens', () => {
    const vars = themeToCssVars(daggerheartTheme);
    expect(vars['--font-family-display']).toContain('Cinzel');
    expect(vars['--font-size-base']).toBe('24px');
    expect(vars['--font-size-heading']).toBe('40px');
    expect(vars['--font-size-label']).toBe('19px');
    expect(vars['--font-size-title']).toBe('72px');
  });

  it('emits CSS custom properties for layout tokens', () => {
    const vars = themeToCssVars(daggerheartTheme);
    expect(vars['--spacing-md']).toBe('16px');
    expect(vars['--spacing-xl']).toBe('40px');
    expect(vars['--radius-sm']).toBe('4px');
    expect(vars['--border-width']).toBe('2px');
    expect(vars['--pip-size']).toBe('30px');
    expect(vars['--heart-size']).toBe('52px');
  });
});
