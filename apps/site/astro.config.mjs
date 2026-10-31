// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';

// vellumhud.com: marketing pages (src/pages) plus Starlight docs at /docs/.
// The app itself is a separate build served at /app/ by the web Worker.
export default defineConfig({
  site: 'https://vellumhud.com',
  trailingSlash: 'always',
  integrations: [
    starlight({
      title: 'Vellum',
      logo: { src: './src/assets/wordmark-dark.svg', replacesTitle: true },
      favicon: '/favicon.svg',
      social: [{ icon: 'github', label: 'GitHub', href: 'https://github.com/alxjrvs/vellum' }],
      customCss: ['./src/styles/global.css', './src/styles/starlight.css'],
      components: { ThemeSelect: './src/overrides/Empty.astro' },
      editLink: { baseUrl: 'https://github.com/alxjrvs/vellum/edit/main/apps/site/' },
      sidebar: [
        {
          label: 'Get on camera',
          items: [
            { label: 'Quick start', slug: 'docs' },
            { label: 'OBS setup', slug: 'docs/obs' },
            { label: 'Troubleshooting', slug: 'docs/troubleshooting' },
          ],
        },
        {
          label: 'Play',
          items: [
            { label: 'Hotkeys', slug: 'docs/control' },
            { label: 'Face tracking', slug: 'docs/face-tracking' },
          ],
        },
        {
          label: 'Frames',
          items: [
            { label: 'Pick a frame', slug: 'docs/frames' },
            { label: 'Make a frame', slug: 'docs/frames/make' },
            { label: 'The two rules', slug: 'docs/frames/rules' },
            { label: 'Submit to the Library', slug: 'docs/frames/submit' },
          ],
        },
        {
          label: 'About',
          items: [{ label: 'Privacy', slug: 'docs/privacy' }],
        },
      ],
    }),
  ],
});
