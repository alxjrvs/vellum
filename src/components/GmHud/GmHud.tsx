import './GmHud.css';
import { Fear } from './Fear';
import { DiceRoller } from '../DiceRoller';

export function GmHud() {
  return (
    <section className="gm-hud" aria-label="GM HUD">
      <div className="hud__region hud__region--vitals">
        <Fear />
      </div>
      <div className="hud__region hud__region--dice">
        <DiceRoller />
      </div>
    </section>
  );
}
