import type { FrameKind, ThemeConfig } from './types';

/** The HUD widgets a frame can place. The ticker and Setup button stay put. */
export const HUD_WIDGETS = ['vitals', 'status', 'dice', 'name'] as const;
export type HudWidget = (typeof HUD_WIDGETS)[number];

export const HUD_WIDGET_LABELS: Record<HudWidget, string> = {
  vitals: 'Stats',
  status: 'Conditions',
  dice: 'Dice',
  name: 'Nameplate',
};

/** The widgets each kind of frame shows. A GM frame's stats are the Fear pool. */
export const FRAME_WIDGETS: Record<FrameKind, readonly HudWidget[]> = {
  player: HUD_WIDGETS,
  gm: ['vitals', 'dice'],
};

/** A widget's name in the frame editor, for a frame of this kind. */
export function widgetLabels(kind: FrameKind): Record<HudWidget, string> {
  return kind === 'gm' ? { ...HUD_WIDGET_LABELS, vitals: 'Fear' } : HUD_WIDGET_LABELS;
}

/** The stage every frame is laid out on, in CSS px. */
export const STAGE_WIDTH = 1920;
export const STAGE_HEIGHT = 1080;

/**
 * Named spots on the 1920x1080 stage, from before frames could place widgets
 * freely. Frames that name a slot still load. Top-center belongs to the
 * ticker and bottom-right to the Setup button.
 */
export const HUD_SLOTS = [
  'top-left',
  'top-right',
  'middle-left',
  'middle-right',
  'bottom-left',
  'bottom-center',
] as const;
export type HudSlot = (typeof HUD_SLOTS)[number];

/**
 * A widget placed by hand in the frame editor: `x` is the horizontal center
 * of the widget and `y` its top edge, in stage px. A widget whose center is
 * right of the stage's middle mirrors so its labels read outside-in.
 */
export interface HudPoint {
  readonly x: number;
  readonly y: number;
}

export type HudPlacement = HudSlot | HudPoint;

export type HudRegions = Readonly<Record<HudWidget, HudPlacement>>;

/** The classic layout, used for any widget a frame doesn't place. */
export const DEFAULT_REGIONS: HudRegions = {
  vitals: 'top-left',
  status: 'top-right',
  dice: 'bottom-left',
  name: 'bottom-center',
};

export function regionsFor(theme: Pick<ThemeConfig, 'regions'> | null | undefined): HudRegions {
  return { ...DEFAULT_REGIONS, ...theme?.regions };
}

export function isPoint(placement: HudPlacement): placement is HudPoint {
  return typeof placement === 'object';
}

export function isRightPlacement(placement: HudPlacement): boolean {
  return isPoint(placement) ? placement.x > STAGE_WIDTH / 2 : placement.endsWith('right');
}

/** A box on the stage, in stage px. */
export interface StageRect {
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly height: number;
}

/**
 * Stage areas no frame may cover: the ticker band across the top center and
 * the Setup button in the bottom-right corner.
 */
export const RESERVED_AREAS: readonly (StageRect & { readonly label: string })[] = [
  { label: 'Ticker', x: 680, y: 0, width: 560, height: 150 },
  { label: 'Setup button', x: 1560, y: 960, width: 360, height: 120 },
];

export function rectsOverlap(a: StageRect, b: StageRect): boolean {
  return a.x < b.x + b.width && b.x < a.x + a.width && a.y < b.y + b.height && b.y < a.y + a.height;
}
