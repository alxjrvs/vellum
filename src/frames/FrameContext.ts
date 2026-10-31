import { createContext } from 'react';
import type { ThemeConfig } from '../themes/types';

export interface FrameContextValue {
  readonly frame: ThemeConfig;
  /** The frames this system can wear, in picker order. */
  readonly frames: readonly ThemeConfig[];
  readonly setFrame: (id: string) => void;
}

export const FrameContext = createContext<FrameContextValue | null>(null);
