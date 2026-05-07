export const CORE_CONDITION_IDS = ['hidden', 'restrained', 'vulnerable'] as const;
export type CoreConditionId = (typeof CORE_CONDITION_IDS)[number];

export const SYSTEM_IDS = ['daggerheart'] as const;

export interface CoreConditionDef {
  readonly id: CoreConditionId;
  readonly label: string;
}

export interface DaggerheartSystemConfig {
  readonly id: 'daggerheart';
  readonly label: string;
  readonly hope: { readonly max: number };
  readonly fear: { readonly max: number };
  readonly stress: { readonly defaultMax: number; readonly advancementMax: number };
  readonly hpClassTable: Readonly<Record<string, number>>;
  readonly armorTable: Readonly<Record<string, number>>;
  readonly coreConditions: readonly CoreConditionDef[];
}

export type SystemConfig = DaggerheartSystemConfig;

export type SystemId = SystemConfig['id'];
