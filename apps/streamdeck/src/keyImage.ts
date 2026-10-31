import type { DeckTrack } from '@vellum/protocol';

/**
 * Key faces, drawn as 144×144 SVG. They follow the HUD's label rules: every
 * label sits on a solid light plate in heavy type (well past 7:1 contrast),
 * and the number underneath is the biggest thing on the key.
 */

const SIZE = 144;
const BG = '#121418';
const PLATE = '#f2efe6';
const INK = '#101114';
const VALUE = '#ffffff';
const MUTED = '#8a8f99';
const FONT = 'Arial, Helvetica, sans-serif';

/** Track colors, matching the default frame. */
export const TONES: Record<string, string> = {
  hope: '#e8b931',
  hp: '#e0473f',
  stress: '#9b7be0',
  armor: '#5fa8d3',
  fear: '#c2410c',
  condition: '#3fbf7f',
  frame: '#f2efe6',
};

function escape(text: string): string {
  return text.replace(
    /[&<>"']/g,
    (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c] ?? c
  );
}

/** Shrink long text so it fits the key width. */
function fit(text: string, base: number, perChar: number, width = 128): number {
  return Math.min(base, Math.floor(width / Math.max(1, text.length * perChar)));
}

function plate(label: string, tone: string): string {
  const text = label.toUpperCase();
  const size = fit(text, 28, 0.62, 120);
  return (
    `<rect x="0" y="0" width="${SIZE}" height="44" fill="${PLATE}"/>` +
    `<rect x="0" y="0" width="10" height="44" fill="${tone}"/>` +
    `<text x="77" y="31" font-family="${FONT}" font-weight="900" font-size="${size}" fill="${INK}" text-anchor="middle">${escape(text)}</text>`
  );
}

function wrap(body: string): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${SIZE}" height="${SIZE}" viewBox="0 0 ${SIZE} ${SIZE}"><rect width="${SIZE}" height="${SIZE}" fill="${BG}"/>${body}</svg>`;
}

/** Chits for short tracks, a bar for long ones. */
function meter(value: number, max: number, tone: string): string {
  if (max <= 0) return '';
  const y = 116;
  if (max <= 12) {
    const gap = 4;
    const width = (128 - gap * (max - 1)) / max;
    let out = '';
    for (let i = 0; i < max; i += 1) {
      const x = 8 + i * (width + gap);
      out += `<rect x="${x.toFixed(1)}" y="${y}" width="${width.toFixed(1)}" height="18" rx="3" fill="${i < value ? tone : '#2a2e36'}"/>`;
    }
    return out;
  }
  const filled = (128 * value) / max;
  return (
    `<rect x="8" y="${y}" width="128" height="18" rx="3" fill="#2a2e36"/>` +
    `<rect x="8" y="${y}" width="${filled.toFixed(1)}" height="18" rx="3" fill="${tone}"/>`
  );
}

function stepBadge(step: number): string {
  const text = step > 0 ? `+${step}` : `−${Math.abs(step)}`;
  return `<text x="136" y="74" font-family="${FONT}" font-weight="900" font-size="22" fill="${MUTED}" text-anchor="end">${text}</text>`;
}

/** A stat key: label plate, live value, meter. `track` is missing while no HUD is connected. */
export function trackKey(
  id: string,
  fallbackLabel: string,
  track: DeckTrack | undefined,
  step: number
): string {
  const tone = TONES[id] ?? PLATE;
  const label = track?.label ?? fallbackLabel;
  const value = track ? `${track.value}/${track.max}` : '–';
  const size = fit(value, 52, 0.58, 100);
  return wrap(
    plate(label, tone) +
      `<text x="${step === 0 ? 72 : 60}" y="100" font-family="${FONT}" font-weight="900" font-size="${size}" fill="${track ? VALUE : MUTED}" text-anchor="middle">${escape(value)}</text>` +
      (step === 0 ? '' : stepBadge(step)) +
      (track ? meter(track.value, track.max, tone) : '')
  );
}

/** A condition key: lit when the condition is on. */
export function conditionKey(label: string, on: boolean | undefined): string {
  const tone = TONES.condition;
  const text = on === undefined ? '–' : on ? 'ON' : 'OFF';
  const fill = on ? tone : 'none';
  return wrap(
    plate(label, tone) +
      `<rect x="14" y="56" width="116" height="76" rx="10" fill="${fill}" stroke="${on === undefined ? '#2a2e36' : tone}" stroke-width="4"/>` +
      `<text x="72" y="110" font-family="${FONT}" font-weight="900" font-size="40" fill="${on ? INK : on === undefined ? MUTED : VALUE}" text-anchor="middle">${text}</text>`
  );
}

/** A frame key: shows the frame being worn and which way it steps. */
export function frameKey(frameLabel: string | undefined, delta: number): string {
  const name = frameLabel ?? '–';
  const size = fit(name, 26, 0.56, 128);
  const arrow = delta < 0 ? '◀ PREV' : 'NEXT ▶';
  return wrap(
    plate('Frame', TONES.frame) +
      `<text x="72" y="92" font-family="${FONT}" font-weight="800" font-size="${size}" fill="${frameLabel ? VALUE : MUTED}" text-anchor="middle">${escape(name)}</text>` +
      `<text x="72" y="130" font-family="${FONT}" font-weight="900" font-size="22" fill="${MUTED}" text-anchor="middle">${arrow}</text>`
  );
}

export function toDataUrl(svg: string): string {
  return `data:image/svg+xml;base64,${Buffer.from(svg, 'utf8').toString('base64')}`;
}
