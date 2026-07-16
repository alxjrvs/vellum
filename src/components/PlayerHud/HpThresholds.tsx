import './HpThresholds.css';
import type { CharacterThresholds } from '../../character/types';

interface HpThresholdsProps {
  thresholds: CharacterThresholds;
  /** Apply a tier of damage (Minor=1, Major=2, Severe=3 HP marked). */
  onTakeDamage: (amount: number) => void;
}

/**
 * Surfaces Daggerheart's damage breakpoints beside the HP track. Incoming
 * damage below the Major value is Minor (mark 1 HP); at/above Major is Major
 * (2 HP); at/above Severe is Severe (3 HP). The two threshold numbers sit
 * between the three tier labels, mirroring the character sheet. Each tier is a
 * button that marks that much damage.
 */
export function HpThresholds({ thresholds, onTakeDamage }: HpThresholdsProps) {
  return (
    <section className="hp-thresholds" aria-label="Damage thresholds">
      <button
        type="button"
        className="hp-thresholds__tier"
        data-tier="minor"
        aria-label="Take Minor damage, mark 1 HP"
        onClick={() => onTakeDamage(1)}
      >
        <span className="hp-thresholds__name">Minor</span>
        <span className="hp-thresholds__cost">1 HP</span>
      </button>
      <span className="hp-thresholds__mark" aria-label={`Major threshold ${thresholds.major}`}>
        {thresholds.major}
      </span>
      <button
        type="button"
        className="hp-thresholds__tier"
        data-tier="major"
        aria-label="Take Major damage, mark 2 HP"
        onClick={() => onTakeDamage(2)}
      >
        <span className="hp-thresholds__name">Major</span>
        <span className="hp-thresholds__cost">2 HP</span>
      </button>
      <span className="hp-thresholds__mark" aria-label={`Severe threshold ${thresholds.severe}`}>
        {thresholds.severe}
      </span>
      <button
        type="button"
        className="hp-thresholds__tier"
        data-tier="severe"
        aria-label="Take Severe damage, mark 3 HP"
        onClick={() => onTakeDamage(3)}
      >
        <span className="hp-thresholds__name">Severe</span>
        <span className="hp-thresholds__cost">3 HP</span>
      </button>
    </section>
  );
}
