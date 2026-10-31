import { describe, expect, it } from 'vitest';
import { daggerheartSystem } from './daggerheart.system';
import { TRACK_IDS } from '../commands/types';

describe('daggerheartSystem', () => {
  it('uses the daggerheart discriminator', () => {
    expect(daggerheartSystem.id).toBe('daggerheart');
  });

  it('caps Hope at 6 (Daggerheart SRD)', () => {
    expect(daggerheartSystem.hope.max).toBe(6);
  });

  it('caps Fear at 12 (Daggerheart SRD)', () => {
    expect(daggerheartSystem.fear.max).toBe(12);
  });

  it('exposes Stress default cap of 6 and advancement cap of 12', () => {
    expect(daggerheartSystem.stress.defaultMax).toBe(6);
    expect(daggerheartSystem.stress.advancementMax).toBe(12);
  });

  it('lists exactly the three core conditions: Hidden, Restrained, Vulnerable', () => {
    expect(daggerheartSystem.coreConditions.map((c) => c.id)).toEqual([
      'hidden',
      'restrained',
      'vulnerable',
    ]);
  });

  it('exposes armor slot counts: 0 (unarmored), 3 (gambeson/leather), 4 (chainmail/fullplate)', () => {
    expect(daggerheartSystem.armorTable.unarmored).toBe(0);
    expect(daggerheartSystem.armorTable.gambeson).toBe(3);
    expect(daggerheartSystem.armorTable.leather).toBe(3);
    expect(daggerheartSystem.armorTable.chainmail).toBe(4);
    expect(daggerheartSystem.armorTable.fullplate).toBe(4);
  });

  it('exposes a Bard L1 HP slot count of 6 (architecture example)', () => {
    expect(daggerheartSystem.hpClassTable.bard).toBe(6);
  });

  it('keeps all L1 class HP values within the 5-7 range', () => {
    for (const hp of Object.values(daggerheartSystem.hpClassTable)) {
      expect(hp).toBeGreaterThanOrEqual(5);
      expect(hp).toBeLessThanOrEqual(7);
    }
  });
});

describe('daggerheart resources', () => {
  it('declares each track exactly once', () => {
    const ids = daggerheartSystem.resources.map((r) => r.id);
    expect(new Set(ids).size).toBe(ids.length);
    expect([...ids].sort()).toEqual([...TRACK_IDS].sort());
  });

  it('keeps Fear on the GM side and everything else on the player side', () => {
    const gm = daggerheartSystem.resources.filter((r) => r.side === 'gm').map((r) => r.id);
    expect(gm).toEqual(['fear']);
  });
});
