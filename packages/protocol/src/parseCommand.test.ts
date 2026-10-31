import { describe, expect, it } from 'vitest';
import { parseCommand } from './parseCommand';

describe('parseCommand', () => {
  it('accepts each well-formed command', () => {
    expect(parseCommand({ type: 'track.adjust', track: 'hope', delta: 1 })).toEqual({
      type: 'track.adjust',
      track: 'hope',
      delta: 1,
    });
    expect(parseCommand({ type: 'track.set', track: 'hp', value: 2 })).not.toBeNull();
    expect(parseCommand({ type: 'condition.toggle', condition: 'hidden' })).not.toBeNull();
    expect(parseCommand({ type: 'feature.toggle', name: 'Cloaked' })).not.toBeNull();
    expect(parseCommand({ type: 'frame.set', frame: 'daggerheart-ledger' })).not.toBeNull();
    expect(parseCommand({ type: 'frame.cycle', delta: -1 })).not.toBeNull();
  });

  it('rejects malformed or unknown input', () => {
    for (const bad of [
      null,
      'track.adjust',
      { type: 'track.adjust', track: 'mana', delta: 1 },
      { type: 'track.adjust', track: 'hope', delta: 1.5 },
      { type: 'track.set', track: 'hope', value: '3' },
      { type: 'condition.toggle', condition: 'asleep' },
      { type: 'feature.toggle', name: '' },
      { type: 'frame.set', frame: 3 },
      { type: 'frame.cycle', delta: 'next' },
      { type: 'explode' },
    ]) {
      expect(parseCommand(bad)).toBeNull();
    }
  });
});
