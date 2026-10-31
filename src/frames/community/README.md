# Community frames

Frames made by players, bundled with Vellum after review. Add one by pull
request: a single `.ts` file exporting a `ThemeConfig` with
`origin: 'community'`, then list it in `src/frames/library.ts`. It must pass
`validateFrame` (labels at least 40px and 7:1 against their plate); the
library test checks every frame.
