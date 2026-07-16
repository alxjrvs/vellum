# Vellum — Brand System

> **The character sheet, on camera.**

Vellum is a local-only, system-aware camera overlay for tabletop RPGs. It renders a live character HUD — Hope, HP, Stress, Armor, conditions, identity — over a player's webcam feed, so a remote table's mechanical state lives on each player's face in the video call instead of in an off-camera browser tab. No backend, no accounts, no telemetry, no network after load. Built data-driven so any game system is a config and a set of components, not a rewrite.

This document defines the _project_ identity — README, website, logo, social — as its own system, harmonious with but distinct from the in-app Daggerheart theme (`#f3e6c4` / `#1a1208` / `#c9a14a` / `#c2612f` / `#a62828`, Cinzel + Inter). In-app themes belong to their game systems; the brand belongs to Vellum.

---

## 1. The name

**Vellum** is fine parchment prepared for writing — the surface of the manuscript, the material of the character sheet, the thing you inscribe an identity onto. Timeless, tactile, a little scholarly.

It has a second meaning that is the spine of this brand: in drafting, _vellum_ is the **translucent overlay sheet** laid over a drawing to add a layer without touching the original. That is literally what this software is — a translucent layer of story laid over a camera feed. The page and the overlay, in one word.

Every visual decision below derives from one of those two meanings: the prepared page (warm surface, ruled lines, ink, gilding) or the overlay (layering, folds, translucency, restraint).

## 2. Positioning

**One line:** Vellum puts the character sheet on camera — a local-only, system-aware HUD layered over your webcam for the virtual table.

**Personality (4 words):** _calm, precise, warm, craftsmanlike._

- **Calm** — Vellum is ambient table information, not an interrogation. It never shouts; it is simply present.
- **Precise** — one render frame, one localStorage write, one canvas. Numbers and claims are exact.
- **Warm** — manuscript warmth: parchment, ink, gold. Human hands made this for a table of friends.
- **Craftsmanlike** — an open workshop tool. Composable, documented, honest about its edges.

### Voice & tone

Write like a good rulebook sidebar: plain declarative sentences, second person, no hype. Specific beats clever. Privacy claims are stated as mechanics, not marketing.

|           | Example                                                                          |
| --------- | -------------------------------------------------------------------------------- |
| **Do**    | "Your stats live on your camera, where your table is already looking."           |
| **Do**    | "Local-only: no accounts, no telemetry, nothing leaves your machine after load." |
| **Don't** | "Revolutionize your sessions with the ultimate next-gen streaming companion!!"   |
| **Don't** | "We take your privacy seriously." (Don't reassure — describe the mechanism.)     |

Terminology: prefer _table_, _session_, _system_, _frame_, _overlay_, _HUD_. Avoid _platform-as-a-service_ language (_users_, _engagement_, _content_) and avoid faux-archaic fantasy voice (_thy character sheet awaits_) — the manuscript register lives in the visuals, not the copy.

## 3. Tagline

Candidates:

1. **"The character sheet, on camera."** ← _recommended._ Plain, true, and the whole pitch in six words.
2. "Wear your character sheet." — punchier, good for social cards.
3. "A layer of story over every camera." — leans on the overlay meaning; good for the website hero subhead.
4. "Every stat, on every face at the table." — emphasizes the shared-ambient-info value.
5. "Local, legible, yours." — values-forward; good as a closing beat, too abstract to lead.

Use #1 as the canonical tagline; #3 and #5 work as supporting lines on the site.

## 4. Color

Every color is named from the scriptorium — the crafts and materials of actual manuscript-making. This keeps the palette grounded in the subject rather than generic "brand gold / brand red."

All contrast ratios are WCAG 2.1, verified against the treatment background. See `palette.svg` for the visual sheet.

### Brand core

| Name          | Hex       | Role                                                                                                                                                                                                                                              |
| ------------- | --------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Vellum**    | `#F6EFDE` | The page. Light-treatment background; primary text on dark. Deliberately paler and quieter than the in-app parchment `#f3e6c4` — the brand is the blank page, the game theme is the written one.                                                  |
| **Iron Gall** | `#1C1510` | The ink. Named for iron-gall ink, the standard manuscript ink for a millennium — a warm brown-black, never pure `#000`. Dark-treatment background; primary text on light (15.7:1, AAA).                                                           |
| **Gilt**      | `#C9A14A` | Illumination gold. Identical to the in-app Daggerheart gold — the one deliberate bridge token between brand and app. On dark: links, accents, gold text (7.5:1, AAA). On light: **ornament only** (2.1:1 — fails as text); use Gilt Deep instead. |
| **Gilt Deep** | `#7D6120` | Gold for text and links on light backgrounds (5.1:1, AA).                                                                                                                                                                                         |

### Accents & semantic

| Name                 | Hex       | Role                                                                                                                                                                          |
| -------------------- | --------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Rubric**           | `#9E2B2B` | Danger / destructive / emphasis on light (6.5:1, AA). Named for rubrication — the red ink scribes reserved for headings and warnings. That is exactly what a semantic red is. |
| **Rubric Bright**    | `#D96A5A` | Rubric's dark-treatment counterpart (5.3:1, AA).                                                                                                                              |
| **Ember**            | `#C2612F` | Warmth and energy; the second bridge to the app theme. Accent and large-text only in both treatments (3.6:1 light, 4.3:1 dark).                                               |
| **Ember Deep**       | `#96431A` | Ember as body-size text on light (5.9:1, AA).                                                                                                                                 |
| **Verdigris**        | `#3E7360` | Success / confirmation on light (4.8:1, AA). Named for the green pigment of manuscript illumination.                                                                          |
| **Verdigris Bright** | `#7FB89F` | Success on dark (8.0:1, AAA).                                                                                                                                                 |

### Neutrals

| Name                 | Hex       | Role                                                                                                                                                                                    |
| -------------------- | --------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Vellum Shade**     | `#EAE0C6` | Raised/inset surfaces, code blocks, table stripes on light.                                                                                                                             |
| **Sepia**            | `#5C5140` | Secondary text on light (6.8:1, AA).                                                                                                                                                    |
| **Plummet**          | `#8A7E6C` | Hairline rules and borders in **both** treatments. Named for the lead point scribes used to rule guide lines on the page before writing — which is precisely this color's job (see §7). |
| **Parchment Dim**    | `#B5A88D` | Secondary text on dark (7.7:1, AAA).                                                                                                                                                    |
| **Iron Gall Raised** | `#282017` | Raised surfaces, cards, code blocks on dark. Gilt holds 6.6:1 (AA) on it.                                                                                                               |

### Treatments

- **Light:** Vellum ground, Iron Gall text, Sepia secondary, Gilt Deep links, Plummet rules, Vellum Shade surfaces. Gilt appears only as ornament (the mark, rules' terminals, decorative details).
- **Dark:** Iron Gall ground, Vellum text, Parchment Dim secondary, Gilt links and accents (this is where the gold sings), Plummet rules, Iron Gall Raised surfaces.

Both treatments are warm end-to-end — never mix in cool grays or pure black/white. The GitHub README should look correct in both; prefer assets with transparent backgrounds plus the `#gh-dark-mode-only` / `picture` + `prefers-color-scheme` source-switch pattern for the wordmark.

## 5. Typography

| Role          | Face                                                                                                                       | Why                                                                                                                                                                                                                                                                     | Fallback                                |
| ------------- | -------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------- |
| **Display**   | [Fraunces](https://fonts.google.com/specimen/Fraunces) (variable; use the `opsz` axis, weights 500–640, `SOFT 0` `WONK 0`) | An old-style serif with modern engineering — warm and bookish at display sizes without cosplaying as a medieval font. It is deliberately _not_ Cinzel: the app's game theme keeps its engraved capitals; the brand reads as a contemporary tool with a manuscript soul. | `Georgia, 'Times New Roman', serif`     |
| **Body / UI** | [Inter](https://fonts.google.com/specimen/Inter) (400 / 500 / 600)                                                         | Already the app's body face — continuity where it counts, and unbeatable screen legibility for docs.                                                                                                                                                                    | `-apple-system, 'Segoe UI', sans-serif` |
| **Code**      | [JetBrains Mono](https://fonts.google.com/specimen/JetBrainsMono) (400 / 700)                                              | Vellum is a developer-facing platform; config examples are first-class brand surfaces.                                                                                                                                                                                  | `'SF Mono', Consolas, monospace`        |

All three are free (Google Fonts / OFL), so the website can self-host them under a strict CSP.

### Type scale

Major-third ratio (1.25), 16px base. Fraunces for the top three steps only; Inter below.

| Step    | Size / line | Face & use                                                    |
| ------- | ----------- | ------------------------------------------------------------- |
| Display | 61 / 1.05   | Fraunces 600, `opsz` 60+ — hero headline only                 |
| H1      | 49 / 1.1    | Fraunces 600                                                  |
| H2      | 39 / 1.15   | Fraunces 560                                                  |
| H3      | 25 / 1.3    | Inter 600                                                     |
| H4      | 20 / 1.4    | Inter 600                                                     |
| Body    | 16 / 1.6    | Inter 400                                                     |
| Small   | 14 / 1.5    | Inter 400 — captions, metadata                                |
| Micro   | 12.5 / 1.4  | Inter 500, +2% letterspacing, uppercase — eyebrows and labels |

Display/H1 tracking: −1%. Never letterspace Fraunces lowercase; reserve wide tracking for Micro caps (an echo of the wordmark's letterspaced capitals).

## 6. Logo & wordmark

**Concept: the folded V.** A single gold band folds once and becomes a V — the initial, drawn as material. The fold says _overlay_: two layers of one translucent sheet, the darker facet where they overlap. The base is cut flat like the chisel edge of a broad calligraphy nib — the tool you write on vellum with. One glyph, both meanings of the name.

The wordmark sets that gold V beside **ELLUM** in custom constructed monoline capitals — drawn as raw SVG paths, so the files are fully self-contained (no font dependency, no external fetch, CSP-safe) and the letterforms belong to no one else. The M's apexes come to points; everything else is rectilinear except the U's single bowl. Letterspaced wide, like an inscription.

### Files

| File                 | Use                                                                                |
| -------------------- | ---------------------------------------------------------------------------------- |
| `wordmark-light.svg` | Iron Gall letters + gold V — for light backgrounds                                 |
| `wordmark-dark.svg`  | Vellum letters + gold V — for dark backgrounds                                     |
| `favicon.svg`        | The folded V alone on an Iron Gall rounded tile — favicon, app icon, social avatar |

### Usage

- **Clear space:** keep a margin of at least the V's width (the height of the capitals) on all sides. The SVGs' built-in padding is the minimum.
- **Minimum sizes:** wordmark ≥ 140px wide; below that, use the favicon mark. The mark holds at 16×16.
- **Backgrounds:** the wordmarks sit on flat Vellum/Iron Gall (or white/very dark). On mid-tone or busy grounds, use the tiled favicon mark instead — the tile carries its own contrast.
- **Favicon:** ship the SVG directly (`<link rel="icon" type="image/svg+xml" href="/favicon.svg">`); the dark tile reads in both light and dark browser chrome. Render 32/16px PNG fallbacks from it for legacy contexts.

### Don'ts

- Don't recolor the V's three gold facets, flatten them to one gold, or add gradients/shadows/outlines.
- Don't set "Vellum" in Fraunces or Cinzel _as a logo_ — typeset mentions are fine; the wordmark is the drawn one.
- Don't rebuild the letterforms from a font, stretch, slant, or re-space them.
- Don't place the gold V on Gilt or other mid-value golds/yellows.
- Don't animate the mark beyond a simple fade; the brand is calm.

## 7. Graphic language

The signature device beyond the mark is the **ruling line**: scribes ruled every vellum page with a plummet before writing a word — faint guide lines drawn so the story lands straight. Vellum (the tool) is the same gesture: quiet structure laid down so play can happen on top.

- Use 1px Plummet hairlines as section rules, table borders, and dividers. Terminals may carry a small Gilt tick or the fold-triangle motif — sparingly, at most once per view.
- Prefer ruled structure over boxes: underlines and hairline grids, not heavy cards. Radius is small (6–8px) when a surface is needed.
- Translucency is thematic: layered panels at high opacity (90–95%) over imagery echo the overlay. Never stack more than two layers.
- No parchment textures, torn edges, blur-heavy glassmorphism, or drop shadows deeper than 1–2px. The manuscript register comes from color, type, and ruling — not from skeuomorphism.

---

_Assets in this directory are original work for the Vellum project. Verified contrast figures were computed with WCAG 2.1 relative luminance; re-verify if you adjust any hex value._
