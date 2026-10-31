/**
 * The pinned `@mediapipe/tasks-vision` version (package.json pins it exactly).
 * It names the served folder, so a new runtime gets a new URL and the old one
 * can be cached forever.
 */
export const MEDIAPIPE_VERSION = '1.2.0';

/** Where the face-tracking runtime and model are served, relative to the app. */
export const MEDIAPIPE_DIR = `mediapipe-${MEDIAPIPE_VERSION}`;
export const FACE_MODEL_FILE = 'blaze_face_short_range.tflite';
