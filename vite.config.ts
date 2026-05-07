import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

// Chromium-only target — OBS CEF (Chromium 103+) and modern desktop Chromium browsers.
// `base: './'` is mandatory for file:// safety (architecture §8.3); do not change.
export default defineConfig({
  plugins: [react()],
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
      include: ['src/**/*.{ts,tsx}'],
      exclude: ['src/**/*.test.{ts,tsx}', 'src/setupTests.ts', 'src/main.tsx'],
    },
  },
});
