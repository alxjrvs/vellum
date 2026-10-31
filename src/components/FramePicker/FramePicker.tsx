import type { CSSProperties } from 'react';
import { useFrame } from '../../frames/useFrame';
import type { ThemeConfig } from '../../themes/types';
import './FramePicker.css';

const SWATCHES = ['nameplate', 'signal', 'hit', 'stress', 'armor', 'fear'] as const;

function trackSummary(frame: ThemeConfig): string {
  const displays = new Set(Object.values(frame.tracks));
  if (displays.size === 1) return displays.has('bar') ? 'All bars' : 'All chits';
  return 'Bars and chits';
}

/**
 * Pick the frame the HUD wears. The choice is saved in this browser; an OBS
 * source can also pin one with `?frame=<id>` in its URL.
 */
export function FramePicker() {
  const { frame: active, frames, setFrame } = useFrame();
  if (frames.length < 2) return null;
  return (
    <section className="frame-picker" aria-label="Frame">
      <h2 className="frame-picker__heading">Frame</h2>
      <div className="frame-picker__options" role="radiogroup" aria-label="Choose a frame">
        {frames.map((frame) => (
          <button
            key={frame.id}
            type="button"
            role="radio"
            aria-checked={frame.id === active.id}
            className="frame-picker__option"
            onClick={() => setFrame(frame.id)}
          >
            <span className="frame-picker__swatches" aria-hidden="true">
              {SWATCHES.map((name) => (
                <span
                  key={name}
                  className="frame-picker__swatch"
                  style={{ '--swatch': frame.colors[name] } as CSSProperties}
                />
              ))}
            </span>
            <span className="frame-picker__name">{frame.label}</span>
            <span className="frame-picker__meta">
              {frame.origin === 'official' ? 'Official' : 'Community'} · {trackSummary(frame)}
            </span>
          </button>
        ))}
      </div>
    </section>
  );
}
