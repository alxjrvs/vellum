import { createContext } from 'react';
import type { ThemeConfig } from '../themes/types';

export interface FrameContextValue {
  readonly frame: ThemeConfig;
  /** The frames this system can wear, in picker order: official, community, mine. */
  readonly frames: readonly ThemeConfig[];
  readonly setFrame: (id: string) => void;
  /** Save one of My frames (new or edited) and wear it. */
  readonly saveFrame: (frame: ThemeConfig) => void;
  /** Delete one of My frames. */
  readonly deleteFrame: (id: string) => void;
}

export const FrameContext = createContext<FrameContextValue | null>(null);
