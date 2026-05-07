import { createContext } from 'react';
import type { SystemConfig } from './types';

export const SystemContext = createContext<SystemConfig | null>(null);
