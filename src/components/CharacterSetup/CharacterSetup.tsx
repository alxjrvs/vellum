import './CharacterSetup.css';
import { useId, useState, type ComponentProps } from 'react';
import { useCharacter } from '../../character/useCharacter';
import { useSystem } from '../../systems/useSystem';
import { encodeCharacterToShareParam } from '../../character/shareCode';
import { CHARACTER_SCHEMA_VERSION, type CharacterState } from '../../character/types';

interface CharacterSetupProps {
  /** Called after a successful save, to return to the overlay. */
  onDone: () => void;
}

interface FormState {
  name: string;
  className: string;
  ancestry: string;
  subclass: string;
  community: string;
  level: string;
  hp: number;
  stress: number;
  armorSlots: number;
  hope: number;
  major: string;
  severe: string;
}

function initialForm(character: CharacterState | null): FormState {
  return {
    name: character?.identity.name ?? '',
    className: character?.identity.class ?? '',
    ancestry: character?.identity.ancestry ?? '',
    subclass: character?.identity.subclass ?? '',
    community: character?.identity.community ?? '',
    level: character?.identity.level !== undefined ? String(character.identity.level) : '',
    hp: character?.slotCounts.hp ?? 6,
    stress: character?.slotCounts.stress ?? 6,
    armorSlots: character?.slotCounts.armorSlots ?? 3,
    hope: character?.stats.hope ?? 2,
    major: character?.thresholds?.major !== undefined ? String(character.thresholds.major) : '',
    severe: character?.thresholds?.severe !== undefined ? String(character.thresholds.severe) : '',
  };
}

function toInt(value: string): number | undefined {
  const n = Number.parseInt(value, 10);
  return Number.isFinite(n) ? n : undefined;
}

export function CharacterSetup({ onDone }: CharacterSetupProps) {
  const { character, dispatch } = useCharacter();
  const system = useSystem();
  const [form, setForm] = useState<FormState>(() => initialForm(character));
  const [error, setError] = useState<string | null>(null);
  const [shareCopied, setShareCopied] = useState(false);

  const handleCopyShareLink = () => {
    if (!character) return;
    const url = `${window.location.origin}${window.location.pathname}?c=${encodeCharacterToShareParam(character)}`;
    void navigator.clipboard.writeText(url).then(
      () => setShareCopied(true),
      () => setShareCopied(false)
    );
  };

  const set =
    <K extends keyof FormState>(key: K) =>
    (value: FormState[K]) =>
      setForm((f) => ({ ...f, [key]: value }));

  const handleSubmit: NonNullable<ComponentProps<'form'>['onSubmit']> = (event) => {
    event.preventDefault();
    const name = form.name.trim();
    const className = form.className.trim();
    const ancestry = form.ancestry.trim();
    if (!name || !className || !ancestry) {
      setError('Name, class, and ancestry are required.');
      return;
    }

    const level = toInt(form.level);
    const major = toInt(form.major);
    const severe = toInt(form.severe);
    // Keep any current marks that still fit inside the new maxes.
    const clamp = (marks: readonly number[] | undefined, max: number) =>
      (marks ?? []).filter((i) => i < max);

    const next: CharacterState = {
      version: CHARACTER_SCHEMA_VERSION,
      system: 'daggerheart',
      identity: {
        name,
        class: className,
        ancestry,
        ...(form.subclass.trim() ? { subclass: form.subclass.trim() } : {}),
        ...(form.community.trim() ? { community: form.community.trim() } : {}),
        ...(level !== undefined ? { level } : {}),
      },
      stats: {
        hope: Math.min(Math.max(form.hope, 0), system.hope.max),
        hp: clamp(character?.stats.hp, form.hp),
        stress: clamp(character?.stats.stress, form.stress),
        armorSlots: clamp(character?.stats.armorSlots, form.armorSlots),
        ...(character?.stats.fear !== undefined ? { fear: character.stats.fear } : {}),
      },
      slotCounts: { hp: form.hp, stress: form.stress, armorSlots: form.armorSlots },
      ...(major !== undefined && severe !== undefined ? { thresholds: { major, severe } } : {}),
      conditions: character?.conditions ?? {
        core: { hidden: false, restrained: false, vulnerable: false },
        feature: {},
      },
      featureConditions: character?.featureConditions ?? [],
    };

    dispatch({ type: 'SET_CHARACTER', character: next });
    setError(null);
    onDone();
  };

  return (
    <form className="character-setup" onSubmit={handleSubmit} aria-label="Character details">
      <h2 className="character-setup__title">Character details</h2>

      <fieldset className="character-setup__group">
        <legend>Identity</legend>
        <Field label="Name" value={form.name} onChange={set('name')} required />
        <Field label="Class" value={form.className} onChange={set('className')} required />
        <Field label="Ancestry" value={form.ancestry} onChange={set('ancestry')} required />
        <Field label="Subclass" value={form.subclass} onChange={set('subclass')} />
        <Field label="Community" value={form.community} onChange={set('community')} />
        <Field label="Level" value={form.level} onChange={set('level')} type="number" min={1} />
      </fieldset>

      <fieldset className="character-setup__group">
        <legend>Max values</legend>
        <NumberField label="HP slots" value={form.hp} onChange={set('hp')} min={1} />
        <NumberField label="Stress slots" value={form.stress} onChange={set('stress')} min={1} />
        <NumberField
          label="Armor slots"
          value={form.armorSlots}
          onChange={set('armorSlots')}
          min={0}
        />
        <NumberField
          label="Starting Hope"
          value={form.hope}
          onChange={set('hope')}
          min={0}
          max={system.hope.max}
        />
      </fieldset>

      <fieldset className="character-setup__group">
        <legend>HP thresholds (optional)</legend>
        <Field label="Major" value={form.major} onChange={set('major')} type="number" min={1} />
        <Field label="Severe" value={form.severe} onChange={set('severe')} type="number" min={1} />
      </fieldset>

      {error && (
        <p className="character-setup__error" role="alert">
          {error}
        </p>
      )}

      <div className="character-setup__actions">
        <button type="submit" className="character-setup__submit">
          Show overlay
        </button>
        {character && (
          <button type="button" className="character-setup__cancel" onClick={onDone}>
            Cancel
          </button>
        )}
      </div>

      {character && (
        <div className="character-setup__share">
          <button
            type="button"
            className="character-setup__share-button"
            onClick={handleCopyShareLink}
          >
            {shareCopied ? 'Share link copied' : 'Copy share link'}
          </button>
          <p className="character-setup__share-hint">
            Paste this link into OBS to load {character.identity.name} with no Interact window.
          </p>
        </div>
      )}
    </form>
  );
}

interface FieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: 'text' | 'number';
  required?: boolean;
  min?: number;
}

function Field({ label, value, onChange, type = 'text', required, min }: FieldProps) {
  const id = useId();
  return (
    <div className="character-setup__field">
      <label htmlFor={id}>
        {label}
        {required && <span aria-hidden="true"> *</span>}
      </label>
      <input
        id={id}
        type={type}
        value={value}
        aria-required={required}
        min={min}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}

interface NumberFieldProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
}

function NumberField({ label, value, onChange, min, max }: NumberFieldProps) {
  const id = useId();
  return (
    <div className="character-setup__field">
      <label htmlFor={id}>{label}</label>
      <input
        id={id}
        type="number"
        value={value}
        min={min}
        max={max}
        onChange={(e) => onChange(Number.parseInt(e.target.value, 10) || 0)}
      />
    </div>
  );
}
