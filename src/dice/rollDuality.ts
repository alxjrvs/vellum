import { roll } from '@randsum/daggerheart';

/**
 * Daggerheart's Duality Dice: a d12 Hope die and a d12 Fear die rolled
 * together, plus a flat modifier and an optional Advantage/Disadvantage d6.
 * The higher duality die decides the outcome; matching dice are a critical.
 *
 * This is a thin, typed seam over `@randsum/daggerheart` so the UI depends on
 * a stable local shape rather than the roller engine's wrapper type.
 */

export type DualityAdvantage = 'none' | 'advantage' | 'disadvantage';

export type DualityOutcome = 'hope' | 'fear' | 'critical hope';

export interface DualityRollInput {
  /** Flat modifier added to the total (may be negative). */
  readonly modifier?: number;
  /** Whether an Advantage or Disadvantage d6 is rolled alongside. */
  readonly advantage?: DualityAdvantage;
}

export interface DualityRoll {
  /** Final total: Hope die + Fear die + modifier + advantage/disadvantage die. */
  readonly total: number;
  /** Which duality die won — drives the fiction (gain Hope / GM gains Fear / crit). */
  readonly outcome: DualityOutcome;
  /** The Hope d12 face. */
  readonly hope: number;
  /** The Fear d12 face. */
  readonly fear: number;
  /** The flat modifier applied to this roll. */
  readonly modifier: number;
  /** Signed contribution of the Advantage (+) or Disadvantage (-) d6, if any. */
  readonly advantageValue?: number;
  /** Which advantage mode was rolled with. */
  readonly rolledWith: DualityAdvantage;
}

const ADVANTAGE_ARG = {
  advantage: 'Advantage',
  disadvantage: 'Disadvantage',
} as const;

export function rollDuality(input: DualityRollInput = {}): DualityRoll {
  const modifier = input.modifier ?? 0;
  const rolledWith = input.advantage ?? 'none';

  const { total, result, details } = roll({
    modifier,
    ...(rolledWith !== 'none' ? { rollingWith: ADVANTAGE_ARG[rolledWith] } : {}),
  });

  // The roller engine types `details` as optional, but a Daggerheart roll
  // always resolves the duality dice — a missing payload is a contract break.
  if (!details) {
    throw new Error('randsum daggerheart roll returned no duality details');
  }

  return {
    total,
    outcome: result,
    hope: details.hope.roll,
    fear: details.fear.roll,
    modifier: details.modifier,
    advantageValue: details.advantage?.roll,
    rolledWith,
  };
}
