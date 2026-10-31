import { WebSocketServer, type WebSocket } from 'ws';
import type { Command } from '../../../src/commands/types';
import {
  DECK_PORT,
  isAllowedOrigin,
  mergeStates,
  parsePageMessage,
  type DeckState,
  type PluginMessage,
} from '../../../src/deck/protocol';

type Listener = (state: DeckState, connected: boolean) => void;

const RETRY_MS = 5000;

/**
 * The plugin's side of the link: a WebSocket server on 127.0.0.1 that Vellum
 * pages inside OBS connect to. It keeps each page's latest report, merges
 * them for the keys to draw, and sends key presses to every page (a page
 * ignores commands it has nothing to do with, so Fear only moves on the GM
 * screen).
 */
export class DeckBridge {
  private server: WebSocketServer | null = null;
  private readonly pages = new Map<WebSocket, DeckState>();
  private readonly listeners = new Set<Listener>();
  private retry: ReturnType<typeof setTimeout> | undefined;
  private stopped = false;

  constructor(
    private readonly port: number = DECK_PORT,
    private readonly log: (message: string) => void = () => {}
  ) {}

  /** Resolves once listening, or after the first failure (it keeps retrying). */
  start(): Promise<void> {
    return new Promise((resolve) => {
      const server = new WebSocketServer({
        host: '127.0.0.1',
        port: this.port,
        maxPayload: 64 * 1024,
        // Any page in any browser on this machine can reach 127.0.0.1, so only
        // Vellum itself gets an answer.
        verifyClient: ({ origin }: { origin: string }) => isAllowedOrigin(origin),
      });
      this.server = server;
      server.on('listening', () => {
        this.log(`listening on 127.0.0.1:${this.port}`);
        resolve();
      });
      server.on('error', (error) => {
        // Usually the port is taken (a second copy of the plugin). Try again later.
        this.log(`server error: ${error.message}`);
        server.close();
        if (this.server === server) this.server = null;
        if (!this.stopped) this.retry = setTimeout(() => void this.start(), RETRY_MS);
        resolve();
      });
      server.on('connection', (socket) => this.accept(socket));
    });
  }

  stop(): Promise<void> {
    this.stopped = true;
    clearTimeout(this.retry);
    for (const socket of this.pages.keys()) socket.terminate();
    this.pages.clear();
    const server = this.server;
    this.server = null;
    return new Promise((resolve) => (server ? server.close(() => resolve()) : resolve()));
  }

  get connected(): boolean {
    return this.pages.size > 0;
  }

  get state(): DeckState {
    return mergeStates(this.pages.values());
  }

  onChange(listener: Listener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  /** Send a key press to every connected page. False when no page is listening. */
  send(command: Command): boolean {
    const message: PluginMessage = { type: 'command', command };
    const raw = JSON.stringify(message);
    for (const socket of this.pages.keys()) socket.send(raw);
    return this.pages.size > 0;
  }

  private accept(socket: WebSocket): void {
    this.pages.set(socket, {});
    this.emit();
    socket.on('message', (data, isBinary) => {
      if (isBinary) return;
      const message = parsePageMessage(data.toString());
      if (message?.type !== 'state') return;
      this.pages.set(socket, message.state);
      this.emit();
    });
    socket.on('close', () => {
      this.pages.delete(socket);
      this.emit();
    });
  }

  private emit(): void {
    const state = this.state;
    for (const listener of this.listeners) listener(state, this.connected);
  }
}
