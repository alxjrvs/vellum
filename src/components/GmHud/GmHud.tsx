import './GmHud.css';
import { Fear } from './Fear';

export function GmHud() {
  return (
    <section className="gm-hud" aria-label="GM HUD">
      <Fear />
    </section>
  );
}
