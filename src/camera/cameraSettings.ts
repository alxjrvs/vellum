/**
 * Camera and face tracking are off unless the player turns them on. Settings
 * are remembered per browser; copied OBS links carry them as query params, so
 * the OBS source (which has its own storage) gets the same setup.
 */
export interface CameraSettings {
  /** Vellum draws the webcam itself, behind the HUD. */
  readonly camera: boolean;
  /** Face-anchored widgets follow the face. Needs `camera`. */
  readonly followFace: boolean;
  /** Selfie view: flip the picture left to right. */
  readonly mirror: boolean;
}

export const DEFAULT_CAMERA_SETTINGS: CameraSettings = {
  camera: false,
  followFace: false,
  mirror: true,
};

export const CAMERA_STORAGE_KEY = 'vellum:camera';

const PARAMS = { camera: 'camera', followFace: 'face', mirror: 'mirror' } as const;

function readStored(): Partial<CameraSettings> {
  try {
    const raw = localStorage.getItem(CAMERA_STORAGE_KEY);
    if (!raw) return {};
    const parsed: unknown = JSON.parse(raw);
    if (typeof parsed !== 'object' || parsed === null) return {};
    const out: Partial<Record<keyof CameraSettings, boolean>> = {};
    for (const key of Object.keys(PARAMS) as (keyof CameraSettings)[]) {
      const value = (parsed as Record<string, unknown>)[key];
      if (typeof value === 'boolean') out[key] = value;
    }
    return out;
  } catch {
    return {};
  }
}

function readUrl(search: string): Partial<CameraSettings> {
  const params = new URLSearchParams(search);
  const out: Partial<Record<keyof CameraSettings, boolean>> = {};
  for (const [key, param] of Object.entries(PARAMS) as [keyof CameraSettings, string][]) {
    const value = params.get(param);
    if (value === '1') out[key] = true;
    if (value === '0') out[key] = false;
  }
  return out;
}

/** URL params win over the stored choice, which wins over the defaults. */
export function readCameraSettings(search: string = window.location.search): CameraSettings {
  return { ...DEFAULT_CAMERA_SETTINGS, ...readStored(), ...readUrl(search) };
}

export function writeCameraSettings(settings: CameraSettings): void {
  try {
    localStorage.setItem(CAMERA_STORAGE_KEY, JSON.stringify(settings));
  } catch {
    // Storage blocked: the settings last for this session only.
  }
}

/** Query params for the settings that differ from the defaults (`camera=1&face=1`). */
export function cameraQuery(settings: CameraSettings): string {
  return (Object.entries(PARAMS) as [keyof CameraSettings, string][])
    .filter(([key]) => settings[key] !== DEFAULT_CAMERA_SETTINGS[key])
    .map(([key, param]) => `${param}=${settings[key] ? '1' : '0'}`)
    .join('&');
}
