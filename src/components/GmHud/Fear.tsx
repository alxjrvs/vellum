import './Fear.css';
import { useSystem } from '../../systems/useSystem';
import { useFear } from '../../gm/useFear';
import { StatTrack } from '../StatTrack';

/**
 * The GM's Fear pool. Deliberately independent of the character record — a GM
 * never fills in a character sheet, so this must render on a cold start.
 */
export function Fear() {
  const system = useSystem();
  const max = system.fear.max;
  const { fear, setFear } = useFear(max);

  return (
    <section className="fear" aria-label="Fear pool">
      <StatTrack
        label="Fear"
        shape="pip"
        interaction="level"
        tone="var(--color-danger)"
        trackLength={max}
        currentValue={fear}
        onSetValue={setFear}
      />
      <div className="fear__stepper" role="group" aria-label="Adjust Fear">
        <button
          type="button"
          className="fear__step"
          aria-label="Decrease Fear"
          disabled={fear === 0}
          onClick={() => setFear(fear - 1)}
        >
          −
        </button>
        <output className="fear__value" aria-label="Current Fear">
          {fear}
        </output>
        <button
          type="button"
          className="fear__step"
          aria-label="Increase Fear"
          disabled={fear === max}
          onClick={() => setFear(fear + 1)}
        >
          +
        </button>
      </div>
    </section>
  );
}
