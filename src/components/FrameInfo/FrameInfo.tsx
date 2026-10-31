import './FrameInfo.css';
import type { CSSProperties } from 'react';
import { useFrame } from '../../frames/useFrame';
import { useSystem } from '../../systems/useSystem';
import { FRAME_WIDGETS, widgetLabels } from '../../themes/regions';
import type { ThemeColors, ThemeConfig, ThemeTracks } from '../../themes/types';
import { FramePreview } from '../FrameCreator/FramePreview';

const ORIGIN_LABEL: Record<ThemeConfig['origin'], string> = {
  official: 'Official',
  community: 'Community',
  custom: 'My frame',
};

const KIND_LABEL: Record<ThemeConfig['kind'], string> = {
  player: 'Player HUD',
  gm: 'GM screen',
};

/** The tracks each kind of frame draws. */
const KIND_TRACKS: Record<ThemeConfig['kind'], readonly (keyof ThemeTracks)[]> = {
  player: ['hp', 'hope', 'stress', 'armor'],
  gm: ['fear'],
};

type Swatch = { readonly key: keyof ThemeColors; readonly label: string };

/** The colors each kind of frame puts on screen. */
const KIND_PALETTE: Record<ThemeConfig['kind'], readonly Swatch[]> = {
  player: [
    { key: 'signal', label: 'Accent' },
    { key: 'player', label: 'Edge' },
    { key: 'nameplate', label: 'Name' },
    { key: 'hit', label: 'HP' },
    { key: 'stress', label: 'Stress' },
    { key: 'armor', label: 'Armor' },
  ],
  gm: [
    { key: 'signal', label: 'Accent' },
    { key: 'fear', label: 'Fear' },
    { key: 'plate', label: 'Plate' },
  ],
};

/**
 * The frame you're wearing, in detail: a big preview, what kind of screen it
 * is, how each stat draws, which widgets it shows, and its colors.
 */
export function FrameInfo() {
  const { frame } = useFrame();
  const system = useSystem();
  const trackLabel = (track: keyof ThemeTracks) =>
    system.resources.find((r) => r.id === track)?.label ?? track;
  const labels = widgetLabels(frame.kind);

  return (
    <section className="frame-info" aria-label="This frame">
      <h2>This frame</h2>
      <FramePreview frame={frame} scale={0.17} />
      <p className="frame-info__name">{frame.label}</p>
      <p className="frame-info__chips">
        <span className="frame-info__chip">{KIND_LABEL[frame.kind]}</span>
        <span className="frame-info__chip">{ORIGIN_LABEL[frame.origin]}</span>
      </p>

      <dl className="frame-info__facts">
        {KIND_TRACKS[frame.kind].map((track) => (
          <div key={track} className="frame-info__fact">
            <dt>{trackLabel(track)}</dt>
            <dd>{frame.tracks[track] === 'bar' ? 'Bar' : 'Chits'}</dd>
          </div>
        ))}
        <div className="frame-info__fact">
          <dt>Shows</dt>
          <dd>{FRAME_WIDGETS[frame.kind].map((w) => labels[w]).join(', ')}</dd>
        </div>
      </dl>

      <ul className="frame-info__palette" aria-label="Colors">
        {KIND_PALETTE[frame.kind].map(({ key, label }) => (
          <li key={key} style={{ '--swatch': frame.colors[key] } as CSSProperties}>
            {label}
          </li>
        ))}
      </ul>
    </section>
  );
}
