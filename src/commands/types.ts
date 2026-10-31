import type { CoreConditionId } from '../systems/types';

/**
 * Every input that can change the HUD (a click, an OBS hotkey, a Stream Deck
 * key) speaks this one vocabulary. Commands are relative where they can be
 * (`track.adjust`), so two quick presses always add up no matter how they
 * interleave with clicks.
 *
 * Track ids name a stat by what it is, not by how a frame draws it: a frame
 * may show `hp` as a bar or as chits, and the command is the same.
 */
export const TRACK_IDS = ['hope', 'hp', 'stress', 'armor', 'fear'] as const;
export type TrackId = (typeof TRACK_IDS)[number];

export type Command =
  /** Mark (`delta > 0`) or clear (`delta < 0`) slots; for Hope and Fear, gain or spend. */
  | { readonly type: 'track.adjust'; readonly track: TrackId; readonly delta: number }
  /** Set a track to an absolute marked count / value. */
  | { readonly type: 'track.set'; readonly track: TrackId; readonly value: number }
  | { readonly type: 'condition.toggle'; readonly condition: CoreConditionId }
  | { readonly type: 'feature.toggle'; readonly name: string };
