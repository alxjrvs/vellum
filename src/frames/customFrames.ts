import { SYSTEM_IDS } from '../systems/types';
import { daggerheartTheme } from '../themes/daggerheart.theme';
import { HUD_SLOTS, HUD_WIDGETS } from '../themes/regions';
import type { ThemeConfig } from '../themes/types';

/**
 * My frames: frames the player made or imported. They live only in this
 * browser (and travel in a copied OBS link), never on a server.
 */
export const CUSTOM_FRAMES_KEY = 'vellum:frames';
export const FRAME_DATA_PARAM = 'frameData';
export const CUSTOM_ID_PREFIX = 'custom-';

const HEX = /^#[0-9a-f]{6}$/i;
// Lengths, font stacks and the like. No url(), no braces or semicolons.
const SAFE_CSS = /^(?!.*url\()[\w\s"',.%()-]{1,120}$/i;

const isObject = (v: unknown): v is Record<string, unknown> => typeof v === 'object' && v !== null;

function pickRecord<T extends string>(
  value: unknown,
  keys: readonly string[],
  check: (v: unknown) => v is T
): Record<string, T> | null {
  if (!isObject(value)) return null;
  const out: Record<string, T> = {};
  for (const key of keys) {
    const v = value[key];
    if (!check(v)) return null;
    out[key] = v;
  }
  return out;
}

const isHex = (v: unknown): v is string => typeof v === 'string' && HEX.test(v);
const isSafeCss = (v: unknown): v is string => typeof v === 'string' && SAFE_CSS.test(v);
const isDisplay = (v: unknown): v is 'bar' | 'chits' => v === 'bar' || v === 'chits';

/**
 * Validate a frame from outside the app (a file, a link, storage). Every
 * value is checked against the shape of a bundled frame; anything unexpected
 * rejects the whole frame. The result is always a custom frame.
 */
export function parseFrame(input: unknown): ThemeConfig | null {
  if (!isObject(input)) return null;
  const template = daggerheartTheme;
  const { id, label, system } = input;
  if (typeof id !== 'string' || !/^[a-z0-9-]{1,64}$/.test(id)) return null;
  if (typeof label !== 'string' || label.trim().length === 0 || label.length > 40) return null;
  if (!(SYSTEM_IDS as readonly unknown[]).includes(system)) return null;

  const colors = pickRecord(input.colors, Object.keys(template.colors), isHex);
  const typography = pickRecord(input.typography, Object.keys(template.typography), isSafeCss);
  const layout = pickRecord(input.layout, Object.keys(template.layout), isSafeCss);
  const tracks = pickRecord(input.tracks, Object.keys(template.tracks), isDisplay);
  if (!colors || !typography || !layout || !tracks) return null;

  let regions: ThemeConfig['regions'];
  if (input.regions !== undefined) {
    if (!isObject(input.regions)) return null;
    const out: Record<string, string> = {};
    for (const [widget, slot] of Object.entries(input.regions)) {
      if (!(HUD_WIDGETS as readonly string[]).includes(widget)) return null;
      if (!(HUD_SLOTS as readonly unknown[]).includes(slot)) return null;
      out[widget] = slot as string;
    }
    regions = out as ThemeConfig['regions'];
  }

  return {
    id: id.startsWith(CUSTOM_ID_PREFIX) ? id : `${CUSTOM_ID_PREFIX}${id}`,
    label: label.trim(),
    system: system as ThemeConfig['system'],
    origin: 'custom',
    colors: colors as unknown as ThemeConfig['colors'],
    typography: typography as unknown as ThemeConfig['typography'],
    layout: layout as unknown as ThemeConfig['layout'],
    tracks: tracks as unknown as ThemeConfig['tracks'],
    ...(regions ? { regions } : {}),
  };
}

export function readCustomFrames(): ThemeConfig[] {
  try {
    const parsed: unknown = JSON.parse(localStorage.getItem(CUSTOM_FRAMES_KEY) ?? '[]');
    return Array.isArray(parsed)
      ? parsed.map(parseFrame).filter((f): f is ThemeConfig => f !== null)
      : [];
  } catch {
    return [];
  }
}

export function writeCustomFrames(frames: readonly ThemeConfig[]): void {
  try {
    localStorage.setItem(CUSTOM_FRAMES_KEY, JSON.stringify(frames));
  } catch {
    // Storage blocked: the frames last for this session only.
  }
}

/** Add or replace a frame by id. */
export function upsertFrame(frames: readonly ThemeConfig[], frame: ThemeConfig): ThemeConfig[] {
  const i = frames.findIndex((f) => f.id === frame.id);
  return i === -1 ? [...frames, frame] : frames.map((f, j) => (j === i ? frame : f));
}

function toBase64Url(text: string): string {
  let binary = '';
  for (const byte of new TextEncoder().encode(text)) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function fromBase64Url(param: string): string | null {
  try {
    const base64 = param.replace(/-/g, '+').replace(/_/g, '/');
    const binary = atob(base64 + '='.repeat((4 - (base64.length % 4)) % 4));
    return new TextDecoder().decode(Uint8Array.from(binary, (c) => c.charCodeAt(0)));
  } catch {
    return null;
  }
}

/** Pack a custom frame into a link parameter, so an OBS source can wear it. */
export function encodeFrameParam(frame: ThemeConfig): string {
  return toBase64Url(JSON.stringify(frame));
}

export function decodeFrameParam(param: string): ThemeConfig | null {
  const json = fromBase64Url(param);
  if (json === null) return null;
  try {
    return parseFrame(JSON.parse(json));
  } catch {
    return null;
  }
}

export function readFrameDataFromUrl(search: string = window.location.search): ThemeConfig | null {
  const param = new URLSearchParams(search).get(FRAME_DATA_PARAM);
  return param ? decodeFrameParam(param) : null;
}
