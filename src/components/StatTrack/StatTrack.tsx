import type { CSSProperties } from 'react';
import './StatTrack.css';

export interface StatTrackThresholds {
  major?: number;
  severe?: number;
}

export interface StatTrackProps {
  trackLength: number;
  currentValue: number;
  label: string;
  onIncrement: () => void;
  onDecrement?: () => void;
  markedSlots?: readonly number[];
  onToggleSlot?: (index: number) => void;
  thresholds?: StatTrackThresholds;
  /** Rendered glyph for slot-mode tracks — plain boxes or HP hearts. */
  shape?: 'box' | 'heart';
  /** CSS color reference (e.g. `var(--color-accent)`) used to fill this track. */
  tone?: string;
}

const HEART_PATH =
  'M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z';

export function StatTrack(props: StatTrackProps) {
  const isSlotMode = props.markedSlots !== undefined;
  const style = props.tone ? ({ '--track-fill': props.tone } as CSSProperties) : undefined;
  return (
    <section
      className="stat-track"
      aria-label={props.label}
      data-mode={isSlotMode ? 'slot' : 'pip'}
      style={style}
    >
      <header className="stat-track__label">
        <span className="stat-track__name">{props.label}</span>
        <span className="stat-track__count">{trackReadout(props)}</span>
      </header>
      {isSlotMode ? <SlotRow {...props} /> : <PipRow {...props} />}
    </section>
  );
}

function trackReadout(props: StatTrackProps): string {
  if (props.markedSlots !== undefined) {
    // Marked slots are spent/damaged; show remaining out of the total.
    return `${props.trackLength - props.currentValue}/${props.trackLength}`;
  }
  return `${props.currentValue}/${props.trackLength}`;
}

function PipRow({ trackLength, currentValue, label, onIncrement, onDecrement }: StatTrackProps) {
  const pips = Array.from({ length: trackLength }, (_, i) => i < currentValue);
  return (
    <div className="stat-track__row" role="group" aria-label={`${label} pips`}>
      {pips.map((filled, i) => (
        <button
          key={i}
          type="button"
          className="stat-track__pip"
          data-state={filled ? 'filled' : 'empty'}
          aria-label={`${label} pip ${i + 1} ${filled ? 'filled' : 'empty'}`}
          onClick={filled && onDecrement ? onDecrement : onIncrement}
        />
      ))}
    </div>
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

function SlotRow({
  trackLength,
  label,
  markedSlots,
  onToggleSlot,
  thresholds,
  shape,
}: StatTrackProps) {
  const marked = new Set(markedSlots ?? []);
  const handleToggle = onToggleSlot ?? (() => {});
  const isHeart = shape === 'heart';
  return (
    <div
      className="stat-track__row"
      role="group"
      aria-label={`${label} ${isHeart ? 'hearts' : 'slots'}`}
    >
      {Array.from({ length: trackLength }, (_, i) => {
        // A marked slot is damaged; as a heart that reads as an emptied heart.
        const isMarked = marked.has(i);
        const tier = thresholdTier(i, thresholds);
        return (
          <button
            key={i}
            type="button"
            className={isHeart ? 'stat-track__heart' : 'stat-track__slot'}
            data-state={isHeart ? (isMarked ? 'empty' : 'full') : isMarked ? 'marked' : 'unmarked'}
            data-threshold={tier}
            aria-label={`${label} ${isHeart ? 'heart' : 'slot'} ${i + 1} ${
              isHeart ? (isMarked ? 'empty' : 'full') : isMarked ? 'marked' : 'unmarked'
            }${tier ? ` (${tier} threshold)` : ''}`}
            onClick={() => handleToggle(i)}
          >
            {isHeart && (
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
