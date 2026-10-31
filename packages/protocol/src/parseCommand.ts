import {
  CORE_CONDITION_IDS,
  TRACK_IDS,
  type Command,
  type CoreConditionId,
  type TrackId,
} from './commands';

function isTrack(value: unknown): value is TrackId {
  return typeof value === 'string' && (TRACK_IDS as readonly string[]).includes(value);
}

function isCondition(value: unknown): value is CoreConditionId {
  return typeof value === 'string' && (CORE_CONDITION_IDS as readonly string[]).includes(value);
}

function isInteger(value: unknown): value is number {
  return typeof value === 'number' && Number.isInteger(value);
}

/**
 * Validate a command arriving from outside the app (an OBS browser event, a
 * Stream Deck plugin). Anything malformed yields null and is dropped: an
 * external input must never be able to throw inside the HUD.
 */
export function parseCommand(input: unknown): Command | null {
  if (typeof input !== 'object' || input === null) return null;
  const c = input as Record<string, unknown>;
  switch (c.type) {
    case 'track.adjust':
      return isTrack(c.track) && isInteger(c.delta)
        ? { type: 'track.adjust', track: c.track, delta: c.delta }
        : null;
    case 'track.set':
      return isTrack(c.track) && isInteger(c.value)
        ? { type: 'track.set', track: c.track, value: c.value }
        : null;
    case 'condition.toggle':
      return isCondition(c.condition) ? { type: 'condition.toggle', condition: c.condition } : null;
    case 'feature.toggle':
      return typeof c.name === 'string' && c.name.length > 0
        ? { type: 'feature.toggle', name: c.name }
        : null;
    case 'frame.set':
      return typeof c.frame === 'string' && c.frame.length > 0
        ? { type: 'frame.set', frame: c.frame }
        : null;
    case 'frame.cycle':
      return isInteger(c.delta) ? { type: 'frame.cycle', delta: c.delta } : null;
    default:
      return null;
  }
}
