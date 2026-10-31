/** Start the face detector on its own module worker. */
export function createFaceWorker(): Worker {
  return new Worker(new URL('./faceWorker.ts', import.meta.url), { type: 'module' });
}
