import type { TrackId } from '../commands/types';
import type { StatTrackProps } from '../components/StatTrack';
import { useSystem } from '../systems/useSystem';
import { useCharacter } from './useCharacter';

export type ResourceBinding = Pick<
  StatTrackProps,
  'trackLength' | 'currentValue' | 'onSetValue' | 'markedSlots' | 'onToggleSlot'
>;

/**
 * Where a player resource lives in the character record, and how the track
 * writes back to it. Returns null when there is nothing to draw: no character
 * yet, a resource with no slots (unarmored), or a GM-side resource.
 */
export function useResourceBinding(id: TrackId): ResourceBinding | null {
  const { character, dispatch } = useCharacter();
  const system = useSystem();
  if (!character) return null;
  const { stats, slotCounts } = character;
  switch (id) {
    case 'hope':
      return {
        trackLength: system.hope.max,
        currentValue: stats.hope,
        onSetValue: (value) => dispatch({ type: 'HOPE_SET', value, max: system.hope.max }),
      };
    case 'hp': {
      // Hearts read as remaining health: full hearts fill from the left and
      // deplete from the right. `stats.hp` stores marked (damaged) slots, so
      // health is the complement, and N health means total - N damage taken.
      const total = slotCounts.hp;
      return {
        trackLength: total,
        currentValue: total - stats.hp.length,
        onSetValue: (health) => dispatch({ type: 'HP_SET', count: total - health }),
      };
    }
    case 'stress':
      return {
        trackLength: slotCounts.stress,
        currentValue: stats.stress.length,
        onSetValue: (count) => dispatch({ type: 'STRESS_SET', count }),
      };
    case 'armor':
      if (slotCounts.armorSlots === 0) return null;
      return {
        trackLength: slotCounts.armorSlots,
        currentValue: stats.armorSlots.length,
        markedSlots: stats.armorSlots,
        onToggleSlot: (index) => dispatch({ type: 'ARMOR_TOGGLE_SLOT', index }),
      };
    case 'fear':
      return null;
  }
}
