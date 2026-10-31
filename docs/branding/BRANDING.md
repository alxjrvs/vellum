# Vellum — Design System

> **Your characters, at a glance.**

Vellum is a local-only, system-aware camera overlay for tabletop RPGs. It renders a live character HUD — Hope, HP, Stress, Armor, conditions, identity — over a player's webcam, so a remote table's mechanical state lives on each player's video tile instead of in an off-camera tab. No backend, no accounts, no telemetry.

This document defines the **one design system** shared by vellumhud.com, the app's setup screens, and every in-game HUD. The look is a sports-broadcast graphics package: solid slanted plates, big tabular numbers, a nameplate for each player.

---

## 1. How the system is built

Three layers, one set of token names:

| Layer              | What it owns                                                                                     | Where it lives                                 |
| ------------------ | ------------------------------------------------------------------------------------------------ | ---------------------------------------------- |
| **Chassis**        | Default colors, faces, the slant. The site uses it as-is.                                        | `src/themes/vellum.tokens.css`                 |
| **HUD primitives** | Plate, track (bar or chits), nameplate, condition chip, slanted button. Shared shapes and rules. | `src/components/*`                             |
| **Frames**         | A per-game skin: colors, sizes, and bar-vs-chits per stat. Never new token names.                | `src/themes/<game>.theme.ts` (a `ThemeConfig`) |

The site (`apps/site`, Astro + Starlight) imports the chassis file directly from `src/themes/vellum.tokens.css`, and re-skins Starlight's docs with the same tokens (`apps/site/src/styles/starlight.css`). The legacy `site/` links it through a symlink until it is retired. The app imports it first, then `ThemeProvider` writes the active frame's tokens over it on `:root`. A frame re-skins the chassis; it cannot change the layout or break the two rules below.

## 2. The two rules every frame keeps

These are hard requirements. `src/themes/frameRules.ts` checks the measurable parts and the official frames are tested against it.

### Labels are always readable

- **Size:** at least 2.1% of frame width — **40px on the 1920 canvas**, about 13px on a 640×360 Discord tile. Values are bigger still (64px).
- **Contrast:** labels hold **7:1 or better** against their plate. Chassis labels are Soft on Plate at 10.8:1.
- **Backing:** a label sits on a solid plate, never straight on video. Inactive or disabled things dim by color, never by opacity.

### Everything reads outside-in

- Each widget reads from the nearest frame edge toward the face.
- **Left side:** label, value, track. **Right side, mirrored:** track, value, label.
- Accent edges and slants sit on the outer edge too, so the whole HUD frames the player.
- Right-hand HUD regions carry `data-side="right"`; components mirror inside them. Top-center and bottom-center widgets read left to right as normal.

## 3. Wordmark: the Nameplate

The logo is a HUD nameplate: a slanted white plate with a Signal-yellow edge, **VELLUM** in Barlow Condensed Black Italic. It is the same shape the app draws for every player's name, so the brand and the product are literally one object.

| File                 | Use                                                             |
| -------------------- | --------------------------------------------------------------- |
| `wordmark-dark.svg`  | White plate, Night letters — for dark backgrounds (the default) |
| `wordmark-light.svg` | Night plate, white letters — for light backgrounds              |
| `favicon.svg`        | The nameplate reduced to its edge and a V on a Night tile       |

Letters are outlined to paths, so the files need no font.

- **Never split the name with color.** The accent lives on the edge, not inside the word.
- Keep the slant at 12°; don't stretch, re-space, or set the wordmark in another face.
- Minimum width 96px; below that use the favicon.

## 4. Color

Chassis values. Frames override any of these names (see `daggerheart.theme.ts`). Contrast is WCAG 2.1 against Plate `#171C26`.

| Token                   | Hex       | Role                                          | On Plate |
| ----------------------- | --------- | --------------------------------------------- | -------- |
| `--color-night`         | `#0D1016` | Page and setup ground                         |          |
| `--color-plate`         | `#171C26` | Every HUD plate and card                      |          |
| `--color-plate-raised`  | `#202736` | Inputs, chips, hover                          |          |
| `--color-rule`          | `#2A3242` | Hairlines, empty track segments               |          |
| `--color-text`          | `#F5F7FA` | Values, primary text                          | 15.9:1   |
| `--color-label`         | `#C6CEDB` | Labels (Soft)                                 | 10.8:1   |
| `--color-muted`         | `#9AA4B5` | Tertiary text only — **never a label**        | 6.8:1    |
| `--color-signal`        | `#FFC83D` | "Yours": Hope, active state, primary action   | 11.0:1   |
| `--color-signal-ink`    | `#0D1016` | Text on Signal (12.3:1)                       |          |
| `--color-hit`           | `#FF4D5E` | Damage only. A fill and edge color, not text. | 5.3:1    |
| `--color-stress`        | `#FF8A3D` | Stress                                        | 7.3:1    |
| `--color-armor`         | `#7FA0C4` | Armor                                         | 6.3:1    |
| `--color-fear`          | `#A98BFF` | The GM's Fear. Never a player's color.        | 6.4:1    |
| `--color-nameplate`     | `#F5F7FA` | Nameplate fill (and the wordmark plate)       |          |
| `--color-nameplate-ink` | `#0D1016` | Nameplate text (17.7:1)                       |          |
| `--color-player`        | `#3DDC97` | The player's own edge color                   | 9.7:1    |

Stat colors are fills. Anything a viewer must read is Text or Label on a plate.

## 5. Type

| Role             | Face                         | Use                                                                |
| ---------------- | ---------------------------- | ------------------------------------------------------------------ |
| Display / labels | **Barlow Condensed** 600–900 | Headings and values in 800–900 italic caps; HUD labels in 700 caps |
| Body / UI        | **Barlow** 400–600           | Running text, sub-plates, form fields                              |
| Data / code      | **IBM Plex Mono** 400–500    | Code samples, technical captions                                   |

All three are OFL. The app self-hosts them via `@fontsource` (latin subsets) so OBS needs no network; the site loads them from Google Fonts.

HUD sizes on the 1920 canvas (official frame): label 40px, value 64px, heading 52px, nameplate 76px, body 26px.

## 6. HUD primitives

- **Plate.** Solid `--color-plate`, square corners, no shadow. Plates stack with a 2px gap like a lower-third.
- **Edge.** A 14px colored bar on a plate's outer side: the player's color on vitals and nameplate, the stat or state color on chips.
- **Track.** `StatTrack` draws a stat one of two ways, chosen per stat by the frame (`tracks` in `ThemeConfig`):
  - **Chits:** separate slanted tiles with a small gap.
  - **Bar:** one continuous slanted bar split into hairline segments, so every position stays clickable.
    Empty positions are Rule; filled ones take the stat color. Damage thresholds show as a notch after that position.
- **Nameplate.** Name on the white plate in heavy italic caps; a dark sub-plate underneath for class and heritage; the player's edge on the left.
- **Condition chip.** Plate with a colored outer edge. Active chips get Hit on the edge and full Text; inactive chips stay readable in Label.
- **Slanted button.** Primary actions are Signal plates cut to a parallelogram (`clip-path`), heavy italic caps.
- **The slant.** `--slant: -12deg` on the left of the screen, `--slant-mirror: 12deg` on the right.

## 7. Frames

A frame is a `ThemeConfig`: `colors`, `typography`, `layout`, and `tracks`. Example (`daggerheart.theme.ts`): warm plates, a parchment nameplate, a gilt player edge, HP/Hope/Armor/Fear as chits and Stress as a bar.

To make a frame: copy an official one, change token values and `tracks`, and run the tests. `validateFrame` fails the build if labels drop below 40px or 7:1.

## 8. Voice

Write like a good rulebook sidebar: plain declarative sentences, second person, no hype. Specific beats clever. Privacy claims are stated as mechanics ("nothing leaves your machine"), not reassurance. Broadcast energy lives in the visuals; the copy stays calm.

Prefer _table_, _session_, _system_, _frame_, _overlay_, _HUD_. Avoid _users_, _engagement_, _content_, and faux-archaic fantasy voice.

---

_Contrast figures use WCAG 2.1 relative luminance. Re-verify if you change a value; `frameRules.ts` does it for frames automatically._
