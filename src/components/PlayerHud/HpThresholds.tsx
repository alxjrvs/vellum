import './HpThresholds.css';
import type { CharacterThresholds } from '../../character/types';

/**
 * Surfaces Daggerheart's damage breakpoints beside the HP track. Incoming
 * damage below the Major value is Minor (mark 1 HP); at/above Major is Major
 * (2 HP); at/above Severe is Severe (3 HP). The two threshold numbers sit
 * between the three tier labels, mirroring the character sheet.
 */
export function HpThresholds({ thresholds }: { thresholds: CharacterThresholds }) {
  return (
    <section className="hp-thresholds" aria-label="Damage thresholds">
      <div className="hp-thresholds__tier" data-tier="minor">
        <span className="hp-thresholds__name">Minor</span>
        <span className="hp-thresholds__cost">1 HP</span>
      </div>
      <span className="hp-thresholds__mark" aria-label={`Major threshold ${thresholds.major}`}>
        {thresholds.major}
      </span>
      <div className="hp-thresholds__tier" data-tier="major">
        <span className="hp-thresholds__name">Major</span>
        <span className="hp-thresholds__cost">2 HP</span>
      </div>
      <span className="hp-thresholds__mark" aria-label={`Severe threshold ${thresholds.severe}`}>
        {thresholds.severe}
      </span>
      <div className="hp-thresholds__tier" data-tier="severe">
        <span className="hp-thresholds__name">Severe</span>
        <span className="hp-thresholds__cost">3 HP</span>
      </div>
    </section>
  );
}
