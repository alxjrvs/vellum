import { useContext } from 'react';
import { SystemContext } from './SystemContext';
import type { SystemConfig } from './types';

export function useSystem(): SystemConfig {
  const ctx = useContext(SystemContext);
  if (!ctx) {
    throw new Error('useSystem must be used inside a <SystemProvider>');
  }
  return ctx;
}
