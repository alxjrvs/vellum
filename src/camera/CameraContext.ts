import { createContext } from 'react';
import type { CameraSettings } from './cameraSettings';
import type { CameraState } from './useCamera';

export interface CameraContextValue {
  readonly settings: CameraSettings;
  readonly update: (patch: Partial<CameraSettings>) => void;
  readonly camera: CameraState;
}

export const CameraContext = createContext<CameraContextValue | null>(null);
