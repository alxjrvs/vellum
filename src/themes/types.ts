import type { SystemId } from '../systems/types';
import type { HudPlacement, HudWidget } from './regions';

/**
 * Color tokens a frame supplies. Names match the chassis tokens in
 * vellum.tokens.css one-to-one; ThemeProvider writes them over the chassis
 * defaults as `--color-<kebab-name>`.
 */
export interface ThemeColors {
  /** Page / setup ground. */
  readonly night: string;
  /** Solid backing for every HUD plate and setup card. */
  readonly plate: string;
  /** Inputs, chips, hover states. */
  readonly plateRaised: string;
  /** Hairlines and empty track segments. */
  readonly rule: string;
  /** Values and primary text on a plate. */
  readonly text: string;
  /** Labels on a plate. Must hold 7:1 against `plate` (see frameRules). */
  readonly label: string;
  /** Tertiary text only — never a label. */
  readonly muted: string;
  /** "Yours" / active / primary action. */
  readonly signal: string;
  /** Text on a Signal fill. */
  readonly signalInk: string;
  /** Damage. */
  readonly hit: string;
  readonly stress: string;
  readonly armor: string;
  /** The GM's Fear color. */
  readonly fear: string;
  /** Nameplate fill (the white plate). */
  readonly nameplate: string;
  readonly nameplateInk: string;
  /** The player's own edge color. */
  readonly player: string;
}

export interface ThemeTypography {
  readonly fontFamilyDisplay: string;
  readonly fontFamilyBody: string;
  readonly fontSizeBase: string;
  readonly fontSizeHeading: string;
  /** HUD label size. Must be ≥ 2.1% of the 1920 canvas (see frameRules). */
  readonly fontSizeLabel: string;
  /** Big tabular stat values. */
  readonly fontSizeValue: string;
  /** Oversized nameplate / title lettering. */
  readonly fontSizeTitle: string;
}

export interface ThemeLayout {
  readonly spacingXs: string;
  readonly spacingSm: string;
  readonly spacingMd: string;
  readonly spacingLg: string;
  readonly spacingXl: string;
  readonly radiusSm: string;
  readonly radiusMd: string;
  readonly borderWidth: string;
  /** Thickness of a bar, and the height of a chit. */
  readonly trackHeight: string;
  /** Width of one chit. */
  readonly chitWidth: string;
  /** Width of a bar track (segments share it). */
  readonly barWidth: string;
  /** Width of the colored edge on plates and the nameplate. */
  readonly edgeWidth: string;
}

/** How a stat track draws: one continuous bar, or separate chits. */
export type TrackDisplay = 'bar' | 'chits';

/** Per-frame choice of bar vs chits for every tracked stat. */
export interface ThemeTracks {
  readonly hp: TrackDisplay;
  readonly stress: TrackDisplay;
  readonly hope: TrackDisplay;
  readonly armor: TrackDisplay;
  readonly fear: TrackDisplay;
}

/**
 * A frame: everything about how the HUD looks, as data. The system says what
 * is tracked; the frame says how it is drawn.
 */
export interface ThemeConfig {
  /** Stable id, used in `?frame=` URLs and stored preferences. */
  readonly id: string;
  readonly label: string;
  /** The game system this frame is drawn for. */
  readonly system: SystemId;
  /** Where it comes from: bundled official, bundled community, or the user's own. */
  readonly origin: 'official' | 'community' | 'custom';
  readonly colors: ThemeColors;
  readonly typography: ThemeTypography;
  readonly layout: ThemeLayout;
  readonly tracks: ThemeTracks;
  /** Where each widget sits. Widgets left out keep the classic layout. */
  readonly regions?: Partial<Record<HudWidget, HudPlacement>>;
}
