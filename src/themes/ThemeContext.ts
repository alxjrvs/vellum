import { createContext } from 'react';
import type { ThemeConfig } from './types';

export const ThemeContext = createContext<ThemeConfig | null>(null);
