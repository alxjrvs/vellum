import { useCharacter } from '../../character/useCharacter';
import { useSystem } from '../../systems/useSystem';
import { StatTrack } from '../StatTrack';

export function Fear() {
  const { character, dispatch } = useCharacter();
  const system = useSystem();
  if (!character) return null;
  return (
    <StatTrack
      label="Fear"
      trackLength={system.fear.max}
      currentValue={character.stats.fear ?? 0}
      onIncrement={() => dispatch({ type: 'FEAR_INCREMENT', max: system.fear.max })}
      onDecrement={() => dispatch({ type: 'FEAR_DECREMENT' })}
    />
  );
}
