import { useCharacter } from '../../character/useCharacter';
import { StatTrack } from '../StatTrack';
import { useTrackDisplay } from '../../themes/useTrackDisplay';

export function Stress() {
  const display = useTrackDisplay('stress');
  const { character, dispatch } = useCharacter();
  if (!character) return null;
  return (
    <StatTrack
      label="Stress"
      shape="box"
      interaction="level"
      tone="var(--color-stress)"
      display={display}
      trackLength={character.slotCounts.stress}
      currentValue={character.stats.stress.length}
      onSetValue={(count) => dispatch({ type: 'STRESS_SET', count })}
    />
  );
}
