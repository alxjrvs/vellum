import { useState, type CSSProperties } from 'react';
import { parseFrame } from '../../frames/customFrames';
import { useFrame } from '../../frames/useFrame';
import type { ThemeConfig } from '../../themes/types';
import { FrameCreator } from '../FrameCreator';
import './FramePicker.css';

const SWATCHES = ['nameplate', 'signal', 'hit', 'stress', 'armor', 'fear'] as const;

const SHELVES: { origin: ThemeConfig['origin']; title: string }[] = [
  { origin: 'official', title: 'Official' },
  { origin: 'community', title: 'Community (unofficial)' },
  { origin: 'custom', title: 'My frames' },
];

function trackSummary(frame: ThemeConfig): string {
  const displays = new Set(Object.values(frame.tracks));
  if (displays.size === 1) return displays.has('bar') ? 'All bars' : 'All chits';
  return 'Bars and chits';
}

function readText(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error);
    reader.readAsText(file);
  });
}

function exportFrame(frame: ThemeConfig) {
  const blob = new Blob([JSON.stringify(frame, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${frame.id}.vellum-frame.json`;
  a.click();
  URL.revokeObjectURL(url);
}

/**
 * Pick the frame the HUD wears, on three shelves: official, community, and
 * My frames (made here or imported, kept only in this browser). The choice is
 * saved here, and copied OBS links carry it.
 */
export function FramePicker() {
  const { frame: active, frames, setFrame, saveFrame, deleteFrame } = useFrame();
  const [creating, setCreating] = useState<ThemeConfig | null>(null);
  const [importError, setImportError] = useState<string | null>(null);

  const importFile = async (file: File | undefined) => {
    if (!file) return;
    let frame: ThemeConfig | null = null;
    try {
      frame = parseFrame(JSON.parse(await readText(file)));
    } catch {
      frame = null;
    }
    if (frame) {
      setImportError(null);
      saveFrame(frame);
    } else {
      setImportError("That file isn't a Vellum frame.");
    }
  };

  return (
    <section className="frame-picker" aria-label="Frame">
      <h2 className="frame-picker__heading">Frame</h2>
      {SHELVES.map(({ origin, title }) => {
        const shelf = frames.filter((f) => f.origin === origin);
        if (shelf.length === 0) return null;
        return (
          <div key={origin} className="frame-picker__shelf">
            <h3 className="frame-picker__shelf-title">{title}</h3>
            <div className="frame-picker__options" role="radiogroup" aria-label={title}>
              {shelf.map((frame) => (
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
                  <span className="frame-picker__meta">{trackSummary(frame)}</span>
                </button>
              ))}
            </div>
          </div>
        );
      })}

      <div className="frame-picker__actions">
        <button type="button" onClick={() => setCreating(active)}>
          {active.origin === 'custom' ? 'Edit this frame' : 'Make a frame from this one'}
        </button>
        {active.origin === 'custom' && (
          <>
            <button type="button" onClick={() => exportFrame(active)}>
              Export file
            </button>
            <button type="button" onClick={() => deleteFrame(active.id)}>
              Delete
            </button>
          </>
        )}
        <label className="frame-picker__import">
          Import a frame file
          <input
            type="file"
            accept=".json,application/json"
            onChange={(e) => {
              void importFile(e.target.files?.[0]);
              e.target.value = '';
            }}
          />
        </label>
      </div>
      {importError && (
        <p className="frame-picker__error" role="alert">
          {importError}
        </p>
      )}

      {creating && (
        <FrameCreator key={creating.id} base={creating} onDone={() => setCreating(null)} />
      )}
    </section>
  );
}
