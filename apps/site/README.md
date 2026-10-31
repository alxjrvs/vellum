# vellumhud.com

The Vellum site: marketing pages (`src/pages`) and docs (`src/content/docs/docs`, Starlight), built with Astro to `dist/`. The app is a separate build served at `/app/`.

It is a Bun workspace of the repo, so install once from the repo root:

```sh
bun install          # at the repo root; covers the app and apps/*
bun run site:dev     # http://localhost:4321
bun run site:build   # → apps/site/dist/
```

- **Design system:** `src/styles/global.css` imports the app's chassis tokens from `src/themes/vellum.tokens.css`; never copy values. See `docs/branding/BRANDING.md`.
- **Feature status:** every feature on the site carries a status (Live, Next, Later) in `src/data/features.ts`. Change it there when something ships.
- **Frame Library cards** are drawn from the app's real frame definitions (`src/data/library.ts`).
