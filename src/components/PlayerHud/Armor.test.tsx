import { describe, expect, it } from 'vitest';
import { fireEvent, render, screen, within } from '@testing-library/react';
import { Armor } from './Armor';
import { CharacterProvider } from '../../character/CharacterProvider';
import { SystemProvider } from '../../systems/SystemProvider';
import { daggerheartSystem } from '../../systems/daggerheart.system';
import { writeCharacterToStorage } from '../../character/storage';
import { makeCharacter } from '../../character/fixtures';
import type { CharacterState } from '../../character/types';

function renderArmor(overrides: Partial<CharacterState> = {}) {
  writeCharacterToStorage(makeCharacter(overrides));
  return render(
    <SystemProvider system={daggerheartSystem}>
      <CharacterProvider>
        <Armor />
      </CharacterProvider>
    </SystemProvider>
  );
}

function slots() {
  return within(screen.getByRole('group', { name: /Armor slots/i })).getAllByRole('button');
}

describe('Armor', () => {
  it('renders nothing when no character is loaded', () => {
    const { container } = render(
      <SystemProvider system={daggerheartSystem}>
        <CharacterProvider>
          <Armor />
        </CharacterProvider>
      </SystemProvider>
    );
    expect(container.querySelector('[aria-label="Armor"]')).toBeNull();
  });

  it('renders 3 unmarked slots for Leather (slotCounts.armorSlots=3)', () => {
    renderArmor({ slotCounts: { hp: 6, stress: 6, armorSlots: 3 } });
    expect(slots()).toHaveLength(3);
    expect(slots().every((s) => s.dataset.state === 'unmarked')).toBe(true);
  });

  it('renders 4 slots for Full Plate (slotCounts.armorSlots=4)', () => {
    renderArmor({ slotCounts: { hp: 6, stress: 6, armorSlots: 4 } });
    expect(slots()).toHaveLength(4);
  });

  it('renders nothing when unarmored (slotCounts.armorSlots=0)', () => {
    renderArmor({ slotCounts: { hp: 6, stress: 6, armorSlots: 0 } });
    expect(screen.queryByRole('region', { name: /^Armor$/ })).toBeNull();
    expect(screen.queryByRole('group', { name: /Armor slots/i })).toBeNull();
  });

  it('clicking an unmarked slot marks it; no other slot changes', () => {
    renderArmor({ slotCounts: { hp: 6, stress: 6, armorSlots: 3 } });
    fireEvent.click(slots()[0]);
    expect(slots()[0].dataset.state).toBe('marked');
    expect(slots()[1].dataset.state).toBe('unmarked');
    expect(slots()[2].dataset.state).toBe('unmarked');
  });

  it('clicking a marked slot unmarks it (correction)', () => {
    renderArmor({
      slotCounts: { hp: 6, stress: 6, armorSlots: 3 },
      stats: { hope: 2, hp: [], stress: [], armorSlots: [0, 1] },
    });
    fireEvent.click(slots()[0]);
    expect(slots()[0].dataset.state).toBe('unmarked');
    expect(slots()[1].dataset.state).toBe('marked');
  });
});
