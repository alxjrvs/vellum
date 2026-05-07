import { useCharacter } from '../../character/useCharacter';
import { StatTrack } from '../StatTrack';

export function Armor() {
  const { character, dispatch } = useCharacter();
  if (!character) return null;
  if (character.slotCounts.armorSlots === 0) return null;
  return (
    <StatTrack
      label="Armor"
      trackLength={character.slotCounts.armorSlots}
      currentValue={character.stats.armorSlots.length}
      markedSlots={character.stats.armorSlots}
      onToggleSlot={(index) => dispatch({ type: 'ARMOR_TOGGLE_SLOT', index })}
      onIncrement={() => {}}
    />
  );
}
