2026-05-06

Ideate Phase
Product Requirements Document
Vellum (working repo: `ttrpg-layer`)

**Product Requirements Document: Vellum**

## 1.0 Document Overview

| Field                          | Value                                                                                  |
| :----------------------------- | :------------------------------------------------------------------------------------- |
| **Version**                    | 1.0                                                                                    |
| **Date**                       | 2026-05-06                                                                             |
| **Status**                     | Complete                                                                               |
| **Target Release / Milestone** | MVP — owner's group runs one complete Daggerheart session using Vellum (no fallback)   |
| **Authors / Contributors**     | alxjrvs (owner)                                                                        |

**Purpose:** Defines requirements, design decisions, and success criteria for **Vellum**, a local Discord camera overlay that displays TTRPG character stats on top of a webcam feed during live remote play. Primary reference for the build phase and for the success gate ("whole group runs a Daggerheart session using Vellum in place of Demiplane").

**Scope:** MVP ships a single Daggerheart frame (Player HUD + GM Fear view). Multi-system architecture is a design constraint from day one; additional system frames are post-MVP.

## 2.0 Executive Summary

### 2.1 The Initiative

Vellum is a local-only, TTRPG-system-aware camera overlay. A web app renders a character HUD — Hope, HP with thresholds, Stress, Armor slots, active conditions, and identity — and is composited onto the player's webcam feed via OBS browser source plus OBS Virtual Camera, which Discord receives as the player's camera input. Each player and GM runs their own instance: no backend, no account, no sync.

### 2.2 Vision & Scope

The vision is that a remote TTRPG group's mechanical state lives on each player's face, in the video call, instead of in a separate browser tab. Stats become ambient table information — visible to everyone, updateable by their owner without alt-tabbing. MVP ships one frame (Daggerheart). The system is built data-driven from day one (system configs, stat models, themes are configuration, not hardcoded) so that adding a future system frame (D&D 5e, PbtA, etc.) is config + components, not a rewrite. Public-release packaging, cloud sync, accounts, and cross-player GM visibility are explicitly deferred until after the live-session validation milestone.

### 2.3 Success Metrics

- **Primary (binary):** Whole gaming group runs a complete Daggerheart session using Vellum — all four core stat tracks (Hope, HP, Stress, Fear) plus character labels, armor slots, and conditions — with no mid-session fallback to Demiplane.
- **Secondary (qualitative):** Players report fewer alt-tab interruptions during the session vs. their Demiplane baseline. GM reports improved at-a-glance visibility into player resource state.
- **Architectural (post-validation):** A second-system frame (any RPG) can be added with config + a small component set rather than a rewrite. Verification deferred until first session is shipped.

## 3.0 Background & Strategic Fit

### 3.1 Problem Statement

Remote TTRPG sessions over Discord solve the physical-distance problem but introduce a persistent presence and transparency gap. When players track their characters in **Demiplane** — the only official Daggerheart digital sheet — they manage Hope, HP, Stress, and conditions in a separate browser window that is off-camera and invisible to the rest of the table. Every stat update requires the player to break eye contact, look away, manipulate numbers in another application, and re-engage. In Daggerheart specifically, where Hope moves on nearly every action roll and Fear moves correspondingly for the GM, this interruption is not occasional — it is the rhythm of play.

The second dimension is transparency. Daggerheart's duality mechanics make resource state tactically meaningful to the whole table: a player low on Hope changes what moves the GM should make; a GM at 10 Fear changes how cautiously players should act. With stats siloed in individual Demiplane tabs, the table loses ambient awareness. Information that should be part of the shared fiction becomes a verbal exchange ("how much Hope do you have?") that interrupts pacing and breaks immersion.

Vellum addresses both by rendering the character's current stats as a persistent HUD composited onto the player's webcam feed. Stats are always visible to everyone in the call; manipulation happens in the overlay (one-click Hope, armor toggles, condition badges) without switching windows. The GM view shows the Fear pool on the GM's own camera. Resource transparency becomes ambient, not interrogative.

### 3.2 Goal & Opportunity

The goal for this phase is a tool that allows the owner's entire gaming group to run a complete Daggerheart session — players and GM — using Vellum in place of Demiplane for in-session stat tracking, with no mid-session fallback.

Two timing factors make this favorable. First, **Daggerheart (Darrington Press, 2025)** is a recently released system with a thin tooling ecosystem. The curated `awesome-daggerheart` resource list contains 20+ tools and zero streaming/overlay entries. There is no established product to displace. Second, the owner is starting a Daggerheart campaign with a real group, creating a concrete near-term deployment window that anchors MVP scope.

The opportunity is structurally distinctive. Two adjacent markets are mature but non-overlapping: **TTRPG companion apps** (Demiplane, HeartSmith, FreshCutGrass, Heartforge, Daggertrack, iOS Tracker) handle stat state but live entirely off-camera; **streamer/webcam overlay tools** (Streamlabs, NerdOrDie, StreamSpell, OWN3D, ManyCam) render onto cameras but have no stat data layer — "TTRPG" in their context means aesthetic, not mechanics. The closest architectural precedent is the **Foundry VTT Stream Overlay** module (browser source + live character data + chroma key), but it requires a $50 Foundry license, a self-hosted server, and produces a separate captured window rather than compositing onto the player's webcam. The only shipped product that puts live TTRPG stats in a streaming context is **D&D Beyond's Twitch Extension** — but it is D&D 5e-only, Twitch-locked, and audience-facing rather than a player's own HUD. **No shipping product combines (a) camera compositing, (b) TTRPG-system-aware live stats, and (c) per-player local interactive manipulation.**

### 3.3 Dependencies & Constraints

_Populated in detail by `/ideate:architecture`. Wave 1 captures these load-bearing constraints:_

- **Discord camera pipeline.** MVP delivery hypothesis: web app → OBS browser source → OBS scene composites overlay onto webcam → OBS Virtual Camera → Discord webcam input. Architecture phase will validate.
- **Local-only.** No backend, no auth, no sync. Persistence: localStorage + JSON character file import/export.
- **TypeScript.** Per owner preference. Framework selection deferred to architecture phase.
- **Daggerheart rule alignment.** SRD baseline: Daggerheart-SRD-9-09-25.pdf (Sept 2025); errata of same date. Online SRD at daggerheartsrd.com is the working canonical reference.
- **Discord webcam rendering envelope.** Discord enforces 16:9 aspect ratio; multi-person calls render at ~480p (community-reported, not officially documented). OBS canvas at 1920×1080 is the design target; overlay must be legible at ~640×360 effective and scannable at thumbnail (~200–300px wide tile).

### 3.4 Pain Points with Existing Systems

| Severity | Pain | Affected | Currently Mitigated By |
|----------|------|----------|------------------------|
| **High** | Presence breakage from off-camera stat tracking — every Hope/HP/Stress/Fear update requires alt-tabbing to Demiplane, breaking eye contact and conversational presence | All players + GM, every roll | Nothing — the breakage is constant |
| **Medium** | Visibility asymmetry across the table — player resource state (Hope, HP, Stress) is siloed in individual Demiplane tabs; the table loses ambient awareness of how each character is doing | All participants | Asking aloud, which interrupts pacing |
| **Medium** | Thin tooling ecosystem — Daggerheart launched 2025; no existing tool overlays TTRPG stats onto a video feed for any system, let alone Daggerheart specifically | Daggerheart groups generally | None |
| **Low** | Session-start overhead — Demiplane configuration is parallel work to camera setup each session | Each player, every session | Manual setup |
| **Low (deferred)** | GM has no aggregate view of player stats | GM | Asking out loud — explicitly deferred to post-MVP |

### 3.5 Competitive Landscape

#### Market Overview

The competitive space spans three categories. None ship a product that combines live TTRPG stat rendering with webcam compositing for per-player Discord play.

- **Generic streamer overlay tools** (Streamlabs, NerdOrDie, StreamSpell, OWN3D, TTRPG Overlay, mmhmm/Airtime, ManyCam) — polished webcam frames, animated overlays, broadcast scenes. Several explicitly target TTRPG aesthetics (parchment, scroll UI, fantasy fonts). **None bind to live character stat data.** All assume a broadcast-to-public-audience context.
- **TTRPG companion / sheet apps** (Demiplane Daggerheart Nexus, HeartSmith, FreshCutGrass, Heartforge, Daggertrack, iOS Daggerheart Tracker, Roll20, Foundry VTT) — accurate, increasingly rich stat handling. **All off-camera.** Foundry VTT's Stream Overlay module is the closest architectural precedent (browser source + live data) but requires Foundry infra and produces a separate captured window, not webcam compositing.
- **The single shipped exception**: **D&D Beyond Twitch Extension** — live HP + conditions on a Twitch viewer panel. D&D 5e only, Twitch-locked, audience-facing. Validates demand for a different audience segment (D&D streamers broadcasting to public).

#### Key Competitor Profiles

- **Demiplane (Daggerheart Nexus)** — Official digital toolset. Full character builder, interactive sheet, Hope/HP/Stress/Armor/conditions, GM Adversary tools. _The displacement target for in-session stat tracking._ Off-camera; requires account and internet.
  - https://app.demiplane.com/nexus/daggerheart
- **D&D Beyond Twitch Extension** — Only shipped product with live TTRPG stats during streaming. D&D 5e only, Twitch only, audience-facing.
  - https://features.dndbeyond.com/twitch-extension
- **Foundry VTT + Stream Overlay** — Closest architectural precedent. Browser source + live Foundry character data + chroma key. Requires $50 license + self-hosted server; not webcam-composited; designed for broadcast.
  - https://foundryvtt.com/packages/foundrystreamoverlay
- **StreamSpell / TTRPG Overlay / NerdOrDie** — Aesthetic vocabulary reference (parchment, scrollwork, fantasy fonts). Pure visual frames, no data. $24.99–$49.99 per pack.
- **Daggerheart-specific tooling** (HeartSmith, FreshCutGrass, Heartforge, Daggertrack, Trackerheart Discord bot, daggerheart.tools fear tracker) — All off-camera; none have streaming/overlay capability. The `awesome-daggerheart` curated list confirms zero streaming entries across 20+ tools.

#### Comparative Matrix

| Capability                                  | Streamer overlays | Demiplane | DDB Twitch Ext     | Foundry Stream Overlay | **Vellum (target)** |
| ------------------------------------------- | ----------------- | --------- | ------------------ | ---------------------- | ------------------- |
| Camera/webcam overlay                       | Cosmetic only     | No        | No (Twitch panel)  | Separate source        | **Yes — composited on webcam** |
| Live TTRPG stat data                        | No                | Yes       | Yes (5e only)      | Yes                    | **Yes**             |
| Daggerheart support                         | No                | Yes       | No                 | Community module       | **Yes (MVP)**       |
| Local-only, no backend                      | N/A               | No        | No                 | No                     | **Yes**             |
| Per-player local manipulation in overlay    | N/A               | Sheet UI  | Viewer-only        | GM-driven              | **Yes**             |
| Works in private Discord call               | No                | No        | No                 | No                     | **Yes**             |
| Multi-system frame architecture             | N/A               | Single    | Single             | Multi (generic fields) | **Yes (data-driven)** |
| Free / no subscription                      | Some              | Paid      | Free + DDB account | $50 Foundry            | **Yes**             |

#### Market Gaps

1. **No product composites live TTRPG stats onto a player's webcam for private Discord play.** Confirmed by exhaustive search across all four categories.
2. **All TTRPG digital tools are off-camera.** Six Daggerheart-specific apps reviewed; zero overlay integration.
3. **Daggerheart ecosystem has zero streaming/overlay tooling.** Confirmed by `awesome-daggerheart` (20+ tools, 0 streaming entries).
4. **Private small-group remote play is not a design target for any overlay product.** All overlay tools assume broadcast-to-public-audience.

#### Key Takeaways

- Vellum enters an unoccupied niche. There is no direct competitor; the product creates a category rather than competing within one.
- Daggerheart's tracker ecosystem (Demiplane, HeartSmith, FreshCutGrass, etc.) is the displacement target for in-session stat tracking — Vellum's local manipulation UX must be at least as frictionless or users will keep tracking in those windows and the presence problem persists.
- D&D Beyond's Twitch Extension validates "live TTRPG stats during streaming" as a real product wedge — for a different audience. Vellum solves the same idea for private Discord play.
- Foundry Stream Overlay is the architectural precedent worth studying. Vellum applies the pattern (browser source + live data) at the webcam composite level rather than the stream-scene level.
- The streamer-overlay aesthetic market has already validated visual taste for Daggerheart-thematic frames. Vellum can adopt that vocabulary rather than invent it.

## 4.0 Target Audience & Personas

The audience is the owner (alxjrvs) and a single fixed gaming group — single-digit total user count. Personas are scoped to the actual humans at this table, not generalized streamer/creator archetypes. Two personas cover the full surface; they may overlap (the owner sometimes plays, sometimes GMs).

### Persona 1 — Player (alxjrvs and ~3–5 group members)

| Field | Value |
|-------|-------|
| **Role** | Daggerheart player running a PC over Discord video |
| **Context** | At their own desk, on a personal Mac/PC, in a 4–6-person Discord voice/video call. Currently runs Demiplane's Daggerheart Nexus in a parallel browser window. Comfortable enough with technology to install OBS but not necessarily an OBS power user. |
| **Primary goals** | Update Hope every roll, mark HP/Stress on incoming damage, toggle conditions like Vulnerable/Hidden, stay engaged on-camera with fellow players |
| **Key pains** | Alt-tabbing to Demiplane every action roll breaks eye contact (PRD 3.4 High); can't see what other PCs' state is without asking out loud (PRD 3.4 Medium); session-start setup involves Demiplane + camera + Discord in parallel (PRD 3.4 Low) |
| **Success indicators** | Doesn't open Demiplane during the session; eyes stay on the call; no verbal "what's your Hope?" exchanges; refreshes browser mid-session and recovers state without losing pacing |

### Persona 2 — GM (alxjrvs or another group member running the campaign)

| Field | Value |
|-------|-------|
| **Role** | Daggerheart GM running adversaries, Fear pool, and pacing for the table |
| **Context** | Same Discord call, same desktop OBS pipeline. Currently uses Demiplane Adversary tools and a separate Fear tracker (paper, daggerheart.tools, or Trackerheart bot). Higher tolerance for tooling complexity than the players but the same on-camera presence problem. |
| **Primary goals** | Track Fear (gain on Fear-side rolls and rests, spend on GM moves), keep moves flowing without ducking off-camera to a separate counter, read the table's energy from player faces |
| **Key pains** | Fear updates are off-camera too — every Fear-side roll outcome triggers a glance away (PRD 3.4 High); reading player resource state currently requires asking out loud (PRD 3.4 Medium, partially mitigated by Vellum player HUDs being visible to GM as ambient view) |
| **Success indicators** | Fear pool lives on the GM's own webcam; GM updates Fear with one click without breaking narration; players' camera HUDs give enough ambient state info that the GM stops asking for stats |

_Note: GM cross-player visibility (aggregating all players' stats on the GM's overlay) is explicitly **out of scope at MVP** — REQ-045. The GM persona's "ambient state info" comes from seeing each player's webcam HUD in the Discord call, not from a centralized GM dashboard._

### 4.1 User Stories

Stories are written in the standard "As a / I want / so that" form with an explicit REQ-ID mapping. Stories cover the high-frequency interactions, the persistence flow, the GM view, and the delivery pipeline.

| # | Story | REQ-IDs |
|---|-------|---------|
| US-1 | As a **Player**, I want to gain or spend a single Hope with one click during my action roll so that I can update my resource without breaking eye contact on camera. | REQ-001, REQ-002, REQ-024, REQ-025 |
| US-2 | As a **Player**, I want to mark HP slots when I take damage so that my current health is visible to the table without me opening Demiplane. | REQ-003, REQ-004, REQ-024 |
| US-3 | As a **Player**, I want my HP track to display the correct slot count for my class (5–7 at L1) so that the HUD matches my actual character rather than a hardcoded default. | REQ-003, REQ-018, REQ-020 |
| US-4 | As a **Player**, I want to mark/unmark Stress and Armor slots inline so that combat resource use is tracked on-camera. | REQ-006, REQ-007, REQ-008, REQ-009, REQ-024 |
| US-5 | As a **Player**, I want to toggle the three core conditions (Hidden, Restrained, Vulnerable) via a panel so that the rest of the table sees my state at a glance. | REQ-010, REQ-011, REQ-026 |
| US-6 | As a **Player**, I want my Name + Class + Ancestry shown as a compact identity label so that other players read who my character is from my video tile alone. | REQ-013 |
| US-7 | As a **Player**, I want to import my character from a JSON file at session start and have my state autosave to localStorage so that a browser/OBS reload mid-session restores everything within a second. | REQ-021, REQ-022, REQ-031 |
| US-8 | As a **Player**, I want to export my character to a JSON file between sessions so that I can edit advancement (HP/Stress cap, conditions list) outside the app and bring it back next session. | REQ-023, REQ-041 |
| US-9 | As a **GM**, I want a Fear pip track (max 12) on my own camera with one-click increment/decrement so that I can update Fear without ducking out to a separate tool. | REQ-015, REQ-016, REQ-017, REQ-024, REQ-025 |
| US-10 | As a **Player or GM**, I want my Vellum overlay to render as an OBS browser source that composites onto my webcam via OBS Virtual Camera so that Discord receives my camera feed with the HUD already on it. | REQ-038, REQ-039, REQ-040 |
| US-11 | As the **owner**, I want the system and theme defined as data files so that adding a second TTRPG frame post-MVP is config + components, not a rewrite. | REQ-018, REQ-019, REQ-020 |

## 5.0 Key Features & Requirements

### 5.1 Functional Requirements

Functional requirements grouped by concern: Player View, GM View, System Architecture, Persistence, and Manipulation UX. Integrations are in 5.3. Format: REQ-ID, description, MoSCoW priority.

#### Player View

- **REQ-001** — _Hope display_: Render the player's current Hope as a pip track with maximum 6, showing pips filled/empty. (**Must**)
- **REQ-002** — _Hope manipulation_: Allow the player to increment and decrement Hope with a single interaction (one click or one keypress per change). (**Must**)
- **REQ-003** — _HP track display_: Render the player's current HP as a slot/pip track sized to the character's class-defined maximum (range 5–12). Display marked vs unmarked HP slots. (**Must**)
- **REQ-004** — _HP manipulation_: Allow the player to mark/unmark HP slots during the session. (**Must**)
- **REQ-005** — _HP threshold indicators_: Visually mark the player's Major and Severe damage thresholds on or alongside the HP track, computed from armor base + character level. No automatic threshold-based damage resolution required at MVP. (**Should**)
- **REQ-006** — _Stress track display_: Render the player's current Stress as a slot/pip track with a default maximum of 6, configurable up to 12 via character data. Display marked vs unmarked slots. (**Must**)
- **REQ-007** — _Stress manipulation_: Allow the player to mark/unmark Stress slots during the session. (**Must**)
- **REQ-008** — _Armor slots display_: Render Armor slots as a track sized to the equipped armor's slot count (0 unarmored, 3 for Gambeson/Leather, 4 for Chainmail/Full Plate). (**Must**)
- **REQ-009** — _Armor slots manipulation_: Allow the player to mark/unmark armor slots during the session. (**Must**)
- **REQ-010** — _Core condition badges_: Render badges for the three core Daggerheart conditions (Hidden, Restrained, Vulnerable) showing active/inactive state. (**Must**)
- **REQ-011** — _Core condition toggle_: Allow the player to toggle each core condition badge on/off during the session. (**Must**)
- **REQ-012** — _Feature condition badges_: Support an extensible set of additional feature-specific conditions (e.g., On Fire, Stunned, Invisible, Poisoned) configured per character or per system. (**Should**)
- **REQ-013** — _Character identity label_: Render a compact identity label showing Name, Class, and Ancestry. (**Must**)
- **REQ-014** — _Optional identity fields_: Permit the identity label to optionally display Subclass, Community, and Level. (**Could**)

#### GM View

- **REQ-015** — _Fear pip display_: Render the GM's current Fear as a pip track with maximum 12. (**Must**)
- **REQ-016** — _Fear manipulation_: Allow the GM to increment and decrement Fear with a single interaction (one click or one keypress per change). (**Must**)
- **REQ-017** — _GM-only view mode_: Provide a distinct "GM" rendering mode that shows only the Fear pip and excludes player-only stats. (**Must**)

#### System Architecture (Data-Driven)

- **REQ-018** — _System config as data_: Define the active TTRPG system (stat models, default values, condition lists) via a data file/config rather than hardcoded code paths. The Daggerheart system config ships at MVP. (**Must**)
- **REQ-019** — _Theme config as data_: Define the active visual theme (colors, typography, frame artwork, layout tokens) via a data file/config. The Daggerheart-thematic theme ships at MVP. (**Must**)
- **REQ-020** — _Stat-model abstraction_: Stats (Hope/HP/Stress/Fear/Armor) are rendered from a generic stat-track component family driven by system config (track length, label, manipulation rules), so a future system frame requires only config + reuse, not new components per stat. (**Must**)

#### Persistence

- **REQ-021** — _localStorage session state_: Persist the active character's current state (Hope/HP/Stress/Armor/Conditions, plus identity) in localStorage so that page refresh, OBS reload, or browser restart preserves session state. (**Must**)
- **REQ-022** — _JSON character import_: Accept a character file (JSON) selected from disk and load it as the active character. (**Must**)
- **REQ-023** — _JSON character export_: Export the active character's full state to a downloadable JSON file. (**Must**)

#### Manipulation UX

- **REQ-024** — _In-session manipulation without alt-tab_: All Must-Have stats (Hope, Fear, HP, Stress, Armor, core conditions) are manipulable during the session without leaving the Vellum overlay/control surface — i.e., without opening Demiplane or any external sheet. _The control surface (clicks on the camera-composited overlay vs. a separate adjacent control window) is an architecture-phase decision._ (**Must**)
- **REQ-025** — _Hope/Fear one-click frequency_: The interaction cost of a single Hope or Fear change is one click (or one keypress) and zero modal dialogs. (**Must**)
- **REQ-026** — _Conditions toggle panel_: Conditions may be manipulated via a toggle panel/menu (acceptable to require an open-panel step) rather than always-visible inline toggles. (**Could**)

### 5.2 Non-Functional Requirements

- **REQ-027** — _Canvas resolution_: The overlay renders at the OBS canvas target of 1920×1080 pixels. (**Must**)
- **REQ-028** — _Discord-call legibility_: Critical stat values and the identity label remain legible when the camera tile is rendered at ~640×360 effective resolution in a Discord multi-person call. (**Must**)
- **REQ-029** — _Thumbnail-tier scannability_: At ~200–300 px tile width (Discord grid view of 4–6 participants), at minimum the identity label and a primary status indicator (e.g., Hope pip count) remain visually parseable. (**Should**)
- **REQ-030** — _Local-only operation_: The application functions fully without any network connectivity once loaded. No requests to external APIs, no auth servers, no telemetry endpoints. (**Must**)
- **REQ-031** — _Refresh resilience_: A page reload during a live session restores all current stat values from localStorage within a duration that does not interrupt play (target: <1 second perceived). (**Must**)
- **REQ-032** — _Performance under OBS_: The overlay renders at OBS browser-source frame rates without dropping frames or causing visible lag in the composited webcam output during normal interaction. (**Must**)
- **REQ-033** — _TypeScript implementation_: The application source is TypeScript. Framework selection deferred to architecture phase. (**Must**)
- **REQ-034** — _Modern Chromium target_: The application targets the OBS browser source (Chromium Embedded Framework) and equivalent modern desktop Chromium browsers. Cross-browser support beyond this is out of scope. (**Must**)
- **REQ-035** — _Aesthetic alignment with Daggerheart_: The default theme reflects published Daggerheart visual language (parchment / card / gold-black register) sufficiently to feel system-native to the group. (**Should**)
- **REQ-036** — _No state collisions_: When two players run separate Vellum instances (separate machines), each instance manages its own localStorage and cannot affect another instance's state. (**Must**)
- **REQ-037** — _Setup documentation_: The repository includes documentation for the OBS browser-source + Virtual Camera setup path sufficient for a non-OBS-expert group member to follow. (**Should**)

### 5.3 Key Integrations

- **REQ-038** — _OBS browser source rendering_: The application is delivered as a static or locally-served web page suitable for use as an OBS browser source at 1920×1080. Transparency/chroma-key compatibility (for compositing onto a webcam scene) is required. (**Must**)
- **REQ-039** — _OBS Virtual Camera output_: Vellum's output composes correctly into an OBS scene that includes the player's webcam, such that the OBS Virtual Camera output is what Discord receives as the player's webcam input. _(Delivery-pipeline expectation Vellum must accommodate, not implement.)_ (**Must**)
- **REQ-040** — _Discord webcam compatibility_: The composed Virtual Camera output meets Discord's webcam input format (16:9 aspect ratio, standard webcam resolution) without artifacts. _(Validation responsibility, not code-level integration.)_ (**Must**)
- **REQ-041** — _File-system character I/O_: The application can read a user-selected JSON file from local disk (character import) and trigger a download of a JSON file (character export) using browser-native file APIs. No external file-storage service. (**Must**)
- **REQ-042** — _No backend integrations_: The application does not call any external API, authentication provider, telemetry service, or sync server. (**Must**)

### 5.4 Out of Scope

- **REQ-043** — _Backend / accounts / auth_: No server-side state, no user accounts, no authentication provider. _Deferral rationale:_ group is small, fixed, and trusted; sync introduces complexity irrelevant to the success criterion. _Future condition:_ revisit only if Vellum is packaged for public release. (**Won't**)
- **REQ-044** — _Multiplayer / cross-instance state sync_: Players' Vellum instances do not communicate with each other or with the GM's instance. _Deferral rationale:_ Discovery Q9 explicit. _Future condition:_ dependent on REQ-043 being lifted. (**Won't**)
- **REQ-045** — _GM cross-player visibility_: The GM's view does not aggregate or display player resource state. _Deferral rationale:_ PRD 3.4 explicit deferral; the immersion problem is partially solved already by camera HUDs being visible to the GM as ambient view. _Future condition:_ post-MVP, after first session validates the core loop. (**Won't**)
- **REQ-046** — _Mobile / non-desktop targets_: No iOS, Android, or tablet-optimized UI. _Deferral rationale:_ OBS browser-source pipeline is desktop-only by definition. _Future condition:_ would require an entirely different delivery path (native app). (**Won't**)
- **REQ-047** — _Public-release packaging / installer_: No polished installer, signed binary, or App Store distribution. _Deferral rationale:_ owner's group runs from source/dev server. _Future condition:_ post-validation, optional. (**Won't**)
- **REQ-048** — _Dice rolling_: Vellum does not roll dice or interpret duality-roll results. _Deferral rationale:_ rules-engine scope creep; group will continue using whatever dice tool they prefer. _Future condition:_ speculative; not on roadmap. (**Won't**)
- **REQ-049** — _Second TTRPG system frame_: No system other than Daggerheart ships at MVP. _Deferral rationale:_ scope discipline; data-driven architecture supports addition without rewrite. _Future condition:_ after first DH session validates core loop, a second frame is the architectural acceptance test. (**Won't** at MVP; **Should** post-MVP)
- **REQ-050** — _Per-roll automation (auto-gain Hope on duality, etc.)_: Vellum does not parse roll outcomes or auto-update stats. Manual one-click manipulation only. _Deferral rationale:_ would require dice integration or external roll-source contract. _Future condition:_ speculative. (**Won't**)
- **REQ-051** — _Custom condition editor_: No in-app UI for users to define entirely new conditions. Feature conditions ship as a configurable list (system config). _Deferral rationale:_ configured list covers known feature conditions; full editor is over-engineering for owner's group. _Future condition:_ if multiple groups adopt Vellum and request unique homebrew conditions. (**Won't** at MVP)
- **REQ-052** — _Character creation UI / character builder_: Vellum imports characters from JSON; it does not provide a guided character creation wizard. _Deferral rationale:_ Demiplane and HeartSmith already do this well; Vellum's value is in-session HUD, not character build. _Future condition:_ revisit only if a barrier to onboarding emerges. (**Won't**)
- **REQ-053** — _Cross-browser support beyond Chromium_: Firefox/Safari support not targeted. _Deferral rationale:_ OBS browser source is Chromium; no other delivery surface needs other browsers. _Future condition:_ if a non-OBS delivery path is added. (**Won't**)
- **REQ-054** — _HP/Stress level-up advancement automation_: Cap raises (5/6 → 12) handled via character JSON edit, not in-app UI. _Deferral rationale:_ infrequent action; group can edit JSON or re-import. _Future condition:_ if level-up cadence makes this onerous, revisit as Should-Have. (**Won't** at MVP)

#### Summary by MoSCoW

| Priority | Count |
|----------|-------|
| **Must** | 35 |
| **Should** | 5 |
| **Could** | 2 |
| **Won't** | 12 |
| **Total** | 54 |

## 6.0 Verification & Validation

Verification for Vellum is anchored in a single live-session validation event: the owner's group runs a complete Daggerheart session with Vellum in place of Demiplane. Outcome metrics describe what is measured during and after that session; acceptance criteria are clustered Given/When/Then statements covering the Must-Have requirement groups. Architectural verification (multi-system frame retrofit) is deferred until after the core-loop validation.

### 6.1 Outcome Metrics

| # | Metric | Type | Measurement Method | Desired Outcome |
|---|--------|------|-------------------|-----------------|
| OM-1 | **Session shipped without fallback** — whole group completes one Daggerheart session using Vellum for all four core stats (Hope, HP, Stress, Fear) plus armor, conditions, and identity, with no mid-session reversion to Demiplane | Primary, **binary** | Post-session debrief; ship/no-ship verdict | Ship |
| OM-2 | Alt-tab interruption rate vs. Demiplane baseline | Secondary, qualitative | Player self-report at debrief — "did you alt-tab less than your usual Demiplane sessions?" | Reported reduction across all players |
| OM-3 | At-a-glance GM visibility into player resource state | Secondary, qualitative | GM debrief — "could you read player Hope/HP from the call without asking?" | GM reports yes for at least Hope and HP |
| OM-4 | Mid-session technical disruption count | Secondary | Count of Vellum-attributable incidents (refresh stuck, OBS/Discord pipeline drop, lost state) during the session | ≤1 incident across the full group; zero session-ending incidents |
| OM-5 | Theme/aesthetic acceptability | Secondary, qualitative | Group sign-off on the default Daggerheart theme — "does this feel system-native?" | Acceptance from at least 3 of 4 players + GM |
| OM-6 | Architectural retrofit cost (deferred) | Architectural, deferred | Adding a second TTRPG system frame is config + a small component set rather than a rewrite | Verified post-MVP only; not a launch gate |

### 6.2 Acceptance Criteria

Acceptance criteria are clustered by Must-Have requirement group rather than 1:1 per REQ. Each cluster maps explicitly to its REQ-IDs.

#### AC-1 — Player View renders the four core stat tracks (REQ-001, 003, 006, 008, 010, 013)

**Given** a Daggerheart character has been imported with class, level, equipped armor, identity, and condition list, **when** the player loads the Vellum overlay as a browser source, **then** the HUD shows: Hope as a 6-pip track, HP as a class-correct slot track (5–7 at L1, up to 12), Stress as a 6-slot track, Armor as a 0/3/4-slot track matching equipped armor, the three core condition badges (Hidden, Restrained, Vulnerable), and a compact identity label of `Name — Class, Ancestry`.

#### AC-2 — Player one-click manipulation of high-frequency stats (REQ-002, 004, 007, 009, 011, 024, 025)

**Given** the Player HUD is rendered with a loaded character, **when** the player gains/spends Hope, marks/unmarks an HP slot, marks/unmarks a Stress slot, marks/unmarks an Armor slot, or toggles a core condition, **then** each change requires a single click (or single keypress) with no modal dialog and no application switch — and the visual update is reflected within one render frame.

#### AC-3 — GM View renders Fear and is distinct from Player view (REQ-015, 016, 017)

**Given** the user has selected GM mode, **when** the overlay loads, **then** only the Fear pip track (max 12) and a minimal frame are rendered (no player-only stats), and **when** the GM increments/decrements Fear with one click/keypress, **then** the pip count updates within one render frame.

#### AC-4 — HP threshold indicators reflect armor + level (REQ-005)

**Given** a character with equipped armor (or unarmored) and a level value, **when** the HP track renders, **then** Major and Severe damage thresholds are visually marked on/alongside the track, computed as `armor base + level` (or `level` / `level × 2` if unarmored). Threshold-based damage **resolution** is not automated — the indicators are read-only visual markers. _Should-Have: ships if it does not delay the session milestone._

#### AC-5 — Conditions panel covers core + extensible feature conditions (REQ-010, 011, 012, 026)

**Given** a character config that includes the three core conditions plus zero or more configured feature conditions (e.g., On Fire, Stunned, Poisoned), **when** the player opens the conditions panel, **then** all configured badges are listed with their active/inactive state, **and** toggling a badge updates the badge state and (where applicable) the corresponding HUD indicator. Acceptable that conditions live behind one panel-open step rather than always-visible.

#### AC-6 — Persistence survives refresh and import/export round-trip (REQ-021, 022, 023, 031, 041)

**Given** an active session with state changes (Hope spent, HP marked, conditions toggled), **when** the page is reloaded or OBS reloads the browser source, **then** all current stat values are restored from localStorage in under one second of perceived delay. **And given** the player exports the character to JSON and re-imports the same file, **then** the loaded state matches the exported state byte-equivalent for the documented schema fields.

#### AC-7 — Data-driven system + theme architecture (REQ-018, 019, 020)

**Given** the running build, **when** a reviewer inspects the source, **then** the active TTRPG system (stat models, default values, condition list) and the active theme (colors, typography, frame artwork, layout tokens) are loaded from data files/configs rather than hardcoded; **and** stat tracks (Hope/HP/Stress/Fear/Armor) render through a generic stat-track component family driven by config, such that adding a new system would require config + reuse, not new components per stat. _This AC is verified by code review at end of MVP, not by adding a second system frame._

#### AC-8 — OBS browser source + Virtual Camera + Discord pipeline (REQ-027, 028, 030, 032, 038, 039, 040)

**Given** OBS is configured with the Vellum URL as a browser source at 1920×1080 with transparency enabled and the player's webcam in the same scene, **when** OBS Virtual Camera is selected as the Discord webcam input, **then** Discord receives a 16:9 webcam feed with the Vellum HUD composited onto the player's video, the overlay renders without dropped frames in normal interaction, and the application makes no network requests after initial load.

#### AC-9 — Discord-call legibility and thumbnail scannability (REQ-028, 029)

**Given** the overlay is rendered into a multi-person Discord call (effective tile size ~640×360, thumbnail tiles ~200–300px), **when** another participant views the player's tile, **then** all critical stat values and the identity label are legible at 640×360, and at thumbnail size the identity label plus a primary status indicator (e.g., Hope pip count) remain visually parseable.

#### AC-10 — Local-only operation and per-instance isolation (REQ-030, 036, 042)

**Given** the application is loaded once and the network is then disconnected, **when** the user continues a session (manipulate stats, refresh, import a JSON character), **then** all functionality continues to work without errors. **And given** two separate Vellum instances on two separate machines, **when** one player's state changes, **then** the other player's instance is unaffected (no shared state, no sync, no collisions).

#### AC-11 — Daggerheart aesthetic alignment (REQ-035, 019)

**Given** the default theme ships, **when** the owner's group reviews the visual treatment (parchment / card / gold-black register or equivalent), **then** at least three of four players plus the GM agree it feels Daggerheart-native enough for a session. _Qualitative; group sign-off is the verification artifact._

#### AC-12 — Setup documentation enables non-OBS-experts (REQ-037)

**Given** the repository ships with an OBS browser-source + Virtual Camera setup guide, **when** a group member who is not an OBS power user follows it on their own machine, **then** they reach a working Vellum-on-Discord state without external assistance (or with one round of clarification). _Verified during pre-session setup._

## 7.0 Risks, Assumptions, & Mitigations

Consolidated from Wave 1 (Opportunity risk matrix, §3.5 competitor takeaways), Wave 2 (10 logged assumptions across the requirements pipeline), and validation notes. Likelihood/Impact are scored on a Low/Medium/High scale relative to the MVP success criterion (single shipped session).

### 7.1 Risks

| # | Risk | Likelihood | Impact | Mitigation | Owner |
|---|------|-----------|--------|-----------|-------|
| R-1 | OBS browser-source → Virtual Camera → Discord pipeline fails to deliver a usable composited webcam feed (transparency lost, frame drops, Discord rejects the format) | Low–Medium | **High** — invalidates the only confirmed delivery path | Architecture phase validates pipeline end-to-end with a smoke render before feature build; fallback path is direct in-browser overlay (lower fidelity) | Architecture / owner |
| R-2 | Group member lacks OBS proficiency and cannot follow the setup path | Medium | Medium — one player blocked from session = milestone slips | Ship REQ-037 setup documentation; offer pre-session 1:1 walkthrough; document a non-OBS fallback (run in browser without compositing) | Owner |
| R-3 | Discord platform change to virtual-camera handling (post-policy update or client release breaks OBS Virtual Camera ingestion) | Low | High if it occurs | Web app also runs in a plain browser as a degraded-but-functional view; monitor Discord release notes near session date | Owner |
| R-4 | Daggerheart rules evolve post-launch (errata or 2026 expansion shifts Hope cap, condition list, or armor thresholds) | Low–Medium | Medium — config edits required, not rewrites | Data-driven system config (REQ-018) absorbs rule changes as JSON edits; SRD-pinned baseline in PRD 3.3 documents the snapshot used | Owner |
| R-5 | Scope creep — secondary system frames, GM cross-player visibility, or polish work delays first-session ship | Medium | Medium — MVP slips past the campaign window | Hold the "whole group runs one DH session" milestone line; defer per Won't list (REQ-043–054); architecture phase produces a ranked milestone plan | Owner / orchestrator |
| R-6 | Personal-craft motivation pulls owner toward over-architecture (premature multi-system abstraction, theme-engine scope, framework experimentation) | Medium | Medium — same as R-5, different vector | Architecture is a design constraint, not a feature — REQ-018/019/020 cap the data-driven scope at config files; do not build a second system frame pre-session | Owner |
| R-7 | Refresh-resilience target (<1 s perceived) misses on slow machines or large character JSON | Low | Medium — recovers but interrupts pacing | Keep localStorage payload small (current state only, not history); measure on lowest-spec group machine during architecture phase | Architecture / owner |
| R-8 | Discord 480p effective resolution means 640×360 legibility target is too generous, and HUD becomes unreadable in real calls | Medium | Medium — visibility goal partially missed | Frontend-design phase tests at actual Discord render scale; thumbnail (200–300px) scannability requirement (REQ-029) backstops the worst case | Architecture / frontend-design |
| R-9 | Demiplane "displacement target" friction is lower than Vellum's, and group keeps tracking in Demiplane out of habit | Low | Medium — presence problem not fully solved despite shipping HUD | One-click Hope/Fear (REQ-025) is the design counter; debrief will surface this and inform post-MVP iteration | Owner |
| R-10 | Control-surface architecture (clicks-on-camera vs separate control window) chosen poorly — overlay either becomes unwieldy as an interactive surface, or the separate window reintroduces alt-tabbing | Medium | High — reintroduces the core pain point | Architecture phase resolves Discovery Open Q3 with explicit prototyping; preserve the requirement (REQ-024) that the result does not require leaving Vellum | Architecture |
| R-11 | Hardcoded conditions list misses a feature condition the group's PCs use (e.g., On Fire, Poisoned), forcing a rebuild mid-campaign | Low | Low — JSON edit suffices | Hybrid badge system: 3 core hardcoded, feature conditions configurable per character (REQ-012, REQ-051) | Owner |
| R-12 | Aesthetic theme misses the Daggerheart visual register and group rejects the look | Low | Low — qualitative; theme-as-data means iteration is cheap | Frontend-design phase produces theme proposals against published Daggerheart assets (cards, gold-black, parchment); group sign-off via OM-5 / AC-11 | Frontend-design |

### 7.2 Assumptions

Assumptions logged across Discovery, Knowledge, Opportunity, and Requirements phases. Carried into the build phase; revisit if invalidated.

| # | Assumption | Source | Disposition if Wrong |
|---|-----------|--------|---------------------|
| A-1 | OBS browser source + OBS Virtual Camera is the correct delivery path to Discord webcam input | PRD 3.3; Knowledge | Fallback to direct in-browser view (no compositing); revisit with native (Tauri) path |
| A-2 | Group has or can install OBS on every member's machine | Opportunity risk; Wave 2 #7 | Ship a non-OBS-mode browser view; one player runs degraded |
| A-3 | Hope = 6, Fear = 12 per the September 2025 Daggerheart SRD baseline | Knowledge (verified vs SRD) | Config edit; data-driven so trivial |
| A-4 | HP at L1 ranges 5–7 by class, max 12 via advancement; Stress is universal 6 default, max 12 | Knowledge (per-class table) | Config edit per character |
| A-5 | Three core conditions (Hidden/Restrained/Vulnerable) are the canonical hardcoded set; feature conditions are extensible/freeform per ability text | Knowledge | Config-list edit covers most cases; full custom-condition editor remains Won't (REQ-051) |
| A-6 | Discord enforces 16:9 aspect ratio and renders multi-person video tiles at ~480p (community-reported, not officially documented) | Knowledge | Frontend-design phase verifies on real call; legibility target adjusts |
| A-7 | localStorage is sufficient for session state persistence on target browsers (OBS CEF + modern Chromium) | Wave 2 requirements | Migrate to IndexedDB or filesystem; same data shape |
| A-8 | Group will accept JSON-edit workflow for HP/Stress advancement and custom feature-condition lists rather than in-app builders | Wave 2 #6, #5 | Promote one or both Won't items to Should-Have post-MVP |
| A-9 | Control-surface architecture (clicks-on-camera vs separate control window) is decidable in architecture phase without additional Discovery | Wave 2 #8; Discovery Open Q3 | Prototype both; pick by group test before feature build |
| A-10 | The group will run a Daggerheart campaign in the near-term window, providing the validation event | Opportunity (campaign timing) | Milestone slips to next campaign arc; no hard external deadline |

## 8.0 Appendix

### 8.1 Glossary

| Term | Definition |
|------|-----------|
| **Vellum** | This product. A local-only Discord camera overlay rendering TTRPG character stats on a webcam feed. Working repo name: `ttrpg-layer`. |
| **Daggerheart** | A tabletop role-playing game published by Darrington Press (2025). MVP target system for Vellum. |
| **Daggerheart SRD** | The September 9, 2025 Daggerheart System Reference Document (Daggerheart-SRD-9-09-25.pdf, daggerheartsrd.com). Canonical rules baseline for Vellum. |
| **Hope** | Player-side resource in Daggerheart. Pip track, max 6. Gained on Hope-side duality rolls and crits; spent on Help an Ally (1), Experiences (1), Tag Team (3), class Hope features (3). Highest-frequency stat update. |
| **Fear** | GM-side resource in Daggerheart. Pip track, max 12 (per SRD: "You can never have more than 12 Fear at one time"). Gained on Fear-side rolls and rests; spent on GM moves, additional moves, and adversary features. |
| **HP (Hit Points)** | Damage track in Daggerheart. Slot/pip count is class-variable: 5–7 at L1, max 12 via advancement. Damage is resolved in slots based on Major/Severe thresholds. |
| **Stress** | Mental/physical/emotional strain track. 6 slots default at L1, max 12 via advancement. Filling Stress applies the Vulnerable condition. |
| **Armor slots** | Damage-reduction track tied to equipped armor. Slot count: 0 unarmored, 3 (Gambeson, Leather), 4 (Chainmail, Full Plate). Marking 1 slot reduces incoming damage by one threshold step. |
| **Major / Severe thresholds** | Damage thresholds on the HP track, computed as `armor base + character level` (or `level` / `level × 2` if unarmored). Damage ≥ Severe → mark 3 HP; ≥ Major → 2 HP; below Major → 1 HP. |
| **Conditions (core)** | The three rulebook-defined Daggerheart conditions Vellum hardcodes as first-class badges: **Hidden**, **Restrained**, **Vulnerable**. _Unconscious_ exists in the rules as a death move, not a session-tracked badge. |
| **Conditions (feature)** | Roughly 13 ability/spell-driven conditions (e.g., On Fire, Stunned, Invisible, Poisoned, Asleep, Enraptured, Corroded, Silenced, Cloaked, Frenzied, Horrified, Distracted). No unified mechanical rules — they behave per individual ability text. Vellum supports them as a configurable badge list per character. |
| **Duality dice** | Daggerheart's core resolution mechanic — two distinguishable d12s rolled together where one is the "Hope die" and one the "Fear die." The higher die's color determines whether the roll grants Hope (player) or Fear (GM). Vellum **does not** roll dice (REQ-048). |
| **Demiplane** | The official Daggerheart Nexus digital toolset (Demiplane platform). Vellum's **displacement target** for in-session stat tracking. Off-camera; account- and internet-required. |
| **Frame** | In Vellum: the per-system rendered HUD (e.g., the Daggerheart frame). A frame is the combination of a system config (stat models, defaults, conditions) and a theme config (visual identity). Multi-frame architecture is a Wave 1 design constraint; a second frame is post-MVP. |
| **System config** | Data file/config defining the active TTRPG system's stat models, default values, and condition lists. Loaded at runtime; not hardcoded. (REQ-018) |
| **Theme** | Data file/config defining colors, typography, frame artwork, and layout tokens for a frame. Theme-as-data is a first-class architectural commitment, not CSS. (REQ-019) |
| **Stat track** | Generic component family for rendering and manipulating any pip/slot resource (Hope, HP, Stress, Fear, Armor) driven by system config — track length, label, and manipulation rules come from data. (REQ-020) |
| **OBS** | Open Broadcaster Software. Free desktop streaming/recording tool. Vellum is delivered to Discord via OBS. |
| **OBS browser source** | OBS scene element that renders a web URL using Chromium Embedded Framework (CEF). Vellum runs as a browser source at 1920×1080 with transparency. |
| **OBS Virtual Camera** | OBS feature that exposes the OBS scene output as a virtual webcam device. Selected as the camera input in Discord, this is how Vellum's composited output reaches the call. |
| **Discord webcam** | The video input Discord uses for a participant's video tile. Enforces 16:9 aspect ratio; multi-person calls render at ~480p effective resolution (community-reported). |
| **Local-only** | Vellum design principle: no backend, no auth, no network calls after initial load. Each player's instance is self-contained; persistence is localStorage + JSON files. |
| **Persona** | A representative archetype of a Vellum user. Vellum has two: Player and GM (see §4.0). |
| **REQ-ID** | Stable identifier for a single requirement (`REQ-NNN`, zero-padded, contiguous 001–054). Used for traceability between requirements (§5.1–5.4), user stories (§4.1), acceptance criteria (§6.2), and the traceability matrix (§8.3). |
| **MoSCoW** | Prioritization shorthand: **Must**-have (required for MVP), **Should**-have (significantly improves MVP, workaround exists), **Could**-have (quality-of-life), **Won't**-have (explicitly out of scope). Anchored to the success criterion: a Must blocks the "whole group runs one DH session" milestone. |

### 8.2 References

- **Discovery Q&A.** Synthesized source. See `ideate/prd-audit.md` ## Discovery section.
- **Daggerheart SRD** — daggerheartsrd.com (Sept 2025 SRD baseline).
- **Old Gus' DHSRD (community SRD)** — https://callmepartario.github.io/og-dhsrd/
- **Class data** — https://heartofdaggers.com/wiki/classes/
- **Awesome-daggerheart curated tooling list** — https://github.com/daggerheart-gm/awesome-daggerheart
- **OBS Virtual Camera guide** — https://obsproject.com/kb/virtual-camera-guide
- **Discord webcam aspect ratio** — https://support.discord.com/hc/en-us/community/posts/360039369951

### 8.3 Requirements Traceability

| REQ-ID | Description | MoSCoW | Owning Section | Source / Pain Point Link |
|--------|-------------|--------|----------------|--------------------------|
| REQ-001 | Hope pip display (max 6) | Must | 5.1 | Discovery Q10; Knowledge (Hope=6 verified); Pain: presence breakage |
| REQ-002 | Hope one-click manipulation | Must | 5.1 | Knowledge update-frequency gradient; Pain: presence breakage |
| REQ-003 | HP track display (class-variable 5–12) | Must | 5.1 | Discovery Q10; Knowledge (HP class-variable) |
| REQ-004 | HP slot manipulation | Must | 5.1 | Discovery Q10 |
| REQ-005 | HP Major/Severe threshold indicators | Should | 5.1 | Knowledge (armor thresholds); supports damage resolution |
| REQ-006 | Stress track display (default 6, max 12) | Must | 5.1 | Discovery Q10; Knowledge (Stress=6 default) |
| REQ-007 | Stress slot manipulation | Must | 5.1 | Discovery Q10 |
| REQ-008 | Armor slots display (0/3/4 by armor type) | Must | 5.1 | Discovery Q11; Knowledge (armor table) |
| REQ-009 | Armor slot manipulation | Must | 5.1 | Discovery Q11 |
| REQ-010 | Core condition badges (Hidden/Restrained/Vulnerable) | Must | 5.1 | Discovery Q11; Knowledge (3 core conditions) |
| REQ-011 | Core condition toggle | Must | 5.1 | Discovery Q11 |
| REQ-012 | Feature condition badges (extensible) | Should | 5.1 | Knowledge (~13 feature conditions) |
| REQ-013 | Character identity label (Name + Class + Ancestry) | Must | 5.1 | Discovery Q11; Knowledge (compact label) |
| REQ-014 | Optional identity fields (Subclass/Community/Level) | Could | 5.1 | Knowledge (full identity tuple) |
| REQ-015 | Fear pip display (max 12) | Must | 5.1 | Discovery Q10; Knowledge (Fear=12 verified) |
| REQ-016 | Fear one-click manipulation | Must | 5.1 | Knowledge update-frequency gradient |
| REQ-017 | Distinct GM view mode | Must | 5.1 | Briefing (GM view = Fear only) |
| REQ-018 | System config as data | Must | 5.1 | PRD 3.3; Discovery Q13; Opportunity recommendation |
| REQ-019 | Theme config as data | Must | 5.1 | Discovery Q14; Opportunity differentiation |
| REQ-020 | Generic stat-track component abstraction | Must | 5.1 | Architectural commitment; Discovery Q13 |
| REQ-021 | localStorage session persistence | Must | 5.1 | Discovery Q15; PRD 3.3 |
| REQ-022 | JSON character import | Must | 5.1 | Discovery Q15; PRD 3.3 |
| REQ-023 | JSON character export | Must | 5.1 | Discovery Q15; PRD 3.3 |
| REQ-024 | In-session manipulation without alt-tab | Must | 5.1 | Pain: presence breakage; Discovery overall framing |
| REQ-025 | Hope/Fear single-click cost | Must | 5.1 | Knowledge update-frequency; Pain: presence (highest-frequency interactions) |
| REQ-026 | Conditions toggle panel acceptable | Could | 5.1 | Knowledge update-frequency (conditions are rare) |
| REQ-027 | 1920×1080 canvas | Must | 5.2 | PRD 3.3; Knowledge OBS envelope |
| REQ-028 | 640×360 effective legibility | Must | 5.2 | PRD 3.3; Knowledge Discord envelope |
| REQ-029 | Thumbnail (~200–300px) scannability | Should | 5.2 | Knowledge (4–6 participant tile size) |
| REQ-030 | Local-only operation (no network) | Must | 5.2 | PRD 3.3; Discovery Q9 |
| REQ-031 | Refresh resilience (<1s restore) | Must | 5.2 | Discovery Q15 (persistence purpose) |
| REQ-032 | Render performance under OBS | Must | 5.2 | PRD 3.3 (OBS pipeline viability) |
| REQ-033 | TypeScript source | Must | 5.2 | PRD 3.3; Discovery Q8 |
| REQ-034 | Modern Chromium target | Must | 5.2 | PRD 3.3 (OBS = CEF) |
| REQ-035 | Daggerheart aesthetic alignment | Should | 5.2 | Discovery Q14; Opportunity differentiation |
| REQ-036 | Per-instance state isolation | Must | 5.2 | Discovery Q9 (no sync) |
| REQ-037 | OBS setup documentation | Should | 5.2 | Opportunity risk: OBS proficiency variance |
| REQ-038 | OBS browser source rendering target | Must | 5.3 | PRD 3.3; Knowledge OBS envelope |
| REQ-039 | OBS Virtual Camera scene compatibility | Must | 5.3 | PRD 3.3; Knowledge integration path |
| REQ-040 | Discord webcam input format compliance | Must | 5.3 | PRD 3.3; Knowledge (16:9 enforced) |
| REQ-041 | File-system character JSON I/O | Must | 5.3 | Discovery Q15 |
| REQ-042 | No external API integrations | Must | 5.3 | PRD 3.3; Discovery Q9 |
| REQ-043 | No backend / accounts / auth | Won't | 5.4 | Discovery out-of-scope |
| REQ-044 | No multiplayer state sync | Won't | 5.4 | Discovery Q9 |
| REQ-045 | No GM cross-player visibility | Won't | 5.4 | PRD 3.4 explicit deferral |
| REQ-046 | No mobile / non-desktop | Won't | 5.4 | Discovery out-of-scope |
| REQ-047 | No public-release packaging | Won't | 5.4 | Discovery out-of-scope |
| REQ-048 | No dice rolling | Won't | 5.4 | Briefing out-of-scope |
| REQ-049 | No second system frame at MVP | Won't (MVP) | 5.4 | Discovery Q13 |
| REQ-050 | No per-roll automation | Won't | 5.4 | Scope discipline |
| REQ-051 | No custom-condition editor | Won't | 5.4 | Scope discipline |
| REQ-052 | No character creation UI | Won't | 5.4 | Demiplane/HeartSmith handle this |
| REQ-053 | No cross-browser support beyond Chromium | Won't | 5.4 | OBS = Chromium |
| REQ-054 | No HP/Stress advancement automation | Won't (MVP) | 5.4 | Infrequent; JSON edit acceptable |
