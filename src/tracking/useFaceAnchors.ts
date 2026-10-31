import { useEffect, useState } from 'react';
import {
  FACE_LOST_GRACE_MS,
  FACE_MODEL_FILE,
  MEDIAPIPE_DIR,
  createFaceWorker,
  faceToAnchors,
  smoothAnchors,
  type FaceAnchors,
  type FromWorker,
  type ToWorker,
} from '@vellum/tracking';

export type TrackingStatus = 'off' | 'loading' | 'tracking' | 'error';

export interface FaceTracking {
  readonly status: TrackingStatus;
  /** Null while no face is in view (after a short grace period). */
  readonly anchors: FaceAnchors | null;
}

/** Detections per second. Plenty for widgets that glide, and light on CPU. */
const FPS = 15;

/**
 * Tracks the face in `video` on a worker and returns smoothed anchors. Runs
 * only while `enabled`; frames never leave the device.
 */
export function useFaceAnchors(
  video: HTMLVideoElement | null,
  enabled: boolean,
  mirrored: boolean
): FaceTracking {
  const [tracking, setTracking] = useState<FaceTracking>({ status: 'off', anchors: null });

  useEffect(() => {
    if (!enabled || !video) {
      setTracking({ status: 'off', anchors: null });
      return;
    }
    setTracking({ status: 'loading', anchors: null });
    const worker = createFaceWorker();
    const send = (message: ToWorker, transfer: Transferable[] = []) =>
      worker.postMessage(message, transfer);

    let ready = false;
    let busy = false;
    let anchors: FaceAnchors | null = null;
    let lastSeen = 0;

    worker.onmessage = (event: MessageEvent<FromWorker>) => {
      const message = event.data;
      if (message.type === 'ready') {
        ready = true;
        setTracking({ status: 'tracking', anchors: null });
      } else if (message.type === 'error') {
        setTracking({ status: 'error', anchors: null });
      } else {
        busy = false;
        const now = performance.now();
        if (message.face) {
          anchors = smoothAnchors(anchors, faceToAnchors(message.face, mirrored));
          lastSeen = now;
        } else if (anchors && now - lastSeen > FACE_LOST_GRACE_MS) {
          anchors = null;
        } else {
          return;
        }
        setTracking({ status: 'tracking', anchors });
      }
    };
    worker.onerror = () => setTracking({ status: 'error', anchors: null });

    const base = new URL(`${MEDIAPIPE_DIR}/`, document.baseURI);
    send({
      type: 'init',
      wasmBase: base.href.replace(/\/$/, ''),
      modelUrl: new URL(FACE_MODEL_FILE, base).href,
    });

    const timer = window.setInterval(() => {
      // One frame in flight at a time: a slow machine detects less often
      // rather than queueing frames.
      if (!ready || busy || video.readyState < HTMLMediaElement.HAVE_CURRENT_DATA) return;
      busy = true;
      createImageBitmap(video).then(
        (bitmap) => send({ type: 'frame', bitmap, timestamp: performance.now() }, [bitmap]),
        () => {
          busy = false;
        }
      );
    }, 1000 / FPS);

    return () => {
      window.clearInterval(timer);
      worker.terminate();
    };
  }, [video, enabled, mirrored]);

  return tracking;
}
