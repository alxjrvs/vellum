import type { DaggerheartSystemConfig } from './types';

export const daggerheartSystem: DaggerheartSystemConfig = {
  id: 'daggerheart',
  label: 'Daggerheart',
  hope: { max: 6 },
  fear: { max: 12 },
  stress: { defaultMax: 6, advancementMax: 12 },
  hpClassTable: {
    bard: 6,
    druid: 6,
    guardian: 7,
    ranger: 6,
    rogue: 6,
    seraph: 7,
    sorcerer: 5,
    warrior: 6,
    wizard: 5,
  },
  armorTable: {
    unarmored: 0,
    gambeson: 3,
    leather: 3,
    chainmail: 4,
    fullplate: 4,
  },
  coreConditions: [
    { id: 'hidden', label: 'Hidden' },
    { id: 'restrained', label: 'Restrained' },
    { id: 'vulnerable', label: 'Vulnerable' },
  ],
};
