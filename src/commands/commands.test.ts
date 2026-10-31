import { describe, expect, it, vi } from 'vitest';
import { characterReducer } from '../character/reducer';
import { makeCharacter } from '../character/fixtures';
import type { CharacterState } from '../character/types';
import {
  COMMAND_EVENT,
  listenForExternalCommands,
  publishCommand,
  subscribeCommands,
} from './commandBus';
import { parseCommand } from './parseCommand';
import type { Command } from './types';

const limits = { hopeMax: 6 };

function apply(state: CharacterState, command: Command): CharacterState {
  const next = characterReducer(state, { type: 'APPLY_COMMAND', command, limits });
  if (!next) throw new Error('character vanished');
  return next;
}

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

describe('APPLY_COMMAND', () => {
  it('adjusts Hope relatively and clamps to the system max', () => {
    let state = makeCharacter({ stats: { hope: 5, hp: [], stress: [], armorSlots: [] } });
    state = apply(state, { type: 'track.adjust', track: 'hope', delta: 1 });
    expect(state.stats.hope).toBe(6);
    state = apply(state, { type: 'track.adjust', track: 'hope', delta: 1 });
    expect(state.stats.hope).toBe(6);
    state = apply(state, { type: 'track.adjust', track: 'hope', delta: -10 });
    expect(state.stats.hope).toBe(0);
  });

  it('marks and clears HP and Stress as level tracks', () => {
    let state = makeCharacter();
    state = apply(state, { type: 'track.adjust', track: 'hp', delta: 2 });
    expect(state.stats.hp).toEqual([0, 1]);
    state = apply(state, { type: 'track.set', track: 'stress', value: 3 });
    expect(state.stats.stress).toEqual([0, 1, 2]);
    state = apply(state, { type: 'track.adjust', track: 'stress', delta: -1 });
    expect(state.stats.stress).toEqual([0, 1]);
  });

  it('marks the lowest free armor slots and clears the highest marked ones', () => {
    let state = makeCharacter({
      stats: { hope: 0, hp: [], stress: [], armorSlots: [1] },
    });
    state = apply(state, { type: 'track.adjust', track: 'armor', delta: 2 });
    expect([...state.stats.armorSlots].sort()).toEqual([0, 1, 2]);
    state = apply(state, { type: 'track.adjust', track: 'armor', delta: -1 });
    expect([...state.stats.armorSlots].sort()).toEqual([0, 1]);
  });

  it('toggles conditions, and only feature conditions the character has', () => {
    let state = makeCharacter({ featureConditions: ['Cloaked'] });
    state = apply(state, { type: 'condition.toggle', condition: 'hidden' });
    expect(state.conditions.core.hidden).toBe(true);
    state = apply(state, { type: 'feature.toggle', name: 'Cloaked' });
    expect(state.conditions.feature.Cloaked).toBe(true);
    const before = state;
    expect(apply(state, { type: 'feature.toggle', name: 'Unknown' })).toBe(before);
  });

  it('leaves Fear to the GM pool and does nothing without a character', () => {
    const state = makeCharacter();
    expect(apply(state, { type: 'track.adjust', track: 'fear', delta: 1 })).toBe(state);
    expect(
      characterReducer(null, {
        type: 'APPLY_COMMAND',
        command: { type: 'track.adjust', track: 'hope', delta: 1 },
        limits,
      })
    ).toBeNull();
  });
});

describe('command bus', () => {
  it('delivers external window events as parsed commands and drops junk', () => {
    const target = new EventTarget();
    const seen = vi.fn();
    const unsubscribe = subscribeCommands(seen);
    const stop = listenForExternalCommands(target);
    target.dispatchEvent(
      new CustomEvent(COMMAND_EVENT, { detail: { type: 'track.adjust', track: 'hp', delta: 1 } })
    );
    target.dispatchEvent(new CustomEvent(COMMAND_EVENT, { detail: { type: 'nope' } }));
    stop();
    target.dispatchEvent(
      new CustomEvent(COMMAND_EVENT, { detail: { type: 'track.adjust', track: 'hp', delta: 1 } })
    );
    unsubscribe();
    publishCommand({ type: 'track.adjust', track: 'hp', delta: 1 });
    expect(seen).toHaveBeenCalledTimes(1);
    expect(seen).toHaveBeenCalledWith({ type: 'track.adjust', track: 'hp', delta: 1 });
  });
});
