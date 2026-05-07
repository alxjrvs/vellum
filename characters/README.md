# Character JSON preparation (issue #23)

Each player needs a Vellum character JSON file ready before the live
Daggerheart session (issue #24). This directory holds the canonical
template plus per-player files (gitignored — see below).

## The template

`template.character.json` is the canonical empty character. Copy it to
a per-player file and fill in the values from each player's Daggerheart
character sheet (Demiplane or paper).

```sh
cp characters/template.character.json characters/<player-name>.character.json
```

Per-player JSONs are **not** checked in (see `.gitignore`) — they
contain personal player data that doesn't need to live in the public
repo. The template is the only file in this directory that's tracked.

## How to fill out each field

### `identity`

| Field       | Source                               | Required? | Example       |
| ----------- | ------------------------------------ | --------- | ------------- |
| `name`      | Character name from sheet            | Yes       | `"Seraphine"` |
| `class`     | Class from sheet                     | Yes       | `"Bard"`      |
| `ancestry`  | Ancestry from sheet                  | Yes       | `"Elf"`       |
| `subclass`  | Subclass from sheet (if at level 2+) | Optional  | `"Wordsmith"` |
| `community` | Community from sheet                 | Optional  | `"Loreborne"` |
| `level`     | Current level (1–10)                 | Optional  | `2`           |

If a field is empty on the player's sheet, omit it from the JSON or
delete the key entirely (don't leave `"REPLACE_ME"` in place — it will
render literally in the HUD).

### `slotCounts`

These are the **maximums** the HUD renders pips for. Derive them from
the Daggerheart class and equipment tables:

#### `hp` — by class

The HP cap is class-dependent. From `src/systems/daggerheart.system.ts`:

| Class    | HP slots |
| -------- | -------- |
| Bard     | 6        |
| Druid    | 6        |
| Guardian | 7        |
| Ranger   | 6        |
| Rogue    | 6        |
| Seraph   | 7        |
| Sorcerer | 5        |
| Warrior  | 6        |
| Wizard   | 5        |

If the character has level-up advancements that increase HP, add the
advancement count to the base value.

#### `stress` — class default + advancements

Default is **6**. If the character has taken the "+1 stress slot"
advancement at any tier, add 1 per advancement (cap 12).

#### `armorSlots` — by armor type

Equipment table from `src/systems/daggerheart.system.ts`:

| Armor type | Armor slots |
| ---------- | ----------- |
| Unarmored  | 0           |
| Gambeson   | 3           |
| Leather    | 3           |
| Chainmail  | 4           |
| Fullplate  | 4           |

Use the slot count for the armor the character is currently wearing.

### `thresholds`

Major and severe damage thresholds from the character sheet (sheet
typically lists "Major" and "Severe" thresholds beside the HP track).
Vellum uses 1-indexed slot positions:

- `major` — the slot at or above which a hit becomes a major hit
  (typically 1 + the level-1 minor threshold)
- `severe` — the slot at or above which a hit becomes a severe hit

If unknown, omit the `thresholds` object entirely. The HUD will render
without threshold indicators.

### `stats`

| Field        | Default | Notes                                          |
| ------------ | ------- | ---------------------------------------------- |
| `hope`       | `2`     | Daggerheart starting Hope. Adjust mid-session. |
| `hp`         | `[]`    | Filled slot indices (1-indexed)                |
| `stress`     | `[]`    | Filled slot indices (1-indexed)                |
| `armorSlots` | `[]`    | Filled slot indices (1-indexed)                |

Leave `hp`, `stress`, and `armorSlots` as empty arrays at session start
— they fill during play as the HUD is clicked.

### `conditions.core`

Vellum's three core conditions. Default all to `false` at session
start.

### `conditions.feature` and `featureConditions`

Feature conditions are class- and ability-specific (e.g., a Sorcerer's
"Volatile" or a Bard's "Heard of the Hour"). They're discoverable from
the character's sheet by looking at any ability that introduces a
trackable state.

The mapping:

- `featureConditions` — array of condition **labels** to render as
  badges (`["Volatile", "Inspired"]`)
- `conditions.feature` — boolean state per label
  (`{ "Volatile": false, "Inspired": false }`)

Both arrays must contain the same set of names. If the player doesn't
have any feature conditions, leave both as `[]` and `{}` respectively.

## Testing your file

Before session day:

1. Run `bun run dev` to start the dev server.
2. Open the app in your browser at the URL it prints.
3. Use the **Import character** button and select your filled-in
   `<name>.character.json` file.
4. Verify against your sheet that:
   - Identity label matches (name, class, ancestry, optional fields)
   - HP slot count matches
   - Stress slot count matches
   - Armor slot count matches the equipped armor
   - All feature condition badges are present and labelled correctly

If anything mismatches, edit the JSON and re-import. **No manual
corrections in the HUD should be needed to match the sheet** —
that's AC #2 of issue #23.

## Submitting your file

Each player runs the test above on their own machine, then keeps the
JSON locally for the session. The operator does not need a copy — the
files don't live in this repo.

For #24's pre-session check, each player should be ready to demo
"import → HUD looks right" on the rehearsal call.
