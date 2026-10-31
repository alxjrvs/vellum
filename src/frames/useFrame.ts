import { useContext } from 'react';
import { FrameContext, type FrameContextValue } from './FrameContext';

export function useFrame(): FrameContextValue {
  const ctx = useContext(FrameContext);
  if (!ctx) throw new Error('useFrame must be used inside a <FrameProvider>');
  return ctx;
}
