import { useLayoutEffect, type ReactNode } from 'react';
import { ThemeContext } from './ThemeContext';
import type { ThemeConfig } from './types';
import { themeToCssVars } from './cssVars';

interface ThemeProviderProps {
  theme: ThemeConfig;
  children: ReactNode;
}

export function ThemeProvider({ theme, children }: ThemeProviderProps) {
  useLayoutEffect(() => {
    const root = document.documentElement;
    const vars = themeToCssVars(theme);
    const previous: Record<string, string> = {};
    for (const [name, value] of Object.entries(vars)) {
      previous[name] = root.style.getPropertyValue(name);
      root.style.setProperty(name, value);
    }
    return () => {
      for (const [name, prev] of Object.entries(previous)) {
        if (prev) root.style.setProperty(name, prev);
        else root.style.removeProperty(name);
      }
    };
  }, [theme]);
  return <ThemeContext.Provider value={theme}>{children}</ThemeContext.Provider>;
}
