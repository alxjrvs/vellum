# Vellum 0.1.0 — "Composable Beta" Roadmap

**Status:** Draft
**Goal:** Take Vellum from a single hardcoded Daggerheart HUD to a **composable, multi-system overlay platform** that other people can extend with their own game systems, scenes, and themes — without forking the core.

> The MVP proved the loop: a real group ran a full Daggerheart session on Vellum instead of Demiplane. 0.1.0 is the first release meant for **someone who isn't in that group** to pick up, run, and extend.

---

## 1. What "composable for other folks" means

Three audiences, three promises:

| Audience                     | Promise                                                                                                              | What they touch                            |
| ---------------------------- | -------------------------------------------------------------------------------------------------------------------- | ------------------------------------------ |
| **Player / GM** (end user)   | Point OBS at a URL, import a character JSON, play.                                                                   | A scene URL + a JSON file. No code.        |
| **System author** (extender) | Add a new game system as a self-contained module — config + a few components — and it shows up as selectable scenes. | One `systems/<id>/` folder. No core edits. |
| **Themer** (styler)          | Restyle any system by supplying a theme (tokens only).                                                               | One theme object. No components.           |

The architectural acceptance test for 0.1.0 (deferred since the PRD, now due): **adding a second system is config + components, not a rewrite.** We prove it by shipping a real second system — even a tiny one — alongside Daggerheart.

---

## 2. The core model: System → Scenes → Widgets

Today the player/GM split is a `?mode=gm` query flag on one app. That does not generalize. The 0.1.0 model makes three concepts first-class:

### System

A self-contained plugin module. Declares everything that makes a game _that game_:

```ts
interface SystemDefinition {
  id: string; // "daggerheart"
  label: string; // "Daggerheart"
  version: string;
  resources: ResourceDef[]; // generic stat-track definitions (was: hope/hp/stress/armor/fear)
  conditions: ConditionSet; // core + feature condition lists
  characterSchema: CharacterSchema; // parse/validate a character JSON for this system
  scenes: SceneDef[]; // the role/position views this system offers
  defaultTheme: ThemeId; // themes are separate & swappable
  dice?: DiceModule; // optional (Daggerheart duality); systems without dice omit it
}
```

### Scene ← _this answers "distinct scenes for different roles/positions?"_

A **scene is a URL-addressable composed HUD for one role or position.** It is the unit an OBS browser source points at. Each participant aims their OBS at exactly one scene.

```ts
interface SceneDef {
  id: string; // "player" | "gm" | "table"
  label: string; // "Player HUD", "GM / Fear"
  role: string; // free-form role tag; systems define their own taxonomy
  widgets: WidgetRef[]; // ordered, positioned widgets that compose the HUD
}
```

- Daggerheart ships `player` (Hope/HP/Stress/Armor/Conditions/Identity) and `gm` (Fear only).
- Addressing (shipped): a **hash route** `#/daggerheart/gm` — hash, not a path route, so `base: './'` stays intact and the same build runs on Pages under `/vellum/app/`, from `file://`, and in OBS with no server rewrites. The bare `#/gm` shorthand also resolves.
- **Back-compat:** `?mode=gm` → `gm`, `?mode=player`/no param → `player`. Old OBS URLs keep working.
- Different systems declare different scenes. A GM-less PbtA system might ship `mc` + `player`. A game with a shared board might ship a `table` scene meant for a screen-share tile, not a webcam. **The role taxonomy belongs to the system, not the core.** This is the whole reason to make scenes first-class rather than hardcoding player/GM.

### Widget

A generic, config-bound HUD component. The MVP already has the seed of this (`StatTrack`). 0.1.0 promotes the family:

- `PipTrack` (Hope, Fear) — max, fillable, one-click ±
- `SlotTrack` (HP, Stress, Armor) — count from character, mark/unmark, optional thresholds
- `ConditionBadges` — core + feature list from system config
- `IdentityLabel` — name + declared identity fields
- `DiceLog` / `Roller` — optional, driven by the system's `dice` module
- Systems may also register **custom widgets** for anything generic widgets can't express.

Scenes reference widgets by config; widgets read from the generic character state. **Adding a stat never means writing a new component.**

### Theme — a quiet fourth axis, deliberately scoped

Appearance is separable from mechanics and composition: a **theme** is a bundle of tokens (color, type, layout, and widget _representation_ — pip vs. heart vs. bar), reflected to CSS custom properties. The plumbing already exists (`themeToCssVars` → `document.documentElement`; the `no-hardcoded-values` test enforces token use), so restyling the same ruleset is a config change, not a fork. Selection becomes a third URL param: `?system=daggerheart&scene=player&theme=neon`; a system names a `defaultTheme`.

**Be honest about what this is and isn't:**

- A Vellum theme is **not** a downloadable OBS overlay pack (NerdOrDie/StreamSpell-style static assets installed into OBS). OBS points at a URL; the theme is values the app loads. Nobody installs anything into OBS. Framing it as the "OBS theme market" is a category error.
- The real, near-term value is **narrow and concrete**: legibility tuning (a look for 480p Discord tiles vs. a crisp stream), an **accessibility** high-contrast variant, and a little player expression. That justifies shipping **2–3 first-party themes in-tree** — no more.
- The `shape` prop on `StatTrack` (`pip | box | heart`) already exists; the only move needed for themes to control _representation_ (not just color) is to source that choice from theme/system config instead of the Daggerheart wrapper components. Small move, real payoff.
- **What is explicitly deferred:** a theme _ecosystem_ — a gallery, selection UI, install flows, community theme trading, any "economy." That is a post-1.0 speculative bet, not a 0.1.0 need, and building it now is exactly the over-architecture the PRD flagged (R-6). Themes at 0.1.0 are a clean axis + a low-barrier _contribution_ path (a theme is values, no TypeScript, no rules knowledge — the easiest first PR), nothing more.

Themes are a headline of the _architecture_, not of the _product_. Keep the seam clean because it's nearly free; don't sell a marketplace that doesn't exist.

---

## 3. What's coupled today (and must be generalized)

> This section is filled in precisely by the architecture-coupling scan (see `docs/architecture-coupling.md`, generated during planning). Summary of the blocking seams:

1. **`SYSTEM_IDS = ['daggerheart']` and `SystemConfig = DaggerheartSystemConfig`** (`src/systems/types.ts`) — a union of one. The type system currently _forbids_ a second system. → Generalize to a `SystemDefinition` interface + a runtime **registry**.
2. **`CharacterState` is Daggerheart-shaped** (`src/character/types.ts`) — `hope`, `fear`, `hp[]`, `stress[]`, `armorSlots[]` are named fields. → Move to a generic `resources: Record<ResourceId, ResourceState>` model keyed by the system's declared resources, with a compatibility layer so existing Daggerheart character JSON still imports.
3. **The reducer's action set is stat-specific** (`src/character/reducer.ts`) — actions like "spend hope" / "mark hp". → Generalize to resource-addressed actions (`ADJUST_RESOURCE`, `TOGGLE_SLOT`, `TOGGLE_CONDITION`) parametrized by `resourceId`.
4. **Components named for Daggerheart stats** (`Hope`, `Fear`, `HP`, `Armor`, `Stress`) → keep as thin Daggerheart-provided presets over the generic widget family; the generic widgets are what other systems reuse.
5. **`daggerheart.theme.ts` / `daggerheart.system.ts` are the only entries** → become the reference implementation under `src/systems/daggerheart/`, wired through the registry exactly the way a third-party system would be.
6. **`rollDuality` is DH-specific** → moves under the Daggerheart system's optional `dice` module; the core has no dice concept.

The refactor is **strangler-pattern, not big-bang:** introduce the generic model behind the existing Daggerheart types, migrate Daggerheart onto it, then delete the hardcoded union. Daggerheart's behavior and character JSON stay working the entire time.

---

## 4. Milestones to 0.1.0

Each milestone is independently shippable and leaves `main` green + the Daggerheart session-loop intact.

### M-A — Registry & Scene routing _(no behavior change)_

- Introduce `SystemRegistry` + `registerSystem()`; register Daggerheart through it.
- Add `?system=` + `?scene=` + `?theme=` routing; map `?mode=gm` → `scene=gm` for back-compat. `?theme=` is optional and falls back to the system's `defaultTheme`.
- Daggerheart's player/GM views become declared scenes.
- **Exit:** existing OBS URLs unchanged in behavior; the app now resolves system + scene + theme from the registry.

### M-B — Generic resource & character model

- Define `ResourceDef` / generic `resources` character state.
- Port Daggerheart stats (Hope/HP/Stress/Armor/Fear) onto the generic model.
- Compatibility importer: existing Daggerheart character JSON round-trips unchanged (schema `version` bump + migration).
- Generalize the reducer to resource-addressed actions.
- **Exit:** all existing tests pass on the generic model; export/import byte-stable for documented fields.

### M-C — Widget family

- Promote `StatTrack` → `PipTrack` / `SlotTrack`; extract `ConditionBadges`, `IdentityLabel`, `DiceLog` as config-bound generics.
- Daggerheart-named components become thin presets.
- Scenes compose widgets from config.
- Source widget **representation** (`shape`: pip/box/heart) from theme/system config rather than the DH wrapper components — the one move that lets a theme restyle _form_, not just color.
- Ship **2–3 first-party themes** for Daggerheart as the narrow, honest payoff: the default illuminated look, a **high-contrast/accessibility** variant, and a **480p-legibility** variant tuned for small Discord tiles. No gallery, no selection UI — just selectable via `?theme=`.
- **Exit:** Daggerheart player/GM scenes render entirely from config-composed generic widgets; switching `?theme=` restyles the same HUD with zero component changes.

### M-D — Second system (the proof)

- Ship a real second system module (candidate: a lightweight, SRD-open system, or a deliberately-minimal "Generic d20 / freeform tracker" so we don't take on a second rules research burden). It must exercise: different resources, different scenes, its own theme.
- **Exit:** a second system is selectable and playable, added as `src/systems/<id>/` + a theme, with **zero core edits** in the diff. This is the architectural acceptance test.

### M-E — Extension surface & authoring DX

- Public, documented `SystemDefinition` / `SceneDef` / `ThemeConfig` types.
- `docs/authoring-a-system.md` + `docs/authoring-a-theme.md` walkthroughs.
- A `systems/_template/` starter and a schema-validated example character JSON per system.
- Runtime validation of registered systems with friendly errors (bad config shouldn't white-screen an OBS source mid-session).
- **Exit:** a stranger can follow the guide and add a trivial system end-to-end.

### M-F — Release hardening

- Static build that runs from `file://`-ish / any static host (already close — it's local-only).
- OBS setup guide generalized beyond Daggerheart; per-scene URL cheat-sheet.
- Error boundary + "safe mode" HUD if a character or system fails to load (never a blank camera).
- Versioned character-schema migration path.
- `CHANGELOG.md`, `CONTRIBUTING.md`, `LICENSE`, semver commitment.
- **Exit:** tagged `v0.1.0`, GitHub Release, Pages site live (see `docs/RELEASE-STRATEGY.md`).

---

## 5. Explicitly still out of scope at 0.1.0

Carried from the PRD's Won't list — composability does **not** pull these in:

- No backend, accounts, sync, or GM cross-player aggregation (still local-only).
- No in-app character builder or custom-condition editor UI (JSON authoring stays the contract).
- No mobile/native target; OBS + Chromium only.
- No per-roll automation.
- Marketplace / plugin-install-at-runtime is **post-0.1.0** — 0.1.0 systems are compiled-in modules in the repo, not downloaded plugins. (Registry is designed so a runtime plugin loader is an additive future step, not a rewrite.)
- No **theme ecosystem** — no gallery, no in-app theme picker, no community theme trading or "download a theme" flow. Themes at 0.1.0 are a clean config axis + 2–3 shipped first-party looks (M-C) + a `docs/authoring-a-theme.md` contribution path (M-E). A Vellum theme is loaded values, never an installed OBS asset; the ecosystem is a post-1.0 bet, not a beta need (PRD R-6, over-architecture).

## 6. Definition of done for 0.1.0

1. Daggerheart plays exactly as it does today (no regression in the shipped session loop).
2. A second system ships in-tree, added with no core edits.
3. Scenes are URL-addressable and documented; old `?mode=` URLs still work.
4. A stranger can add a system and a theme by following the docs.
5. Tagged release + advertised Pages site + brand identity applied.
