import { describe, expect, it } from 'vitest';
import { fireEvent, render, screen, within } from '@testing-library/react';
import { HP } from './HP';
import { CharacterProvider } from '../../character/CharacterProvider';
import { SystemProvider } from '../../systems/SystemProvider';
import { daggerheartSystem } from '../../systems/daggerheart.system';
import { writeCharacterToStorage } from '../../character/storage';
import { makeCharacter } from '../../character/fixtures';
import type { CharacterState } from '../../character/types';

function renderHP(overrides: Partial<CharacterState> = {}) {
  writeCharacterToStorage(makeCharacter(overrides));
  return render(
    <SystemProvider system={daggerheartSystem}>
      <CharacterProvider>
        <HP />
      </CharacterProvider>
    </SystemProvider>
  );
}

function slots() {
  return within(screen.getByRole('group', { name: /HP slots/i })).getAllByRole('button');
}

describe('HP', () => {
  it('renders nothing when no character is loaded', () => {
    const { container } = render(
      <SystemProvider system={daggerheartSystem}>
        <CharacterProvider>
          <HP />
        </CharacterProvider>
      </SystemProvider>
    );
    expect(container.querySelector('[aria-label="HP"]')).toBeNull();
  });

  it('renders 6 slots for a Bard (slotCounts.hp=6)', () => {
    renderHP({ slotCounts: { hp: 6, stress: 6, armorSlots: 3 } });
    expect(slots()).toHaveLength(6);
    expect(slots().every((s) => s.dataset.state === 'unmarked')).toBe(true);
  });

  it('renders 7 slots for a Guardian-class character (slotCounts.hp=7)', () => {
    renderHP({ slotCounts: { hp: 7, stress: 6, armorSlots: 3 } });
    expect(slots()).toHaveLength(7);
  });

  it('clicking the first unmarked slot marks it; no other slot changes', () => {
    renderHP({ slotCounts: { hp: 6, stress: 6, armorSlots: 3 } });
    fireEvent.click(slots()[0]);
    expect(slots()[0].dataset.state).toBe('marked');
    for (let i = 1; i < 6; i++) {
      expect(slots()[i].dataset.state).toBe('unmarked');
    }
  });

  it('clicking a marked slot unmarks it (correction)', () => {
    renderHP({
      slotCounts: { hp: 6, stress: 6, armorSlots: 3 },
      stats: { hope: 2, hp: [0, 1], stress: [], armorSlots: [] },
    });
    fireEvent.click(slots()[0]);
    expect(slots()[0].dataset.state).toBe('unmarked');
    expect(slots()[1].dataset.state).toBe('marked');
  });
});
