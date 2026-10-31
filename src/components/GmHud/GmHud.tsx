import './GmHud.css';
import { Fear } from './Fear';
import { DiceRoller } from '../DiceRoller';
import { HudRegion } from '../HudRegion';

/** The GM's HUD: the Fear pool and the dice, placed by the frame. */
export function GmHud() {
  return (
    <section className="gm-hud" aria-label="GM HUD">
      <HudRegion widget="vitals">
        <Fear />
      </HudRegion>
      <HudRegion widget="dice">
        <DiceRoller />
      </HudRegion>
    </section>
  );
}
