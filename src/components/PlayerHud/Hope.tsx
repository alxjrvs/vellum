import { useCharacter } from '../../character/useCharacter';
import { useSystem } from '../../systems/useSystem';
import { StatTrack } from '../StatTrack';

export function Hope() {
  const { character, dispatch } = useCharacter();
  const system = useSystem();
  if (!character) return null;
  return (
    <StatTrack
      label="Hope"
      shape="pip"
      interaction="level"
      tone="var(--color-gold)"
      trackLength={system.hope.max}
      currentValue={character.stats.hope}
      onSetValue={(value) => dispatch({ type: 'HOPE_SET', value, max: system.hope.max })}
    />
  );
}
