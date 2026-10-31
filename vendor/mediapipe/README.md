# MediaPipe face model

`blaze_face_short_range.tflite` is Google's BlazeFace short-range Face
Detector model (float16, version 1), from
`storage.googleapis.com/mediapipe-models/face_detector/blaze_face_short_range/float16/1/`.
It is licensed under the Apache License 2.0.

It is bundled, with the `@mediapipe/tasks-vision` WASM runtime, by the
`mediapipeAssets` plugin in `vite.config.ts`, so face tracking loads nothing
from the network. Camera frames never leave the device.
