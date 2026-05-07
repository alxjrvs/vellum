import { useCharacter } from '../../character/useCharacter';
import { StatTrack } from '../StatTrack';

export function Stress() {
  const { character, dispatch } = useCharacter();
  if (!character) return null;
  return (
    <StatTrack
      label="Stress"
      trackLength={character.slotCounts.stress}
      currentValue={character.stats.stress.length}
      markedSlots={character.stats.stress}
      onToggleSlot={(index) => dispatch({ type: 'STRESS_TOGGLE_SLOT', index })}
      onIncrement={() => {}}
    />
  );
}
