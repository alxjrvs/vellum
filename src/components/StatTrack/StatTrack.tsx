import type { CSSProperties } from 'react';
import './StatTrack.css';

export interface StatTrackThresholds {
  major?: number;
  severe?: number;
}

/** Visual glyph for each position on the track. */
export type StatTrackShape = 'pip' | 'box' | 'heart';

/**
 * How the track responds to a click:
 * - `level` — cumulative dial: clicking position i sets the value to i, filling
 *   every position behind it (click the topmost filled position to step down).
 * - `toggle` — each position flips independently (e.g. Armor, spent slot by slot).
 */
export type StatTrackInteraction = 'level' | 'toggle';

export interface StatTrackProps {
  trackLength: number;
  currentValue: number;
  label: string;
  shape?: StatTrackShape;
  interaction?: StatTrackInteraction;
  /** CSS color reference (e.g. `var(--color-accent)`) used to fill this track. */
  tone?: string;
  thresholds?: StatTrackThresholds;
  /** `level` interaction: set the track to `value` (fills positions 1…value). */
  onSetValue?: (value: number) => void;
  /** `toggle` interaction: which positions are currently marked. */
  markedSlots?: readonly number[];
  /** `toggle` interaction: flip position `index`. */
  onToggleSlot?: (index: number) => void;
}

const HEART_PATH =
  'M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z';

const SHAPE_CLASS: Record<StatTrackShape, string> = {
  pip: 'stat-track__pip',
  box: 'stat-track__slot',
  heart: 'stat-track__heart',
};

const SHAPE_NOUN: Record<StatTrackShape, string> = {
  pip: 'pip',
  box: 'slot',
  heart: 'heart',
};

export function StatTrack(props: StatTrackProps) {
  const { label, tone, shape = 'pip', interaction = 'level' } = props;
  const style = tone ? ({ '--track-fill': tone } as CSSProperties) : undefined;
  return (
    <section
      className="stat-track"
      aria-label={label}
      data-shape={shape}
      data-interaction={interaction}
      style={style}
    >
      <header className="stat-track__label">
        <span className="stat-track__name">{label}</span>
        <span className="stat-track__count">{trackReadout(props)}</span>
      </header>
      <TrackRow {...props} shape={shape} interaction={interaction} />
    </section>
  );
}

function trackReadout(props: StatTrackProps): string {
  // Every track's currentValue is what's filled — HP hearts pass remaining health.
  return `${props.currentValue}/${props.trackLength}`;
}

function thresholdTier(index: number, thresholds: StatTrackThresholds | undefined) {
  if (!thresholds) return undefined;
  const position = index + 1;
  const isMajor = thresholds.major === position;
  const isSevere = thresholds.severe === position;
  if (isMajor && isSevere) return 'major-severe';
  if (isMajor) return 'major';
  if (isSevere) return 'severe';
  return undefined;
}

/** Per-shape `data-state` / aria wording for a filled vs. empty position. */
function positionState(shape: StatTrackShape, filled: boolean): string {
  if (shape === 'heart') return filled ? 'full' : 'empty'; // filled = remaining health
  if (shape === 'box') return filled ? 'marked' : 'unmarked';
  return filled ? 'filled' : 'empty';
}

function TrackRow(props: StatTrackProps) {
  const {
    trackLength,
    currentValue,
    label,
    shape = 'pip',
    interaction = 'level',
    markedSlots,
    onToggleSlot,
    onSetValue,
    thresholds,
  } = props;
  const marked = new Set(markedSlots ?? []);
  return (
    <div className="stat-track__row" role="group" aria-label={`${label} ${SHAPE_NOUN[shape]}s`}>
      {Array.from({ length: trackLength }, (_, i) => {
        const filled = interaction === 'toggle' ? marked.has(i) : i < currentValue;
        const state = positionState(shape, filled);
        const tier = thresholdTier(i, thresholds);
        // level: click position i sets the dial to i (fills behind it); clicking
        // the current top position steps it back down by one.
        const handleClick =
          interaction === 'toggle'
            ? () => onToggleSlot?.(i)
            : () => onSetValue?.(i + 1 === currentValue ? i : i + 1);
        return (
          <button
            key={i}
            type="button"
            className={SHAPE_CLASS[shape]}
            data-state={state}
            data-threshold={tier}
            aria-label={`${label} ${SHAPE_NOUN[shape]} ${i + 1} ${state}${
              tier ? ` (${tier} threshold)` : ''
            }`}
            onClick={handleClick}
          >
            {shape === 'heart' && (
              <svg className="stat-track__heart-glyph" viewBox="0 0 24 24" aria-hidden="true">
                <path d={HEART_PATH} />
              </svg>
            )}
          </button>
        );
      })}
    </div>
  );
}
