import { readFileSync } from 'node:fs';
import { defineConfig } from 'vitest/config';
import type { Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import { MEDIAPIPE_DIR } from '@vellum/tracking/assets';
import { routePages } from './src/routes/routePages';

/**
 * Face tracking runs entirely on the device, so its WASM runtime and model ship
 * with the app under `mediapipe-<version>/` (versioned, so it can be cached
 * forever). Served from node_modules in dev, emitted into dist on build.
 */
function mediapipeAssets(): Plugin {
  const wasm = 'node_modules/@mediapipe/tasks-vision/wasm';
  const files: Record<string, string> = {
    [`${MEDIAPIPE_DIR}/vision_wasm_module_internal.js`]: `${wasm}/vision_wasm_module_internal.js`,
    [`${MEDIAPIPE_DIR}/vision_wasm_module_internal.wasm`]: `${wasm}/vision_wasm_module_internal.wasm`,
    [`${MEDIAPIPE_DIR}/blaze_face_short_range.tflite`]:
      'vendor/mediapipe/blaze_face_short_range.tflite',
  };
  const types: Record<string, string> = {
    js: 'text/javascript',
    wasm: 'application/wasm',
    tflite: 'application/octet-stream',
  };
  return {
    name: 'vellum-mediapipe-assets',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const path = decodeURIComponent((req.url ?? '').split('?')[0]).replace(/^\//, '');
        const source = files[path];
        if (!source) return next();
        res.setHeader(
          'Content-Type',
          types[path.split('.').pop() ?? ''] ?? 'application/octet-stream'
        );
        res.end(readFileSync(source));
      });
    },
    generateBundle() {
      for (const [fileName, source] of Object.entries(files)) {
        this.emitFile({ type: 'asset', fileName, source: readFileSync(source) });
      }
    },
  };
}

/**
 * Frames are plain paths (`/app/frames/daggerheart-gm/`), and the app is
 * static with no server rewrites, so each route gets its own copy of
 * index.html with its relative asset URLs pointed two directories up.
 */
function routeCopies(): Plugin {
  return {
    name: 'vellum-route-pages',
    apply: 'build',
    enforce: 'post',
    generateBundle(_options, bundle) {
      const index = bundle['index.html'];
      if (!index || index.type !== 'asset') return;
      const html = String(index.source).replaceAll('="./', '="../../');
      for (const page of routePages()) {
        this.emitFile({ type: 'asset', fileName: `${page}/index.html`, source: html });
      }
    },
  };
}

// Chromium-only target — OBS CEF (Chromium 103+) and modern desktop Chromium browsers.
// `base: './'` is mandatory for file:// safety (architecture §8.3); do not change.
export default defineConfig({
  plugins: [react(), mediapipeAssets(), routeCopies()],
  base: './',
  build: {
    target: 'chrome103',
    sourcemap: true,
  },
  server: {
    port: 5173,
    strictPort: true,
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/setupTests.ts'],
    css: false,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      include: ['src/**/*.{ts,tsx}', 'packages/*/src/**/*.ts'],
      exclude: ['**/*.test.{ts,tsx}', 'src/setupTests.ts', 'src/main.tsx'],
    },
  },
});
