import { CHARACTER_SCHEMA_VERSION, type CharacterState } from './types';
import { CORE_CONDITION_IDS, SYSTEM_IDS, type CoreConditionId } from '../systems/types';

export type ParseResult =
  | { readonly ok: true; readonly character: CharacterState }
  | { readonly ok: false; readonly error: string };

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isNumberArray(value: unknown): value is number[] {
  return Array.isArray(value) && value.every((n) => typeof n === 'number' && Number.isFinite(n));
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((s) => typeof s === 'string');
}

function isBooleanRecord(value: unknown): value is Record<string, boolean> {
  return isObject(value) && Object.values(value).every((v) => typeof v === 'boolean');
}

export function parseCharacterJson(text: string): ParseResult {
  let value: unknown;
  try {
    value = JSON.parse(text);
  } catch {
    return { ok: false, error: 'File is not valid JSON.' };
  }
  return parseCharacter(value);
}

export function parseCharacter(value: unknown): ParseResult {
  if (!isObject(value)) return { ok: false, error: 'Character must be a JSON object.' };

  if (value.version !== CHARACTER_SCHEMA_VERSION) {
    return {
      ok: false,
      error: `Unsupported schema version: expected ${CHARACTER_SCHEMA_VERSION}, got ${String(value.version)}.`,
    };
  }

  const system = value.system;
  if (typeof system !== 'string' || !(SYSTEM_IDS as readonly string[]).includes(system)) {
    return { ok: false, error: `Unknown system "${String(system)}".` };
  }

  const identity = value.identity;
  if (!isObject(identity)) return { ok: false, error: 'Missing identity.' };
  if (typeof identity.name !== 'string' || identity.name.length === 0)
    return { ok: false, error: 'identity.name must be a non-empty string.' };
  if (typeof identity.class !== 'string' || identity.class.length === 0)
    return { ok: false, error: 'identity.class must be a non-empty string.' };
  if (typeof identity.ancestry !== 'string' || identity.ancestry.length === 0)
    return { ok: false, error: 'identity.ancestry must be a non-empty string.' };

  const stats = value.stats;
  if (!isObject(stats)) return { ok: false, error: 'Missing stats.' };
  if (typeof stats.hope !== 'number') return { ok: false, error: 'stats.hope must be a number.' };
  if (!isNumberArray(stats.hp)) return { ok: false, error: 'stats.hp must be a number array.' };
  if (!isNumberArray(stats.stress))
    return { ok: false, error: 'stats.stress must be a number array.' };
  if (!isNumberArray(stats.armorSlots))
    return { ok: false, error: 'stats.armorSlots must be a number array.' };
  if (stats.fear !== undefined && typeof stats.fear !== 'number')
    return { ok: false, error: 'stats.fear must be a number when present.' };

  const slotCounts = value.slotCounts;
  if (!isObject(slotCounts)) return { ok: false, error: 'Missing slotCounts.' };
  if (typeof slotCounts.hp !== 'number')
    return { ok: false, error: 'slotCounts.hp must be a number.' };
  if (typeof slotCounts.stress !== 'number')
    return { ok: false, error: 'slotCounts.stress must be a number.' };
  if (typeof slotCounts.armorSlots !== 'number')
    return { ok: false, error: 'slotCounts.armorSlots must be a number.' };

  const conditions = value.conditions;
  if (!isObject(conditions)) return { ok: false, error: 'Missing conditions.' };
  if (!isObject(conditions.core)) return { ok: false, error: 'conditions.core must be an object.' };
  for (const id of CORE_CONDITION_IDS) {
    if (typeof (conditions.core as Record<string, unknown>)[id] !== 'boolean') {
      return { ok: false, error: `conditions.core.${id} must be a boolean.` };
    }
  }
  if (!isBooleanRecord(conditions.feature)) {
    return { ok: false, error: 'conditions.feature must map condition ids to booleans.' };
  }

  if (!isStringArray(value.featureConditions))
    return { ok: false, error: 'featureConditions must be a string array.' };

  let thresholds: CharacterState['thresholds'];
  if (value.thresholds !== undefined) {
    if (!isObject(value.thresholds))
      return { ok: false, error: 'thresholds must be an object when present.' };
    if (typeof value.thresholds.major !== 'number')
      return { ok: false, error: 'thresholds.major must be a number.' };
    if (typeof value.thresholds.severe !== 'number')
      return { ok: false, error: 'thresholds.severe must be a number.' };
    thresholds = { major: value.thresholds.major, severe: value.thresholds.severe };
  }

  const character: CharacterState = {
    version: CHARACTER_SCHEMA_VERSION,
    system: system as CharacterState['system'],
    identity: {
      name: identity.name,
      class: identity.class,
      ancestry: identity.ancestry,
      ...(typeof identity.subclass === 'string' ? { subclass: identity.subclass } : {}),
      ...(typeof identity.community === 'string' ? { community: identity.community } : {}),
      ...(typeof identity.level === 'number' ? { level: identity.level } : {}),
    },
    stats: {
      hope: stats.hope,
      hp: [...stats.hp],
      stress: [...stats.stress],
      armorSlots: [...stats.armorSlots],
      ...(typeof stats.fear === 'number' ? { fear: stats.fear } : {}),
    },
    slotCounts: {
      hp: slotCounts.hp,
      stress: slotCounts.stress,
      armorSlots: slotCounts.armorSlots,
    },
    conditions: {
      core: Object.fromEntries(
        CORE_CONDITION_IDS.map((id) => [id, (conditions.core as Record<string, boolean>)[id]])
      ) as Record<CoreConditionId, boolean>,
      feature: { ...conditions.feature },
    },
    featureConditions: [...value.featureConditions],
    ...(thresholds ? { thresholds } : {}),
  };

  return { ok: true, character };
}
