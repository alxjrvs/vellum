import { useContext } from 'react';
import { ThemeContext } from './ThemeContext';
import type { ThemeTracks, TrackDisplay } from './types';

/**
 * The active frame's bar-vs-chits choice for one stat. Falls back to chits
 * outside a ThemeProvider so a stat component never depends on a frame to
 * render.
 */
export function useTrackDisplay(stat: keyof ThemeTracks): TrackDisplay {
  return useContext(ThemeContext)?.tracks[stat] ?? 'chits';
}
