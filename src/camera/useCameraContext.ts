import { useContext } from 'react';
import { CameraContext, type CameraContextValue } from './CameraContext';

/** The camera settings and stream, or null outside a CameraProvider. */
export function useCameraContext(): CameraContextValue | null {
  return useContext(CameraContext);
}
