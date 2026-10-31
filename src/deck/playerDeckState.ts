import type { TrackId } from '../commands/types';
import type { CharacterState } from '../character/types';
import type { SystemConfig } from '../systems/types';
import type { DeckState, DeckTrack } from './protocol';

/** The player's stats as the HUD shows them, for the keys to draw. */
export function playerDeckState(character: CharacterState, system: SystemConfig): DeckState {
  const { stats, slotCounts, conditions } = character;
  const label = (id: TrackId) => system.resources.find((r) => r.id === id)?.label ?? id;
  const tracks: Partial<Record<TrackId, DeckTrack>> = {
    hope: { label: label('hope'), value: stats.hope, max: system.hope.max },
    // Hearts read as remaining health, so the key does too.
    hp: { label: label('hp'), value: slotCounts.hp - stats.hp.length, max: slotCounts.hp },
    stress: { label: label('stress'), value: stats.stress.length, max: slotCounts.stress },
  };
  if (slotCounts.armorSlots > 0) {
    tracks.armor = {
      label: label('armor'),
      value: stats.armorSlots.length,
      max: slotCounts.armorSlots,
    };
  }
  return { tracks, conditions: { ...conditions.core } };
}
