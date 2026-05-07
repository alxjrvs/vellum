import { describe, expect, it } from 'vitest';
import { fireEvent, render, screen, within } from '@testing-library/react';
import { Fear } from './Fear';
import { CharacterProvider } from '../../character/CharacterProvider';
import { SystemProvider } from '../../systems/SystemProvider';
import { daggerheartSystem } from '../../systems/daggerheart.system';
import { writeCharacterToStorage } from '../../character/storage';
import { makeCharacter } from '../../character/fixtures';

function renderFear(fear: number) {
  writeCharacterToStorage(
    makeCharacter({ stats: { hope: 0, fear, hp: [], stress: [], armorSlots: [] } })
  );
  return render(
    <SystemProvider system={daggerheartSystem}>
      <CharacterProvider>
        <Fear />
      </CharacterProvider>
    </SystemProvider>
  );
}

function pips() {
  return within(screen.getByRole('group', { name: /Fear pips/i })).getAllByRole('button');
}

describe('Fear', () => {
  it('renders nothing when no character is loaded', () => {
    const { container } = render(
      <SystemProvider system={daggerheartSystem}>
        <CharacterProvider>
          <Fear />
        </CharacterProvider>
      </SystemProvider>
    );
    expect(container.querySelector('[aria-label="Fear"]')).toBeNull();
  });

  it('renders fear value as a 12-pip track from system config', () => {
    renderFear(7);
    expect(pips()).toHaveLength(12);
    expect(pips().filter((p) => p.dataset.state === 'filled')).toHaveLength(7);
  });

  it('clicking the next unfilled pip increments fear (7 → 8)', () => {
    renderFear(7);
    fireEvent.click(pips()[7]);
    expect(pips().filter((p) => p.dataset.state === 'filled')).toHaveLength(8);
  });

  it('clicking a filled pip decrements fear', () => {
    renderFear(7);
    fireEvent.click(pips()[6]);
    expect(pips().filter((p) => p.dataset.state === 'filled')).toHaveLength(6);
  });

  it('cannot exceed system max of 12', () => {
    renderFear(12);
    fireEvent.click(pips()[0]);
    expect(pips().filter((p) => p.dataset.state === 'filled')).toHaveLength(11);
  });

  it('cannot decrement below 0 — clicking unfilled pip increments instead', () => {
    renderFear(0);
    expect(pips().filter((p) => p.dataset.state === 'filled')).toHaveLength(0);
    fireEvent.click(pips()[0]);
    expect(pips().filter((p) => p.dataset.state === 'filled')).toHaveLength(1);
  });
});
