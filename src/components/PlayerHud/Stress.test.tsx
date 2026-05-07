import { describe, expect, it } from 'vitest';
import { fireEvent, render, screen, within } from '@testing-library/react';
import { Stress } from './Stress';
import { CharacterProvider } from '../../character/CharacterProvider';
import { SystemProvider } from '../../systems/SystemProvider';
import { daggerheartSystem } from '../../systems/daggerheart.system';
import { writeCharacterToStorage } from '../../character/storage';
import { makeCharacter } from '../../character/fixtures';
import type { CharacterState } from '../../character/types';

function renderStress(overrides: Partial<CharacterState> = {}) {
  writeCharacterToStorage(makeCharacter(overrides));
  return render(
    <SystemProvider system={daggerheartSystem}>
      <CharacterProvider>
        <Stress />
      </CharacterProvider>
    </SystemProvider>
  );
}

function slots() {
  return within(screen.getByRole('group', { name: /Stress slots/i })).getAllByRole('button');
}

describe('Stress', () => {
  it('renders nothing when no character is loaded', () => {
    const { container } = render(
      <SystemProvider system={daggerheartSystem}>
        <CharacterProvider>
          <Stress />
        </CharacterProvider>
      </SystemProvider>
    );
    expect(container.querySelector('[aria-label="Stress"]')).toBeNull();
  });

  it('renders the default 6 slots, all unmarked', () => {
    renderStress();
    expect(slots()).toHaveLength(6);
    expect(slots().every((s) => s.dataset.state === 'unmarked')).toBe(true);
  });

  it('renders 9 slots when slotCounts.stress=9 (advancement)', () => {
    renderStress({ slotCounts: { hp: 6, stress: 9, armorSlots: 3 } });
    expect(slots()).toHaveLength(9);
  });

  it('clicking an unmarked slot marks it; no other slot changes', () => {
    renderStress();
    fireEvent.click(slots()[0]);
    expect(slots()[0].dataset.state).toBe('marked');
    for (let i = 1; i < 6; i++) {
      expect(slots()[i].dataset.state).toBe('unmarked');
    }
  });

  it('clicking a marked slot unmarks it (correction)', () => {
    renderStress({
      slotCounts: { hp: 6, stress: 6, armorSlots: 3 },
      stats: { hope: 2, hp: [], stress: [0, 1], armorSlots: [] },
    });
    fireEvent.click(slots()[0]);
    expect(slots()[0].dataset.state).toBe('unmarked');
    expect(slots()[1].dataset.state).toBe('marked');
  });
});
