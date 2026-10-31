import type { CSSProperties } from 'react';
import type { TrackDisplay } from '../../themes/types';
import './StatTrack.css';

export interface StatTrackThresholds {
  major?: number;
  severe?: number;
}

/**
 * What each position on the track means — drives its `data-state` and aria
 * wording. How it is drawn is the separate, per-frame `display` choice.
 */
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
  /** Drawn as one continuous bar or as separate chits; the frame decides. */
  display?: TrackDisplay;
  interaction?: StatTrackInteraction;
  /** CSS color reference (e.g. `var(--color-stress)`) used to fill this track. */
  tone?: string;
  thresholds?: StatTrackThresholds;
  /** `level` interaction: set the track to `value` (fills positions 1…value). */
  onSetValue?: (value: number) => void;
  /** `toggle` interaction: which positions are currently marked. */
  markedSlots?: readonly number[];
  /** `toggle` interaction: flip position `index`. */
  onToggleSlot?: (index: number) => void;
}

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
  const { label, tone, shape = 'pip', display = 'chits', interaction = 'level' } = props;
  const style = tone ? ({ '--track-fill': tone } as CSSProperties) : undefined;
  return (
    <section
      className="stat-track"
      aria-label={label}
      data-shape={shape}
      data-display={display}
      data-interaction={interaction}
      style={style}
    >
      <span className="stat-track__name">{label}</span>
      <span className="stat-track__count">
        {props.currentValue}
        <span className="stat-track__total">/{props.trackLength}</span>
      </span>
      <TrackRow {...props} shape={shape} interaction={interaction} />
    </section>
  );
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
          />
        );
      })}
    </div>
  );
}
