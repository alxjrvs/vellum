import './PlayerHud.css';
import { useCharacter } from '../../character/useCharacter';
import { Hope } from './Hope';
import { HP } from './HP';
import { Stress } from './Stress';
import { Armor } from './Armor';

export function PlayerHud() {
  const { character } = useCharacter();
  if (!character) return null;
  return (
    <section className="player-hud" aria-label="Player HUD">
      <HP />
      <Hope />
      <Stress />
      <Armor />
    </section>
  );
}
