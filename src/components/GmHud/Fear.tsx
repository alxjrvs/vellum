import './Fear.css';
import { useCharacter } from '../../character/useCharacter';
import { useSystem } from '../../systems/useSystem';
import { StatTrack } from '../StatTrack';

export function Fear() {
  const { character, dispatch } = useCharacter();
  const system = useSystem();
  if (!character) return null;
  const max = system.fear.max;
  const value = character.stats.fear ?? 0;
  return (
    <section className="fear" aria-label="Fear pool">
      <StatTrack
        label="Fear"
        shape="pip"
        interaction="level"
        tone="var(--color-danger)"
        trackLength={max}
        currentValue={value}
        onSetValue={(next) => dispatch({ type: 'FEAR_SET', value: next, max })}
      />
      <div className="fear__stepper" role="group" aria-label="Adjust Fear">
        <button
          type="button"
          className="fear__step"
          aria-label="Decrease Fear"
          disabled={value === 0}
          onClick={() => dispatch({ type: 'FEAR_DECREMENT' })}
        >
          −
        </button>
        <output className="fear__value" aria-label="Current Fear">
          {value}
        </output>
        <button
          type="button"
          className="fear__step"
          aria-label="Increase Fear"
          disabled={value === max}
          onClick={() => dispatch({ type: 'FEAR_INCREMENT', max })}
        >
          +
        </button>
      </div>
    </section>
  );
}
