import { useCallback, useId, useState } from 'react';
import { CUSTOM_ID_PREFIX } from '../../frames/customFrames';
import { useFrame } from '../../frames/useFrame';
import { useSystem } from '../../systems/useSystem';
import { validateFrame } from '../../themes/frameRules';
import { regionsFor, type HudPoint, type HudWidget } from '../../themes/regions';
import type { ThemeColors, ThemeConfig, ThemeTracks, TrackDisplay } from '../../themes/types';
import { FramePreview } from './FramePreview';
import { findOverlaps, type WidgetRects } from './layout';
import './FrameCreator.css';

const COLOR_LABELS: Record<keyof ThemeColors, string> = {
  night: 'Background',
  plate: 'Plate',
  plateRaised: 'Raised plate',
  rule: 'Lines and empty slots',
  text: 'Values',
  label: 'Labels',
  muted: 'Quiet text',
  signal: 'Accent',
  signalInk: 'Text on accent',
  hit: 'HP',
  stress: 'Stress',
  armor: 'Armor',
  fear: 'Fear',
  nameplate: 'Nameplate',
  nameplateInk: 'Nameplate text',
  player: 'Player edge',
};

function newId(label: string): string {
  const slug = label
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 32);
  return `${CUSTOM_ID_PREFIX}${slug || 'frame'}-${Math.random().toString(36).slice(2, 7)}`;
}

interface FrameCreatorProps {
  /** The frame to start from. A custom frame is edited in place; any other is copied. */
  readonly base: ThemeConfig;
  readonly onDone: () => void;
}

/**
 * Make or edit one of My frames, full screen: drag the widgets around a live
 * preview of the stage, pick bars or chits per stat, and set the colors. The
 * frame rules are checked as you go (readable labels, no overlapping
 * widgets), and a frame that breaks one can't be saved.
 */
export function FrameCreator({ base, onDone }: FrameCreatorProps) {
  const { saveFrame } = useFrame();
  const system = useSystem();
  const id = useId();
  const [draft, setDraft] = useState<ThemeConfig>(() =>
    base.origin === 'custom'
      ? base
      : {
          ...base,
          id: newId(`${base.label} copy`),
          label: `${base.label} copy`,
          origin: 'custom',
        }
  );
  const [rects, setRects] = useState<WidgetRects>({});
  const problems = [
    ...(draft.label.trim() ? [] : ['Give your frame a name']),
    ...validateFrame(draft),
    ...findOverlaps(rects),
  ];
  const trackLabel = (track: keyof ThemeTracks) =>
    system.resources.find((r) => r.id === track)?.label ?? track;

  const setColor = (key: keyof ThemeColors, value: string) =>
    setDraft((d) => ({ ...d, colors: { ...d.colors, [key]: value } }));
  const setTrack = (key: keyof ThemeTracks, value: TrackDisplay) =>
    setDraft((d) => ({ ...d, tracks: { ...d.tracks, [key]: value } }));
  const place = useCallback(
    (widget: HudWidget, point: HudPoint) =>
      setDraft((d) => ({ ...d, regions: { ...regionsFor(d), [widget]: point } })),
    []
  );
  const resetLayout = () => setDraft((d) => ({ ...d, regions: base.regions }));

  return (
    <section
      className="frame-creator"
      aria-label="Frame creator"
      role="dialog"
      aria-modal="true"
      onKeyDown={(e) => {
        if (e.key === 'Escape') onDone();
      }}
    >
      <h2 className="frame-creator__heading">
        {base.origin === 'custom' ? `Edit ${base.label}` : `New frame from ${base.label}`}
      </h2>

      <div className="frame-creator__body">
        <div className="frame-creator__controls">
          <label className="frame-creator__field">
            <span>Name</span>
            <input
              type="text"
              value={draft.label}
              maxLength={40}
              onChange={(e) => setDraft((d) => ({ ...d, label: e.target.value }))}
            />
          </label>

          <fieldset className="frame-creator__group">
            <legend>Bars or chits</legend>
            {(Object.keys(draft.tracks) as (keyof ThemeTracks)[]).map((track) => (
              <div
                key={track}
                className="frame-creator__row"
                role="radiogroup"
                aria-label={trackLabel(track)}
              >
                <span>{trackLabel(track)}</span>
                {(['bar', 'chits'] as const).map((display) => (
                  <label key={display} className="frame-creator__choice">
                    <input
                      type="radio"
                      name={`${id}-${track}`}
                      checked={draft.tracks[track] === display}
                      onChange={() => setTrack(track, display)}
                    />
                    {display === 'bar' ? 'Bar' : 'Chits'}
                  </label>
                ))}
              </div>
            ))}
          </fieldset>

          <fieldset className="frame-creator__group frame-creator__colors">
            <legend>Colors</legend>
            {(Object.keys(COLOR_LABELS) as (keyof ThemeColors)[]).map((key) => (
              <label key={key} className="frame-creator__color">
                <input
                  type="color"
                  value={draft.colors[key]}
                  onChange={(e) => setColor(key, e.target.value)}
                />
                {COLOR_LABELS[key]}
              </label>
            ))}
          </fieldset>
        </div>

        <div className="frame-creator__canvas">
          <FramePreview frame={draft} rects={rects} onMeasure={setRects} onPlace={place} />
          <button type="button" className="frame-creator__reset" onClick={resetLayout}>
            Reset layout
          </button>
          {problems.length > 0 && (
            <div className="frame-creator__problems" role="alert">
              <p>Fix these before saving:</p>
              <ul>
                {problems.map((p) => (
                  <li key={p}>{p}</li>
                ))}
              </ul>
            </div>
          )}

          <div className="frame-creator__actions">
            <button
              type="button"
              className="frame-creator__save"
              disabled={problems.length > 0}
              onClick={() => {
                saveFrame({ ...draft, label: draft.label.trim() });
                onDone();
              }}
            >
              Save frame
            </button>
            <button type="button" className="frame-creator__cancel" onClick={onDone}>
              Cancel
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
