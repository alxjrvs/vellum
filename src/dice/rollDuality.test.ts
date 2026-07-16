import { afterEach, describe, expect, it, vi } from 'vitest';
import { rollDuality } from './rollDuality';

const rollDaggerheart = vi.hoisted(() => vi.fn());
vi.mock('@randsum/daggerheart', () => ({ rollDaggerheart }));

function engineResult(over: {
  total: number;
  type: 'hope' | 'fear' | 'critical hope';
  hope: number;
  fear: number;
  modifier: number;
  advantage?: number;
}) {
  return {
    result: {
      total: over.total,
      type: over.type,
      details: {
        hope: { roll: over.hope, amplified: false },
        fear: { roll: over.fear, amplified: false },
        modifier: over.modifier,
        ...(over.advantage !== undefined ? { advantage: { roll: over.advantage } } : {}),
      },
    },
  };
}

afterEach(() => vi.clearAllMocks());

describe('rollDuality — engine argument mapping', () => {
  it('passes a zero modifier and no rollingWith when called with no input', () => {
    rollDaggerheart.mockReturnValue(
      engineResult({ total: 10, type: 'hope', hope: 6, fear: 4, modifier: 0 })
    );
    rollDuality();
    expect(rollDaggerheart).toHaveBeenCalledWith({ modifier: 0 });
  });

  it('forwards the modifier and omits rollingWith when advantage is "none"', () => {
    rollDaggerheart.mockReturnValue(
      engineResult({ total: 13, type: 'hope', hope: 8, fear: 3, modifier: 2 })
    );
    rollDuality({ modifier: 2, advantage: 'none' });
    expect(rollDaggerheart).toHaveBeenCalledWith({ modifier: 2 });
  });

  it('maps advantage to rollingWith: "Advantage"', () => {
    rollDaggerheart.mockReturnValue(
      engineResult({ total: 15, type: 'hope', hope: 7, fear: 5, modifier: 0, advantage: 3 })
    );
    rollDuality({ advantage: 'advantage' });
    expect(rollDaggerheart).toHaveBeenCalledWith({ modifier: 0, rollingWith: 'Advantage' });
  });

  it('maps disadvantage to rollingWith: "Disadvantage"', () => {
    rollDaggerheart.mockReturnValue(
      engineResult({ total: 6, type: 'fear', hope: 4, fear: 5, modifier: 1, advantage: -4 })
    );
    rollDuality({ modifier: 1, advantage: 'disadvantage' });
    expect(rollDaggerheart).toHaveBeenCalledWith({ modifier: 1, rollingWith: 'Disadvantage' });
  });
});

describe('rollDuality — result normalization', () => {
  it('flattens the engine result into a DualityRoll', () => {
    rollDaggerheart.mockReturnValue(
      engineResult({ total: 15, type: 'hope', hope: 7, fear: 5, modifier: 3 })
    );
    expect(rollDuality({ modifier: 3 })).toEqual({
      total: 15,
      outcome: 'hope',
      hope: 7,
      fear: 5,
      modifier: 3,
      advantageValue: undefined,
      rolledWith: 'none',
    });
  });

  it('surfaces the signed advantage die when present', () => {
    rollDaggerheart.mockReturnValue(
      engineResult({ total: 12, type: 'fear', hope: 4, fear: 6, modifier: -1, advantage: -3 })
    );
    expect(rollDuality({ modifier: -1, advantage: 'disadvantage' })).toMatchObject({
      advantageValue: -3,
      rolledWith: 'disadvantage',
      outcome: 'fear',
    });
  });
});

describe('rollDuality — integration with the real engine', () => {
  it('rolls valid duality dice with a coherent total across many samples', async () => {
    vi.doUnmock('@randsum/daggerheart');
    vi.resetModules();
    const { rollDuality: realRoll } = await import('./rollDuality');

    for (let i = 0; i < 200; i++) {
      const modifier = (i % 7) - 3;
      const advantage = (['none', 'advantage', 'disadvantage'] as const)[i % 3];
      const r = realRoll({ modifier, advantage });

      expect(r.hope).toBeGreaterThanOrEqual(1);
      expect(r.hope).toBeLessThanOrEqual(12);
      expect(r.fear).toBeGreaterThanOrEqual(1);
      expect(r.fear).toBeLessThanOrEqual(12);
      expect(['hope', 'fear', 'critical hope']).toContain(r.outcome);
      expect(r.modifier).toBe(modifier);
      expect(r.rolledWith).toBe(advantage);

      const advSum = r.advantageValue ?? 0;
      expect(r.total).toBe(r.hope + r.fear + modifier + advSum);
      if (r.hope === r.fear) expect(r.outcome).toBe('critical hope');
      if (advantage === 'none') expect(r.advantageValue).toBeUndefined();
    }
  });
});
