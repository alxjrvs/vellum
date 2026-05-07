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
      trackLength={system.hope.max}
      currentValue={character.stats.hope}
      onIncrement={() => dispatch({ type: 'HOPE_INCREMENT', max: system.hope.max })}
      onDecrement={() => dispatch({ type: 'HOPE_DECREMENT' })}
    />
  );
}
