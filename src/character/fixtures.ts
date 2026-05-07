import type { CharacterState } from './types';

export function makeCharacter(overrides: Partial<CharacterState> = {}): CharacterState {
  return {
    system: 'daggerheart',
    identity: {
      name: 'Seraphine',
      class: 'Bard',
      ancestry: 'Elf',
    },
    stats: {
      hope: 2,
      hp: [],
      stress: [],
      armorSlots: [],
    },
    slotCounts: {
      hp: 6,
      stress: 6,
      armorSlots: 3,
    },
    conditions: {
      core: { hidden: false, restrained: false, vulnerable: false },
      feature: {},
    },
    featureConditions: [],
    ...overrides,
  };
}
