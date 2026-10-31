import { useState } from 'react';
import { parseFrame } from '../../frames/customFrames';
import { useFrame } from '../../frames/useFrame';
import type { ThemeConfig } from '../../themes/types';
import { FrameCreator } from '../FrameCreator';
import { FramePreview } from '../FrameCreator/FramePreview';
import './FramePicker.css';

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
      {/* One strip of fixed-size cards, a shelf per origin. More frames scroll
          sideways rather than pushing the controls below them down. */}
      <div className="frame-picker__strip">
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
                    <span className="frame-picker__thumb">
                      <FramePreview frame={frame} />
                    </span>
                    <span className="frame-picker__plate">
                      <span className="frame-picker__name">{frame.label}</span>
                      <span className="frame-picker__meta">{trackSummary(frame)}</span>
                    </span>
                  </button>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Every action is always in the same place; ones that only apply to
          your own frames are disabled, not removed. */}
      <div className="frame-picker__actions">
        {/* Customizing an official or community frame starts a copy in My
            frames; customizing one of yours edits it. */}
        <button type="button" className="setup-button" onClick={() => setCreating(active)}>
          Customize
        </button>
        <button
          type="button"
          className="setup-button"
          disabled={active.origin !== 'custom'}
          onClick={() => exportFrame(active)}
        >
          Export
        </button>
        <button
          type="button"
          className="setup-button"
          disabled={active.origin !== 'custom'}
          onClick={() => deleteFrame(active.id)}
        >
          Delete
        </button>
        <label className="setup-button frame-picker__import">
          Import
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
