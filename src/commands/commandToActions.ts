import type { CharacterAction } from '../character/reducer';
import type { CharacterState } from '../character/types';
import type { Command, TrackId } from './types';

export interface CommandLimits {
  readonly hopeMax: number;
}

/**
 * Translate a command into the character reducer's existing actions, against
 * the current state. Fear is GM state and lives outside the character, so its
 * commands translate to nothing here (see `useFear`).
 */
export function commandToActions(
  command: Command,
  state: CharacterState,
  limits: CommandLimits
): readonly CharacterAction[] {
  switch (command.type) {
    case 'condition.toggle':
      return [{ type: 'CONDITION_TOGGLE', condition: command.condition }];
    case 'feature.toggle':
      return state.featureConditions.includes(command.name)
        ? [{ type: 'FEATURE_CONDITION_TOGGLE', name: command.name }]
        : [];
    case 'track.adjust':
    case 'track.set': {
      if (command.track === 'fear') return [];
      const current = currentValue(command.track, state) ?? 0;
      const target = command.type === 'track.adjust' ? current + command.delta : command.value;
      return setTrack(command.track, target, state, limits);
    }
  }
}

function currentValue(track: TrackId, state: CharacterState): number | null {
  switch (track) {
    case 'hope':
      return state.stats.hope;
    case 'hp':
      return state.stats.hp.length;
    case 'stress':
      return state.stats.stress.length;
    case 'armor':
      return state.stats.armorSlots.length;
    case 'fear':
      return null;
  }
}

function setTrack(
  track: Exclude<TrackId, 'fear'>,
  target: number,
  state: CharacterState,
  limits: CommandLimits
): readonly CharacterAction[] {
  switch (track) {
    case 'hope':
      return [{ type: 'HOPE_SET', value: target, max: limits.hopeMax }];
    case 'hp':
      return [{ type: 'HP_SET', count: target }];
    case 'stress':
      return [{ type: 'STRESS_SET', count: target }];
    case 'armor':
      return armorToggles(state, target);
  }
}

/**
 * Armor is a toggle track (any slot can be marked), so reaching a target count
 * marks the lowest free slots or clears the highest marked ones.
 */
function armorToggles(state: CharacterState, target: number): readonly CharacterAction[] {
  const total = state.slotCounts.armorSlots;
  const marked = new Set(state.stats.armorSlots);
  const goal = Math.max(0, Math.min(target, total));
  const actions: CharacterAction[] = [];
  if (goal > marked.size) {
    for (let i = 0; i < total && marked.size + actions.length < goal; i += 1) {
      if (!marked.has(i)) actions.push({ type: 'ARMOR_TOGGLE_SLOT', index: i });
    }
  } else {
    const desc = [...marked].sort((a, b) => b - a);
    for (const index of desc.slice(0, marked.size - goal)) {
      actions.push({ type: 'ARMOR_TOGGLE_SLOT', index });
    }
  }
  return actions;
}
