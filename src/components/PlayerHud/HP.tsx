import { useCharacter } from '../../character/useCharacter';
import { StatTrack } from '../StatTrack';

export function HP() {
  const { character, dispatch } = useCharacter();
  if (!character) return null;
  return (
    <StatTrack
      label="HP"
      trackLength={character.slotCounts.hp}
      currentValue={character.stats.hp.length}
      markedSlots={character.stats.hp}
      onToggleSlot={(index) => dispatch({ type: 'HP_TOGGLE_SLOT', index })}
      onIncrement={() => {}}
    />
  );
}
