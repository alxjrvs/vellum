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
  });

  it('emits CSS custom properties for typography tokens', () => {
    const vars = themeToCssVars(daggerheartTheme);
    expect(vars['--font-family-display']).toContain('Cinzel');
    expect(vars['--font-size-base']).toBe('16px');
    expect(vars['--font-size-heading']).toBe('28px');
  });

  it('emits CSS custom properties for layout tokens', () => {
    const vars = themeToCssVars(daggerheartTheme);
    expect(vars['--spacing-md']).toBe('16px');
    expect(vars['--radius-sm']).toBe('4px');
    expect(vars['--border-width']).toBe('2px');
  });
});
