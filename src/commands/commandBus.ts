import { parseCommand } from './parseCommand';
import type { Command } from './types';

type Listener = (command: Command) => void;

const listeners = new Set<Listener>();

/** Deliver a command to every subscriber (the character store, the Fear pool). */
export function publishCommand(command: Command): void {
  for (const listener of listeners) listener(command);
}

export function subscribeCommands(listener: Listener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

/**
 * The DOM event external inputs use. obs-browser's `emit_event` vendor request
 * (sent by the OBS hotkey script or a Stream Deck plugin over obs-websocket)
 * fires a `window` event named `event_name` whose `detail` is `event_data`, so
 * `{"event_name": "vellum:command", "event_data": {"type": "track.adjust",
 * "track": "hope", "delta": 1}}` lands here.
 */
export const COMMAND_EVENT = 'vellum:command';

/** Listen for external commands on `window`. Returns an unsubscribe function. */
export function listenForExternalCommands(target: EventTarget = window): () => void {
  const onEvent = (event: Event) => {
    const command = parseCommand((event as CustomEvent<unknown>).detail);
    if (command) publishCommand(command);
  };
  target.addEventListener(COMMAND_EVENT, onEvent);
  return () => target.removeEventListener(COMMAND_EVENT, onEvent);
}
