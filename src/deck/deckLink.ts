import { publishCommand } from '../commands/commandBus';
import {
  DECK_PROTOCOL_VERSION,
  DECK_URL,
  parsePluginMessage,
  type DeckState,
  type PageMessage,
} from '@vellum/protocol';

/** The query param that turns the link on outside OBS (for testing in a browser). */
export const DECK_QUERY_PARAM = 'deck';

const RETRY_MIN_MS = 1000;
const RETRY_MAX_MS = 30000;

/**
 * Connect only where a Stream Deck can be listening: inside an OBS browser
 * source (which exposes `window.obsstudio`), or when a link asks with
 * `?deck=1`. An ordinary browser tab never opens the socket.
 */
export function shouldLinkDeck(win: Window = window): boolean {
  if ('obsstudio' in win) return true;
  return new URLSearchParams(win.location.search).get(DECK_QUERY_PARAM) === '1';
}

/** Whether the Stream Deck plugin is on the line, for setup to show. */
export type DeckStatus = 'off' | 'searching' | 'linked';

let current: DeckState = {};
let socket: WebSocket | null = null;
let status: DeckStatus = 'off';
const statusListeners = new Set<() => void>();

function setStatus(next: DeckStatus): void {
  if (next === status) return;
  status = next;
  for (const listener of statusListeners) listener();
}

export function deckStatus(): DeckStatus {
  return status;
}

export function subscribeDeckStatus(listener: () => void): () => void {
  statusListeners.add(listener);
  return () => statusListeners.delete(listener);
}

function send(message: PageMessage): void {
  if (socket?.readyState === WebSocket.OPEN) socket.send(JSON.stringify(message));
}

/** Tell the plugin what this page shows. Fields merge into what was reported before. */
export function reportDeckState(patch: DeckState): void {
  current = { ...current, ...patch };
  send({ type: 'state', state: current });
}

interface LinkOptions {
  readonly url?: string;
  readonly createSocket?: (url: string) => WebSocket;
}

/**
 * Keep a connection to the Stream Deck plugin open, retrying with backoff
 * when the plugin isn't running. Commands from the plugin go onto the same
 * bus as clicks and OBS hotkeys. Returns a function that closes the link.
 */
export function startDeckLink({
  url = DECK_URL,
  createSocket = (u) => new WebSocket(u),
}: LinkOptions = {}): () => void {
  let stopped = false;
  let delay = RETRY_MIN_MS;
  let timer: ReturnType<typeof setTimeout> | undefined;

  const connect = () => {
    if (status !== 'linked') setStatus('searching');
    const ws = createSocket(url);
    socket = ws;
    ws.addEventListener('open', () => {
      delay = RETRY_MIN_MS;
      setStatus('linked');
      send({ type: 'hello', version: DECK_PROTOCOL_VERSION });
      send({ type: 'state', state: current });
    });
    ws.addEventListener('message', (event) => {
      if (typeof event.data !== 'string') return;
      const message = parsePluginMessage(event.data);
      if (message) publishCommand(message.command);
    });
    ws.addEventListener('close', () => {
      if (socket === ws) socket = null;
      if (stopped) return;
      setStatus('searching');
      timer = setTimeout(connect, delay);
      delay = Math.min(delay * 2, RETRY_MAX_MS);
    });
  };

  connect();
  return () => {
    stopped = true;
    clearTimeout(timer);
    socket?.close();
    socket = null;
    setStatus('off');
  };
}
