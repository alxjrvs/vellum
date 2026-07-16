import './DiceRoller.css';
import { useState } from 'react';
import { rollDuality, type DualityAdvantage, type DualityRoll } from '../../dice';

const ADVANTAGE_MODES: readonly { id: DualityAdvantage; label: string }[] = [
  { id: 'none', label: 'None' },
  { id: 'advantage', label: 'Advantage' },
  { id: 'disadvantage', label: 'Disadvantage' },
];

const OUTCOME_LABEL: Record<DualityRoll['outcome'], string> = {
  hope: 'With Hope',
  fear: 'With Fear',
  'critical hope': 'Critical!',
};

function signed(n: number): string {
  return n >= 0 ? `+${n}` : `${n}`;
}

export function DiceRoller() {
  const [modifier, setModifier] = useState(0);
  const [advantage, setAdvantage] = useState<DualityAdvantage>('none');
  const [roll, setRoll] = useState<DualityRoll | null>(null);

  return (
    <section className="dice-roller" aria-label="Duality dice roller">
      <header className="dice-roller__title">Duality Dice</header>

      <div className="dice-roller__controls">
        <div className="dice-roller__field" role="group" aria-label="Modifier">
          <span className="dice-roller__field-label">Modifier</span>
          <div className="dice-roller__stepper">
            <button
              type="button"
              className="dice-roller__step"
              aria-label="Decrease modifier"
              onClick={() => setModifier((m) => m - 1)}
            >
              −
            </button>
            <output className="dice-roller__mod-value" aria-label="Current modifier">
              {signed(modifier)}
            </output>
            <button
              type="button"
              className="dice-roller__step"
              aria-label="Increase modifier"
              onClick={() => setModifier((m) => m + 1)}
            >
              +
            </button>
          </div>
        </div>

        <div className="dice-roller__field" role="group" aria-label="Advantage">
          <span className="dice-roller__field-label">Advantage</span>
          <div className="dice-roller__toggle">
            {ADVANTAGE_MODES.map((mode) => (
              <button
                key={mode.id}
                type="button"
                className="dice-roller__toggle-option"
                data-active={advantage === mode.id}
                aria-pressed={advantage === mode.id}
                onClick={() => setAdvantage(mode.id)}
              >
                {mode.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <button
        type="button"
        className="dice-roller__roll"
        onClick={() => setRoll(rollDuality({ modifier, advantage }))}
      >
        Roll
      </button>

      {roll && (
        <div className="dice-roller__result" data-outcome={roll.outcome} aria-live="polite">
          <div className="dice-roller__total" aria-label="Roll total">
            {roll.total}
          </div>
          <div className="dice-roller__outcome">{OUTCOME_LABEL[roll.outcome]}</div>
          <dl className="dice-roller__breakdown">
            <div className="dice-roller__die" data-kind="hope">
              <dt>Hope</dt>
              <dd>{roll.hope}</dd>
            </div>
            <div className="dice-roller__die" data-kind="fear">
              <dt>Fear</dt>
              <dd>{roll.fear}</dd>
            </div>
            {roll.advantageValue !== undefined && (
              <div className="dice-roller__die" data-kind="advantage">
                <dt>{roll.rolledWith === 'disadvantage' ? 'Disadv.' : 'Adv.'}</dt>
                <dd>{signed(roll.advantageValue)}</dd>
              </div>
            )}
            {roll.modifier !== 0 && (
              <div className="dice-roller__die" data-kind="modifier">
                <dt>Mod</dt>
                <dd>{signed(roll.modifier)}</dd>
              </div>
            )}
          </dl>
        </div>
      )}
    </section>
  );
}
