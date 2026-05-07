import './CoreConditions.css';
import { useCharacter } from '../../character/useCharacter';
import { useSystem } from '../../systems/useSystem';

export function CoreConditions() {
  const { character, dispatch } = useCharacter();
  const system = useSystem();
  if (!character) return null;
  return (
    <section className="core-conditions" aria-label="Core conditions">
      <ul className="core-conditions__list" role="list">
        {system.coreConditions.map(({ id, label }) => {
          const active = character.conditions.core[id];
          return (
            <li key={id} className="core-conditions__item">
              <button
                type="button"
                className="core-conditions__badge"
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
      </ul>
    </section>
  );
}
