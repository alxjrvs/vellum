import { afterEach, describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ThemeProvider } from './ThemeProvider';
import { useTheme } from './useTheme';
import { daggerheartTheme } from './daggerheart.theme';

afterEach(() => {
  const root = document.documentElement;
  for (const prop of Array.from(root.style)) {
    root.style.removeProperty(prop);
  }
});

function ThemeLabel() {
  const theme = useTheme();
  return <span data-testid="theme-id">{theme.id}</span>;
}

describe('ThemeProvider', () => {
  it('injects theme color tokens as CSS custom properties on :root', () => {
    render(
      <ThemeProvider theme={daggerheartTheme}>
        <ThemeLabel />
      </ThemeProvider>
    );
    const root = document.documentElement;
    expect(root.style.getPropertyValue('--color-parchment')).toBe('#f3e6c4');
    expect(root.style.getPropertyValue('--color-ink')).toBe('#1a1208');
  });

  it('injects typography and layout tokens as CSS custom properties on :root', () => {
    render(
      <ThemeProvider theme={daggerheartTheme}>
        <ThemeLabel />
      </ThemeProvider>
    );
    const root = document.documentElement;
    expect(root.style.getPropertyValue('--font-size-base')).toBe('18px');
    expect(root.style.getPropertyValue('--spacing-md')).toBe('16px');
    expect(root.style.getPropertyValue('--pip-size')).toBe('24px');
  });

  it('exposes the theme to descendants via useTheme()', () => {
    render(
      <ThemeProvider theme={daggerheartTheme}>
        <ThemeLabel />
      </ThemeProvider>
    );
    expect(screen.getByTestId('theme-id')).toHaveTextContent('daggerheart');
  });

  it('removes the injected properties on unmount', () => {
    const { unmount } = render(
      <ThemeProvider theme={daggerheartTheme}>
        <ThemeLabel />
      </ThemeProvider>
    );
    unmount();
    expect(document.documentElement.style.getPropertyValue('--color-parchment')).toBe('');
  });

  it('throws when useTheme is called outside a provider', () => {
    expect(() => render(<ThemeLabel />)).toThrow(/ThemeProvider/);
  });
});
