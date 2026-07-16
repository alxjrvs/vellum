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

function hearts() {
  return within(screen.getByRole('group', { name: /HP hearts/i })).getAllByRole('button');
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

  it('renders 6 hearts for a Bard (slotCounts.hp=6), all full', () => {
    renderHP({ slotCounts: { hp: 6, stress: 6, armorSlots: 3 } });
    expect(hearts()).toHaveLength(6);
    expect(hearts().every((h) => h.dataset.state === 'full')).toBe(true);
    expect(hearts().every((h) => h.classList.contains('stat-track__heart'))).toBe(true);
  });

  it('renders 7 hearts for a Guardian-class character (slotCounts.hp=7)', () => {
    renderHP({ slotCounts: { hp: 7, stress: 6, armorSlots: 3 } });
    expect(hearts()).toHaveLength(7);
  });

  it('clicking the first full heart empties it (damage); no other heart changes', () => {
    renderHP({ slotCounts: { hp: 6, stress: 6, armorSlots: 3 } });
    fireEvent.click(hearts()[0]);
    expect(hearts()[0].dataset.state).toBe('empty');
    for (let i = 1; i < 6; i++) {
      expect(hearts()[i].dataset.state).toBe('full');
    }
  });

  it('clicking the topmost damaged heart heals it (level step-down), leaving lower damage intact', () => {
    renderHP({
      slotCounts: { hp: 6, stress: 6, armorSlots: 3 },
      stats: { hope: 2, hp: [0, 1], stress: [], armorSlots: [] },
    });
    // Two damaged hearts (indices 0,1). Clicking the current top (index 1) steps the
    // damage count down to 1 → heart 1 heals, heart 0 stays damaged.
    fireEvent.click(hearts()[1]);
    expect(hearts()[0].dataset.state).toBe('empty');
    expect(hearts()[1].dataset.state).toBe('full');
  });

  it('clicking a healthy heart applies damage cumulatively up to that heart', () => {
    renderHP({
      slotCounts: { hp: 6, stress: 6, armorSlots: 3 },
      stats: { hope: 2, hp: [], stress: [], armorSlots: [] },
    });
    // No damage yet; clicking the 3rd heart (index 2) damages hearts 1–3.
    fireEvent.click(hearts()[2]);
    for (let i = 0; i < 3; i++) {
      expect(hearts()[i].dataset.state).toBe('empty');
    }
    for (let i = 3; i < 6; i++) {
      expect(hearts()[i].dataset.state).toBe('full');
    }
  });

  it('renders Major/Severe markers at the configured threshold positions (Gambeson L1)', () => {
    renderHP({
      slotCounts: { hp: 6, stress: 6, armorSlots: 3 },
      thresholds: { major: 2, severe: 3 },
    });
    const all = hearts();
    expect(all[0].dataset.threshold).toBeUndefined();
    expect(all[1].dataset.threshold).toBe('major');
    expect(all[2].dataset.threshold).toBe('severe');
    expect(all[3].dataset.threshold).toBeUndefined();
  });

  it('renders Major at heart 1 and Severe at heart 2 for an unarmored L1 character', () => {
    renderHP({
      slotCounts: { hp: 6, stress: 6, armorSlots: 3 },
      thresholds: { major: 1, severe: 2 },
    });
    const all = hearts();
    expect(all[0].dataset.threshold).toBe('major');
    expect(all[1].dataset.threshold).toBe('severe');
  });

  it('renders no threshold markers when thresholds are not set on the character', () => {
    renderHP({ slotCounts: { hp: 6, stress: 6, armorSlots: 3 } });
    expect(hearts().every((h) => h.dataset.threshold === undefined)).toBe(true);
  });

  it('clicking a heart at a threshold position toggles the heart — visual marker only, no special handling', () => {
    renderHP({
      slotCounts: { hp: 6, stress: 6, armorSlots: 3 },
      thresholds: { major: 2, severe: 3 },
    });
    fireEvent.click(hearts()[1]);
    expect(hearts()[1].dataset.state).toBe('empty');
    expect(hearts()[1].dataset.threshold).toBe('major');
  });
});
