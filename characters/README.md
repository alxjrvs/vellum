# Character values reference (issue #23)

You enter your character directly in Vellum's in-app **Character details**
form (there's no file to import). This doc is the reference for **what
values to enter**, derived from each player's Daggerheart character sheet
(Demiplane or paper).

> The form fields map 1:1 to the sections below: **Identity** (name, class,
> ancestry, subclass, community, level), **Max values** (HP / Stress / Armor
> slots, Starting Hope), and **HP thresholds** (Major / Severe). Current
> HP/Stress/Armor marks start empty and fill in as you click during play.

`template.character.json` and `sample.character.json` show the underlying
data shape (also what's persisted to localStorage), handy if you're editing
state by hand or building tooling — but day to day you just fill the form.

## What each value means

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

- `major` — the slot index that gets the "M" marker (1-indexed)
- `severe` — the slot index that gets the "S" marker (1-indexed)

Both must satisfy `1 ≤ major ≤ severe ≤ slotCounts.hp`. Values outside
that range render no markers. If unknown, omit the `thresholds` object
entirely.

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

## Rehearse before session day

1. Run `bun run dev` to start the dev server.
2. Open the app in your browser at the URL it prints.
3. Fill the **Character details** form with your values and click **Show
   overlay**.
4. Verify against your sheet that:
   - Identity label matches (name, class, ancestry, optional fields)
   - HP slot count matches
   - Stress slot count matches
   - Armor slot count matches the equipped armor
   - The M / S threshold markers sit on the right HP slots

If anything is off, click **Edit details**, fix the value, and **Show
overlay** again.

The details persist to that browser's localStorage, so nothing needs to be
submitted or shared — each player sets their own up on the machine they'll
stream from. For #24's pre-session check, each player should be ready to
demo "fill form → HUD looks right" on the rehearsal call.
