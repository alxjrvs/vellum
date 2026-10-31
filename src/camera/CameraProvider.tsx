import { useCallback, useMemo, useState, type ReactNode } from 'react';
import { CameraContext } from './CameraContext';
import { readCameraSettings, writeCameraSettings, type CameraSettings } from './cameraSettings';
import { useCamera } from './useCamera';

/** Owns the camera settings and, when the camera is on, the webcam stream. */
export function CameraProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<CameraSettings>(() => readCameraSettings());
  const camera = useCamera(settings.camera);

  const update = useCallback((patch: Partial<CameraSettings>) => {
    setSettings((current) => {
      const next = { ...current, ...patch };
      writeCameraSettings(next);
      return next;
    });
  }, []);

  const value = useMemo(() => ({ settings, update, camera }), [settings, update, camera]);
  return <CameraContext.Provider value={value}>{children}</CameraContext.Provider>;
}
