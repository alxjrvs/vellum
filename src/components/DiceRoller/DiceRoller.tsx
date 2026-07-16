import './DiceRoller.css';
import { useState } from 'react';
import { rollDuality, type DualityAdvantage, type DualityRoll } from '../../dice';

const ADVANTAGE_MODES: readonly { id: DualityAdvantage; label: string }[] = [
  { id: 'none', label: 'None' },
  { id: 'advantage', label: 'Adv' },
  { id: 'disadvantage', label: 'Disadv' },
];

const OUTCOME_LABEL: Record<DualityRoll['outcome'], string> = {
  hope: 'With Hope',
  fear: 'With Fear',
  'critical hope': 'Critical!',
};

function signed(n: number): string {
  return n >= 0 ? `+${n}` : `${n}`;
}

interface LoggedRoll extends DualityRoll {
  readonly id: number;
}

export function DiceRoller() {
  const [modifier, setModifier] = useState(0);
  const [advantage, setAdvantage] = useState<DualityAdvantage>('none');
  const [history, setHistory] = useState<readonly LoggedRoll[]>([]);
  const [nextId, setNextId] = useState(1);

  const roll = () => {
    const result = rollDuality({ modifier, advantage });
    setHistory((prev) => [{ ...result, id: nextId }, ...prev]);
    setNextId((id) => id + 1);
  };

  const latest = history[0];

  return (
    <section className="dice-roller" aria-label="Duality dice roller">
      <div className="dice-roller__log" aria-label="Roll history" aria-live="polite">
        {history.length === 0 ? (
          <p className="dice-roller__empty">No rolls yet</p>
        ) : (
          <ol className="dice-roller__log-list">
            {history.map((entry) => (
              <li
                key={entry.id}
                className="dice-roller__log-row"
                data-outcome={entry.outcome}
                data-latest={entry === latest}
              >
                <span className="dice-roller__log-total">{entry.total}</span>
                <span className="dice-roller__log-outcome">{OUTCOME_LABEL[entry.outcome]}</span>
                <span className="dice-roller__log-dice">
                  <span data-kind="hope">{entry.hope}</span>
                  <span className="dice-roller__log-sep">/</span>
                  <span data-kind="fear">{entry.fear}</span>
                  {entry.advantageValue !== undefined && (
                    <span data-kind="advantage">{signed(entry.advantageValue)}</span>
                  )}
                  {entry.modifier !== 0 && (
                    <span data-kind="modifier">{signed(entry.modifier)}</span>
                  )}
                </span>
              </li>
            ))}
          </ol>
        )}
      </div>

      <div className="dice-roller__dock">
        <div className="dice-roller__dock-row">
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

        <div className="dice-roller__dock-row">
          <button type="button" className="dice-roller__roll" onClick={roll}>
            Roll
          </button>

          <button
            type="button"
            className="dice-roller__clear"
            onClick={() => setHistory([])}
            disabled={history.length === 0}
            aria-label="Clear roll history"
          >
            Clear
          </button>
        </div>
      </div>
    </section>
  );
}
