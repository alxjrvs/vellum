import './StatTrack.css';

export interface StatTrackProps {
  trackLength: number;
  currentValue: number;
  label: string;
  onIncrement: () => void;
  onDecrement?: () => void;
  markedSlots?: readonly number[];
  onToggleSlot?: (index: number) => void;
}

export function StatTrack(props: StatTrackProps) {
  const isSlotMode = props.markedSlots !== undefined;
  return (
    <section
      className="stat-track"
      aria-label={props.label}
      data-mode={isSlotMode ? 'slot' : 'pip'}
    >
      <header className="stat-track__label">{props.label}</header>
      {isSlotMode ? <SlotRow {...props} /> : <PipRow {...props} />}
    </section>
  );
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

function SlotRow({ trackLength, label, markedSlots, onToggleSlot }: StatTrackProps) {
  const marked = new Set(markedSlots ?? []);
  const handleToggle = onToggleSlot ?? (() => {});
  return (
    <div className="stat-track__row" role="group" aria-label={`${label} slots`}>
      {Array.from({ length: trackLength }, (_, i) => {
        const isMarked = marked.has(i);
        return (
          <button
            key={i}
            type="button"
            className="stat-track__slot"
            data-state={isMarked ? 'marked' : 'unmarked'}
            aria-label={`${label} slot ${i + 1} ${isMarked ? 'marked' : 'unmarked'}`}
            onClick={() => handleToggle(i)}
          />
        );
      })}
    </div>
  );
}
