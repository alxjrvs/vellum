import { useCharacter } from '../../character/useCharacter';
import { StatTrack } from '../StatTrack';

export function Stress() {
  const { character, dispatch } = useCharacter();
  if (!character) return null;
  return (
    <StatTrack
      label="Stress"
      shape="box"
      interaction="level"
      tone="var(--color-accent)"
      trackLength={character.slotCounts.stress}
      currentValue={character.stats.stress.length}
      onSetValue={(count) => dispatch({ type: 'STRESS_SET', count })}
    />
  );
}
