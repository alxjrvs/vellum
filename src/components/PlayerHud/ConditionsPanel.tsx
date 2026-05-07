import { useState } from 'react';
import './ConditionsPanel.css';
import { useCharacter } from '../../character/useCharacter';
import { useSystem } from '../../systems/useSystem';

export function ConditionsPanel() {
  const { character, dispatch } = useCharacter();
  const system = useSystem();
  const [open, setOpen] = useState(false);
  if (!character) return null;
  return (
    <section className="conditions-panel" aria-label="Conditions panel">
      <button
        type="button"
        className="conditions-panel__toggle"
        aria-expanded={open}
        aria-controls="conditions-panel-list"
        onClick={() => setOpen((value) => !value)}
      >
        Conditions
      </button>
      {open && (
        <ul
          id="conditions-panel-list"
          className="conditions-panel__list"
          role="list"
          aria-label="Conditions"
        >
          {system.coreConditions.map(({ id, label }) => {
            const active = character.conditions.core[id];
            return (
              <li key={`core-${id}`} className="conditions-panel__item">
                <button
                  type="button"
                  className="conditions-panel__badge"
                  data-kind="core"
                  data-condition={id}
                  data-state={active ? 'active' : 'inactive'}
                  aria-pressed={active}
                  aria-label={`${label} ${active ? 'active' : 'inactive'}`}
                  onClick={() => dispatch({ type: 'CONDITION_TOGGLE', condition: id })}
                >
                  {label}
                </button>
              </li>
            );
          })}
          {character.featureConditions.map((name) => {
            const active = character.conditions.feature[name] ?? false;
            return (
              <li key={`feature-${name}`} className="conditions-panel__item">
                <button
                  type="button"
                  className="conditions-panel__badge"
                  data-kind="feature"
                  data-state={active ? 'active' : 'inactive'}
                  aria-pressed={active}
                  aria-label={`${name} ${active ? 'active' : 'inactive'}`}
                  onClick={() => dispatch({ type: 'FEATURE_CONDITION_TOGGLE', name })}
                >
                  {name}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
