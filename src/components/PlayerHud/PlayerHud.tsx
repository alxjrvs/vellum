import './PlayerHud.css';
import { useCharacter } from '../../character/useCharacter';
import { IdentityLabel } from './IdentityLabel';
import { Hope } from './Hope';
import { HP } from './HP';
import { Stress } from './Stress';
import { Armor } from './Armor';
import { ConditionsPanel } from './ConditionsPanel';

export function PlayerHud() {
  const { character } = useCharacter();
  if (!character) return null;
  return (
    <section className="player-hud" aria-label="Player HUD">
      <IdentityLabel />
      <Hope />
      <HP />
      <Stress />
      <Armor />
      <ConditionsPanel />
    </section>
  );
}
