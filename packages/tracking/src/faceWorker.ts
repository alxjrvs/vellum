/// <reference lib="webworker" />
import { FaceDetector, FilesetResolver } from '@mediapipe/tasks-vision';
import type { FromWorker, ToWorker } from './messages';

// Runs the Face Detector off the main thread: detectForVideo is synchronous
// and would otherwise stall the HUD. Frames arrive as ImageBitmaps and never
// leave this device.

let detector: FaceDetector | null = null;

const post = (message: FromWorker) => self.postMessage(message);

self.onmessage = async (event: MessageEvent<ToWorker>) => {
  const message = event.data;
  if (message.type === 'init') {
    try {
      const fileset = await FilesetResolver.forVisionTasks(message.wasmBase, true);
      detector = await FaceDetector.createFromOptions(fileset, {
        baseOptions: { modelAssetPath: message.modelUrl, delegate: 'CPU' },
        runningMode: 'VIDEO',
        minDetectionConfidence: 0.5,
      });
      post({ type: 'ready' });
    } catch (error) {
      post({ type: 'error', message: error instanceof Error ? error.message : String(error) });
    }
    return;
  }

  const { bitmap, timestamp } = message;
  try {
    if (!detector) {
      post({ type: 'face', face: null });
      return;
    }
    const result = detector.detectForVideo(bitmap, timestamp);
    const best = result.detections
      .filter((d) => d.boundingBox)
      .sort((a, b) => (b.categories[0]?.score ?? 0) - (a.categories[0]?.score ?? 0))[0];
    const box = best?.boundingBox;
    post({
      type: 'face',
      face: box
        ? {
            box: {
              x: box.originX / bitmap.width,
              y: box.originY / bitmap.height,
              width: box.width / bitmap.width,
              height: box.height / bitmap.height,
            },
          }
        : null,
    });
  } finally {
    bitmap.close();
  }
};
