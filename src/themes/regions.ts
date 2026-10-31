import type { ThemeConfig } from './types';

/** The HUD widgets a frame can place. The ticker and Setup button stay put. */
export const HUD_WIDGETS = ['vitals', 'status', 'dice', 'name'] as const;
export type HudWidget = (typeof HUD_WIDGETS)[number];

export const HUD_WIDGET_LABELS: Record<HudWidget, string> = {
  vitals: 'Stats',
  status: 'Conditions',
  dice: 'Dice',
  name: 'Nameplate',
};

/**
 * Where a widget can sit on the 1920x1080 stage. Slots on the right mirror
 * their widget so labels read outside-in. Top-center belongs to the ticker
 * and bottom-right to the Setup button.
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

export const HUD_SLOT_LABELS: Record<HudSlot, string> = {
  'top-left': 'Top left',
  'top-right': 'Top right',
  'middle-left': 'Middle left',
  'middle-right': 'Middle right',
  'bottom-left': 'Bottom left',
  'bottom-center': 'Bottom center',
};

export type HudRegions = Readonly<Record<HudWidget, HudSlot>>;

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

export function isRightSlot(slot: HudSlot): boolean {
  return slot.endsWith('right');
}
