import { useEffect, useState } from 'react';

export type CameraStatus =
  /** Not asked for. */
  | 'off'
  | 'starting'
  | 'live'
  /** The browser (or OBS without its launch flag) refused camera access. */
  | 'blocked'
  /** Another app holds the camera, often OBS's own Video Capture Device. */
  | 'busy'
  /** No camera found. */
  | 'missing';

export interface CameraState {
  readonly status: CameraStatus;
  readonly stream: MediaStream | null;
}

const OFF: CameraState = { status: 'off', stream: null };

function statusForError(error: unknown): CameraStatus {
  const name = error instanceof DOMException ? error.name : '';
  if (name === 'NotReadableError' || name === 'AbortError') return 'busy';
  if (name === 'NotFoundError' || name === 'OverconstrainedError') return 'missing';
  return 'blocked';
}

/** Opens the webcam while `enabled`, and releases it when not. */
export function useCamera(enabled: boolean): CameraState {
  const [state, setState] = useState<CameraState>(OFF);

  useEffect(() => {
    if (!enabled) {
      setState(OFF);
      return;
    }
    if (!navigator.mediaDevices?.getUserMedia) {
      // OBS's browser source has no mediaDevices unless OBS runs with
      // --enable-media-stream.
      setState({ status: 'blocked', stream: null });
      return;
    }
    let cancelled = false;
    let stream: MediaStream | null = null;
    setState({ status: 'starting', stream: null });
    navigator.mediaDevices
      .getUserMedia({
        video: { width: { ideal: 1280 }, height: { ideal: 720 }, facingMode: 'user' },
        audio: false,
      })
      .then(
        (s) => {
          if (cancelled) {
            s.getTracks().forEach((t) => t.stop());
            return;
          }
          stream = s;
          setState({ status: 'live', stream: s });
        },
        (error: unknown) => {
          if (!cancelled) setState({ status: statusForError(error), stream: null });
        }
      );
    return () => {
      cancelled = true;
      stream?.getTracks().forEach((t) => t.stop());
    };
  }, [enabled]);

  return state;
}
