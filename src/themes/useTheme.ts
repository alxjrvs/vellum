import { useContext } from 'react';
import { ThemeContext } from './ThemeContext';
import type { ThemeConfig } from './types';

export function useTheme(): ThemeConfig {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error('useTheme must be used inside a <ThemeProvider>');
  }
  return ctx;
}
