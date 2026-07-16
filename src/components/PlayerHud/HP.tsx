import { useCharacter } from '../../character/useCharacter';
import { StatTrack } from '../StatTrack';

export function HP() {
  const { character, dispatch } = useCharacter();
  if (!character) return null;
  // Hearts read as remaining health: full hearts fill from the left and deplete
  // from the right. `stats.hp` stores marked (damaged) slots, so health is the
  // complement, and setting the dial to N health means N.hp damage taken.
  const total = character.slotCounts.hp;
  const health = total - character.stats.hp.length;
  // Damage now enters from the right, so mirror the damage thresholds to that
  // end — a threshold at the Nth point of damage sits N hearts from the right.
  const thresholds = character.thresholds
    ? {
        major: total - character.thresholds.major + 1,
        severe: total - character.thresholds.severe + 1,
      }
    : undefined;
  return (
    <StatTrack
      label="HP"
      shape="heart"
      interaction="level"
      tone="var(--color-health)"
      trackLength={total}
      currentValue={health}
      thresholds={thresholds}
      onSetValue={(nextHealth) => dispatch({ type: 'HP_SET', count: total - nextHealth })}
    />
  );
}
