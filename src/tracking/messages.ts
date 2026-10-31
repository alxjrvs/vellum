import type { Face } from './anchors';

/** Main thread → face worker. */
export type ToWorker =
  | { readonly type: 'init'; readonly wasmBase: string; readonly modelUrl: string }
  | { readonly type: 'frame'; readonly bitmap: ImageBitmap; readonly timestamp: number };

/** Face worker → main thread. */
export type FromWorker =
  | { readonly type: 'ready' }
  | { readonly type: 'error'; readonly message: string }
  | { readonly type: 'face'; readonly face: Face | null };
