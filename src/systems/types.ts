import type { TrackId } from '../commands/types';
import type { StatTrackInteraction, StatTrackShape } from '../components/StatTrack';

export const CORE_CONDITION_IDS = ['hidden', 'restrained', 'vulnerable'] as const;
export type CoreConditionId = (typeof CORE_CONDITION_IDS)[number];

export const SYSTEM_IDS = ['daggerheart'] as const;

export interface CoreConditionDef {
  readonly id: CoreConditionId;
  readonly label: string;
}

/**
 * A resource the system tracks (Hope, HP, Fear…), declared as data so the HUD
 * can render its roster from the system instead of one component per stat.
 * How it is drawn (bar or chits) is the frame's call, not the system's.
 */
export interface ResourceDef {
  readonly id: TrackId;
  readonly label: string;
  /** What a position means: drives `data-state` and aria wording. */
  readonly shape: StatTrackShape;
  readonly interaction: StatTrackInteraction;
  /** CSS color reference for the fill, from the design tokens. */
  readonly tone: string;
  /** Whose HUD shows it: a player's character, or the GM's own pool. */
  readonly side: 'player' | 'gm';
  /** Extra controls drawn under the track. */
  readonly addon?: 'damage-thresholds';
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
  /** In HUD order. */
  readonly resources: readonly ResourceDef[];
}

export type SystemConfig = DaggerheartSystemConfig;

export type SystemId = SystemConfig['id'];
