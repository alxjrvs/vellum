/**
 * The Frame Library as the site shows it. Entries point at the app's real
 * frame definitions, so a card here is drawn from the same values the HUD
 * uses. When frames move to the library folders (official/, community/),
 * this list reads from there instead.
 */
import { daggerheartTheme } from '../../../../src/themes/daggerheart.theme';
import type { TrackStyle } from '../components/HudTile.astro';

export type Tier = 'official' | 'community';

export interface LibraryFrame {
  id: string;
  name: string;
  game: string;
  tier: Tier;
  author: string;
  description: string;
  /** Chassis color overrides, keyed by token name without the --color- prefix. */
  colors: Record<string, string>;
  tracks: Record<string, TrackStyle>;
}

/** camelCase ThemeConfig keys to the kebab-case token names the CSS uses. */
function toTokenNames(colors: Record<string, string>): Record<string, string> {
  return Object.fromEntries(
    Object.entries(colors).map(([k, v]) => [k.replace(/[A-Z]/g, (c) => `-${c.toLowerCase()}`), v])
  );
}

export const libraryFrames: LibraryFrame[] = [
  {
    id: 'broadcast',
    name: 'Broadcast',
    game: 'Any game',
    tier: 'official',
    author: 'Vellum',
    description:
      'The Vellum chassis as-is: cool plates, a white nameplate, a green player edge. The starting point for every other frame.',
    colors: {},
    tracks: { hp: 'chits', stress: 'bar', hope: 'chits' },
  },
  {
    id: daggerheartTheme.id,
    name: daggerheartTheme.label,
    game: 'Daggerheart',
    tier: 'official',
    author: 'Vellum',
    description:
      'Warm plates, a parchment nameplate and a gilt player edge. HP, Hope and Armor as chits, Stress as a bar.',
    colors: toTokenNames(daggerheartTheme.colors),
    tracks: daggerheartTheme.tracks,
  },
];
