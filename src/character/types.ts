import type { CoreConditionId, SystemId } from '../systems/types';

export interface CharacterIdentity {
  readonly name: string;
  readonly class: string;
  readonly ancestry: string;
  readonly subclass?: string;
  readonly community?: string;
  readonly level?: number;
}

export interface CharacterStats {
  readonly hope: number;
  /**
   * @deprecated Fear is GM state and now lives under its own `vellum:fear`
   * storage key (see `src/gm/fearStorage.ts`). Retained so existing records
   * still parse and can seed the new store once; nothing writes it.
   */
  readonly fear?: number;
  readonly hp: readonly number[];
  readonly stress: readonly number[];
  readonly armorSlots: readonly number[];
}

export interface CharacterSlotCounts {
  readonly hp: number;
  readonly stress: number;
  readonly armorSlots: number;
}

export interface CharacterConditions {
  readonly core: Readonly<Record<CoreConditionId, boolean>>;
  readonly feature: Readonly<Record<string, boolean>>;
}

export interface CharacterThresholds {
  readonly major: number;
  readonly severe: number;
}

export const CHARACTER_SCHEMA_VERSION = 1 as const;

export interface CharacterState {
  readonly version: typeof CHARACTER_SCHEMA_VERSION;
  readonly system: SystemId;
  readonly identity: CharacterIdentity;
  readonly stats: CharacterStats;
  readonly slotCounts: CharacterSlotCounts;
  readonly thresholds?: CharacterThresholds;
  readonly conditions: CharacterConditions;
  readonly featureConditions: readonly string[];
}
