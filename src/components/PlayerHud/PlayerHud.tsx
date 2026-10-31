import './PlayerHud.css';
import { useCharacter } from '../../character/useCharacter';
import { useSystem } from '../../systems/useSystem';
import { Track } from '../Track';

export function PlayerHud() {
  const { character } = useCharacter();
  const system = useSystem();
  if (!character) return null;
  return (
    <section className="player-hud" aria-label="Player HUD">
      {system.resources
        .filter((resource) => resource.side === 'player')
        .map((resource) => (
          <Track key={resource.id} id={resource.id} />
        ))}
    </section>
  );
}
