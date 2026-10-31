import type { ThemeConfig } from './types';
import { regionsFor, type HudWidget } from './regions';

/**
 * The two rules every frame keeps (docs/branding/BRANDING.md §6). A frame may
 * re-skin colors and faces freely, but these are checked, not trusted:
 *
 * 1. Labels are always readable — at least 2.1% of the 1920 canvas (≈13px on a
 *    640×360 Discord tile) and at least 7:1 against the plate they sit on.
 * 2. Everything reads outside-in — enforced structurally by the HUD layout
 *    (right-side regions mirror), so it needs no per-frame check here.
 */
export const CANVAS_WIDTH = 1920;
export const MIN_LABEL_RATIO = 0.021;
export const MIN_LABEL_PX = Math.round(CANVAS_WIDTH * MIN_LABEL_RATIO); // 40
export const MIN_LABEL_CONTRAST = 7;

function channel(value: number): number {
  const c = value / 255;
  return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
}

function luminance(hex: string): number {
  const match = /^#([0-9a-f]{6})$/i.exec(hex);
  if (!match) throw new Error(`frameRules: expected a #rrggbb color, got "${hex}"`);
  const n = parseInt(match[1], 16);
  return (
    0.2126 * channel((n >> 16) & 255) + 0.7152 * channel((n >> 8) & 255) + 0.0722 * channel(n & 255)
  );
}

/** WCAG 2.1 contrast ratio between two #rrggbb colors. */
export function contrastRatio(a: string, b: string): number {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

function px(value: string): number {
  const match = /^(\d+(?:\.\d+)?)px$/.exec(value);
  if (!match) throw new Error(`frameRules: expected a px size, got "${value}"`);
  return Number(match[1]);
}

/** Returns every rule a frame breaks; an empty list means the frame passes. */
export function validateFrame(theme: ThemeConfig): string[] {
  const problems: string[] = [];
  const { colors, typography } = theme;

  if (px(typography.fontSizeLabel) < MIN_LABEL_PX) {
    problems.push(
      `fontSizeLabel ${typography.fontSizeLabel} is below the ${MIN_LABEL_PX}px minimum`
    );
  }

  const pairs: [string, string, string][] = [
    ['label', colors.label, colors.plate],
    ['text', colors.text, colors.plate],
    ['label on raised plate', colors.label, colors.plateRaised],
    ['signal ink', colors.signalInk, colors.signal],
    ['nameplate ink', colors.nameplateInk, colors.nameplate],
  ];
  for (const [name, fg, bg] of pairs) {
    const ratio = contrastRatio(fg, bg);
    if (ratio < MIN_LABEL_CONTRAST) {
      problems.push(`${name} contrast ${ratio.toFixed(1)}:1 is below ${MIN_LABEL_CONTRAST}:1`);
    }
  }

  const bySlot = new Map<string, HudWidget[]>();
  for (const [widget, slot] of Object.entries(regionsFor(theme)) as [HudWidget, string][]) {
    bySlot.set(slot, [...(bySlot.get(slot) ?? []), widget]);
  }
  for (const [slot, widgets] of bySlot) {
    if (widgets.length > 1) problems.push(`${widgets.join(' and ')} both sit at ${slot}`);
  }
  return problems;
}
