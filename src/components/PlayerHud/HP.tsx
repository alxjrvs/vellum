import { useCharacter } from '../../character/useCharacter';
import { StatTrack } from '../StatTrack';

export function HP() {
  const { character, dispatch } = useCharacter();
  if (!character) return null;
  return (
    <StatTrack
      label="HP"
      shape="heart"
      interaction="level"
      tone="var(--color-health)"
      trackLength={character.slotCounts.hp}
      currentValue={character.stats.hp.length}
      thresholds={character.thresholds}
      onSetValue={(count) => dispatch({ type: 'HP_SET', count })}
    />
  );
}
