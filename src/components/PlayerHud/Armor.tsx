import { useCharacter } from '../../character/useCharacter';
import { StatTrack } from '../StatTrack';
import { useTrackDisplay } from '../../themes/useTrackDisplay';

export function Armor() {
  const display = useTrackDisplay('armor');
  const { character, dispatch } = useCharacter();
  if (!character) return null;
  if (character.slotCounts.armorSlots === 0) return null;
  return (
    <StatTrack
      label="Armor"
      shape="box"
      interaction="toggle"
      tone="var(--color-armor)"
      display={display}
      trackLength={character.slotCounts.armorSlots}
      currentValue={character.stats.armorSlots.length}
      markedSlots={character.stats.armorSlots}
      onToggleSlot={(index) => dispatch({ type: 'ARMOR_TOGGLE_SLOT', index })}
    />
  );
}
