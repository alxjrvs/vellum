import type { ReactNode } from 'react';
import { SystemContext } from './SystemContext';
import type { SystemConfig } from './types';

interface SystemProviderProps {
  system: SystemConfig;
  children: ReactNode;
}

export function SystemProvider({ system, children }: SystemProviderProps) {
  return <SystemContext.Provider value={system}>{children}</SystemContext.Provider>;
}
