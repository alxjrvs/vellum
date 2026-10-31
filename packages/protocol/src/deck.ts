import type { Command, CoreConditionId, TrackId } from './commands';
import { parseCommand } from './parseCommand';

/**
 * The wire format between a Vellum page and the Vellum Stream Deck plugin.
 *
 * The plugin runs a WebSocket server on the player's own machine, bound to
 * 127.0.0.1. A Vellum page inside OBS connects to it, reports what the HUD is
 * showing, and receives the commands the keys send. Nothing here crosses the
 * network: both ends are on the same computer.
 *
 * Shared by the app and the plugin (apps/streamdeck), so it stays free of DOM
 * and Node APIs.
 */
export const DECK_PROTOCOL_VERSION = 1;
export const DECK_PORT = 28196;
export const DECK_URL = `ws://127.0.0.1:${DECK_PORT}`;

/** A stat as the HUD shows it: HP counts remaining health, the rest count marks. */
export interface DeckTrack {
  readonly label: string;
  readonly value: number;
  readonly max: number;
}

/**
 * What one page reports. Each field is optional: the player HUD reports
 * tracks and conditions, the GM screen reports Fear, and the plugin merges
 * every connected page into one picture.
 */
export interface DeckState {
  readonly tracks?: Partial<Record<TrackId, DeckTrack>>;
  readonly conditions?: Partial<Record<CoreConditionId, boolean>>;
  readonly frame?: { readonly id: string; readonly label: string };
}

export type PageMessage =
  | { readonly type: 'hello'; readonly version: number }
  | { readonly type: 'state'; readonly state: DeckState };

export type PluginMessage = { readonly type: 'command'; readonly command: Command };

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function parseJson(raw: string): unknown {
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

/** Read a message the plugin sent. Anything else is dropped. */
export function parsePluginMessage(raw: string): PluginMessage | null {
  const data = parseJson(raw);
  if (!isRecord(data) || data.type !== 'command') return null;
  const command = parseCommand(data.command);
  return command ? { type: 'command', command } : null;
}

function parseTrack(value: unknown): DeckTrack | null {
  if (!isRecord(value)) return null;
  const { label, value: current, max } = value;
  if (typeof label !== 'string' || label.length === 0 || label.length > 40) return null;
  if (!Number.isInteger(current) || !Number.isInteger(max)) return null;
  if ((max as number) < 0 || (max as number) > 99) return null;
  if ((current as number) < 0 || (current as number) > (max as number)) return null;
  return { label, value: current as number, max: max as number };
}

const TRACKS: readonly TrackId[] = ['hope', 'hp', 'stress', 'armor', 'fear'];
const CONDITIONS: readonly CoreConditionId[] = ['hidden', 'restrained', 'vulnerable'];

function parseState(value: unknown): DeckState | null {
  if (!isRecord(value)) return null;
  const state: {
    tracks?: Partial<Record<TrackId, DeckTrack>>;
    conditions?: Partial<Record<CoreConditionId, boolean>>;
    frame?: { id: string; label: string };
  } = {};
  if (isRecord(value.tracks)) {
    const tracks: Partial<Record<TrackId, DeckTrack>> = {};
    for (const id of TRACKS) {
      const track = parseTrack(value.tracks[id]);
      if (track) tracks[id] = track;
    }
    state.tracks = tracks;
  }
  if (isRecord(value.conditions)) {
    const conditions: Partial<Record<CoreConditionId, boolean>> = {};
    for (const id of CONDITIONS) {
      const on = value.conditions[id];
      if (typeof on === 'boolean') conditions[id] = on;
    }
    state.conditions = conditions;
  }
  if (isRecord(value.frame)) {
    const { id, label } = value.frame;
    if (typeof id === 'string' && typeof label === 'string' && label.length <= 40) {
      state.frame = { id, label };
    }
  }
  return state;
}

/** Read a message a page sent. Anything malformed is dropped. */
export function parsePageMessage(raw: string): PageMessage | null {
  const data = parseJson(raw);
  if (!isRecord(data)) return null;
  if (data.type === 'hello' && Number.isInteger(data.version)) {
    return { type: 'hello', version: data.version as number };
  }
  if (data.type === 'state') {
    const state = parseState(data.state);
    return state ? { type: 'state', state } : null;
  }
  return null;
}

/** Merge page reports, later pages winning field by field. */
export function mergeStates(states: Iterable<DeckState>): DeckState {
  let tracks: Partial<Record<TrackId, DeckTrack>> = {};
  let conditions: Partial<Record<CoreConditionId, boolean>> = {};
  let frame: DeckState['frame'];
  for (const state of states) {
    tracks = { ...tracks, ...state.tracks };
    conditions = { ...conditions, ...state.conditions };
    frame = state.frame ?? frame;
  }
  return frame ? { tracks, conditions, frame } : { tracks, conditions };
}

/**
 * Pages the plugin will talk to. A WebSocket on 127.0.0.1 is reachable from
 * any page open in any browser on the machine, so the plugin checks the
 * Origin header and only answers Vellum itself (and a local dev server).
 */
export function isAllowedOrigin(origin: string | undefined): boolean {
  if (!origin) return false;
  let url: URL;
  try {
    url = new URL(origin);
  } catch {
    return false;
  }
  if (url.protocol === 'https:' && url.hostname === 'vellumhud.com' && url.port === '') {
    return true;
  }
  return url.protocol === 'http:' && (url.hostname === 'localhost' || url.hostname === '127.0.0.1');
}
