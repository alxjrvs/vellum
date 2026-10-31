import { useCharacter } from '../../character/useCharacter';
import { useSystem } from '../../systems/useSystem';
import { StatTrack } from '../StatTrack';
import { useTrackDisplay } from '../../themes/useTrackDisplay';

export function Hope() {
  const display = useTrackDisplay('hope');
  const { character, dispatch } = useCharacter();
  const system = useSystem();
  if (!character) return null;
  return (
    <StatTrack
      label="Hope"
      shape="pip"
      interaction="level"
      tone="var(--color-signal)"
      display={display}
      trackLength={system.hope.max}
      currentValue={character.stats.hope}
      onSetValue={(value) => dispatch({ type: 'HOPE_SET', value, max: system.hope.max })}
    />
  );
}
