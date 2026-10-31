import { describe, expect, it } from 'vitest';
import script from '../../obs/vellum-hotkeys.lua?raw';
import { COMMAND_EVENT } from './commandBus';
import { parseCommand } from './parseCommand';

// Rows of the script's COMMANDS table: { "id", "description", 'json' }.
const ROW = /\{\s*"([^"]+)",\s*"([^"]+)",\s*'([^']+)'\s*\}/g;
const rows = [...script.matchAll(ROW)].map(([, id, description, json]) => ({
  id,
  description,
  json,
}));

describe('OBS hotkey script', () => {
  it('declares hotkeys', () => {
    expect(rows.length).toBeGreaterThan(10);
  });

  it('sends the event name the app listens for', () => {
    expect(script).toContain(`local EVENT_NAME = "${COMMAND_EVENT}"`);
  });

  it('gives every hotkey a unique id', () => {
    const ids = rows.map((r) => r.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it.each(rows.map((r) => [r.description, r.json] as const))(
    '%s sends a command the app accepts',
    (_, json) => {
      expect(parseCommand(JSON.parse(json))).not.toBeNull();
    }
  );
});
