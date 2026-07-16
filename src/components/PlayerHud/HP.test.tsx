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

  it('renders 6 hearts for a Bard (slotCounts.hp=6), all full at no damage', () => {
    renderHP({ slotCounts: { hp: 6, stress: 6, armorSlots: 3 } });
    expect(hearts()).toHaveLength(6);
    expect(hearts().every((h) => h.dataset.state === 'full')).toBe(true);
    expect(hearts().every((h) => h.classList.contains('stat-track__heart'))).toBe(true);
  });

  it('renders 7 hearts for a Guardian-class character (slotCounts.hp=7)', () => {
    renderHP({ slotCounts: { hp: 7, stress: 6, armorSlots: 3 } });
    expect(hearts()).toHaveLength(7);
  });

  it('shows remaining health as full hearts on the left, damage empties from the right', () => {
    // 2 damage of 6 → 4 health: hearts 0–3 full, 4–5 empty.
    renderHP({
      slotCounts: { hp: 6, stress: 6, armorSlots: 3 },
      stats: { hope: 2, hp: [0, 1], stress: [], armorSlots: [] },
    });
    const all = hearts();
    for (let i = 0; i < 4; i++) expect(all[i].dataset.state).toBe('full');
    for (let i = 4; i < 6; i++) expect(all[i].dataset.state).toBe('empty');
  });

  it('depletes from the right: clicking the rightmost full heart takes one damage', () => {
    renderHP({ slotCounts: { hp: 6, stress: 6, armorSlots: 3 } });
    fireEvent.click(hearts()[5]);
    for (let i = 0; i < 5; i++) expect(hearts()[i].dataset.state).toBe('full');
    expect(hearts()[5].dataset.state).toBe('empty');
  });

  it('clicking a heart sets health to it, emptying every heart to its right', () => {
    renderHP({ slotCounts: { hp: 6, stress: 6, armorSlots: 3 } });
    // Full health; clicking the 3rd heart (index 2) sets health to 3.
    fireEvent.click(hearts()[2]);
    for (let i = 0; i < 3; i++) expect(hearts()[i].dataset.state).toBe('full');
    for (let i = 3; i < 6; i++) expect(hearts()[i].dataset.state).toBe('empty');
  });

  it('clicking a depleted heart heals back up to it', () => {
    // 4 damage of 6 → 2 health: hearts 0,1 full; 2–5 empty.
    renderHP({
      slotCounts: { hp: 6, stress: 6, armorSlots: 3 },
      stats: { hope: 2, hp: [0, 1, 2, 3], stress: [], armorSlots: [] },
    });
    fireEvent.click(hearts()[4]); // heal up to the 5th heart → 5 health
    for (let i = 0; i < 5; i++) expect(hearts()[i].dataset.state).toBe('full');
    expect(hearts()[5].dataset.state).toBe('empty');
  });

  it('mirrors damage thresholds to the depleting (right) end — Major before Severe', () => {
    renderHP({
      slotCounts: { hp: 6, stress: 6, armorSlots: 3 },
      thresholds: { major: 2, severe: 3 },
    });
    const all = hearts();
    // Major (2nd point of damage) sits 2 from the right = index 4;
    // Severe (3rd) sits 3 from the right = index 3.
    expect(all[4].dataset.threshold).toBe('major');
    expect(all[3].dataset.threshold).toBe('severe');
    expect(all[0].dataset.threshold).toBeUndefined();
    expect(all[5].dataset.threshold).toBeUndefined();
  });

  it('mirrors Major/Severe to the two rightmost hearts for an unarmored L1 (major 1, severe 2)', () => {
    renderHP({
      slotCounts: { hp: 6, stress: 6, armorSlots: 3 },
      thresholds: { major: 1, severe: 2 },
    });
    const all = hearts();
    expect(all[5].dataset.threshold).toBe('major');
    expect(all[4].dataset.threshold).toBe('severe');
  });

  it('renders no threshold markers when thresholds are not set on the character', () => {
    renderHP({ slotCounts: { hp: 6, stress: 6, armorSlots: 3 } });
    expect(hearts().every((h) => h.dataset.threshold === undefined)).toBe(true);
  });

  it('threshold markers are cosmetic — clicking still follows the level fill', () => {
    renderHP({
      slotCounts: { hp: 6, stress: 6, armorSlots: 3 },
      thresholds: { major: 2, severe: 3 },
    });
    // Major marker sits on index 4; clicking index 3 sets health to 4, emptying
    // index 4 while it keeps its marker.
    fireEvent.click(hearts()[3]);
    expect(hearts()[4].dataset.state).toBe('empty');
    expect(hearts()[4].dataset.threshold).toBe('major');
  });
});
