import './HP.css';
import { useCharacter } from '../../character/useCharacter';
import { StatTrack } from '../StatTrack';
import { HpThresholds } from './HpThresholds';

export function HP() {
  const { character, dispatch } = useCharacter();
  if (!character) return null;
  // Hearts read as remaining health: full hearts fill from the left and deplete
  // from the right. `stats.hp` stores marked (damaged) slots, so health is the
  // complement, and setting the dial to N health means N.hp damage taken.
  const total = character.slotCounts.hp;
  const damage = character.stats.hp.length;
  const health = total - damage;
  const takeDamage = (amount: number) =>
    dispatch({ type: 'HP_SET', count: Math.min(damage + amount, total) });
  return (
    <div className="hp">
      <StatTrack
        label="HP"
        shape="heart"
        interaction="level"
        tone="var(--color-health)"
        trackLength={total}
        currentValue={health}
        onSetValue={(nextHealth) => dispatch({ type: 'HP_SET', count: total - nextHealth })}
      />
      {character.thresholds && (
        <HpThresholds thresholds={character.thresholds} onTakeDamage={takeDamage} />
      )}
    </div>
  );
}
