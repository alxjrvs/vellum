import { describe, expect, it } from 'vitest';
import { fireEvent, render, screen, within } from '@testing-library/react';
import { Hope } from './Hope';
import { CharacterProvider } from '../../character/CharacterProvider';
import { SystemProvider } from '../../systems/SystemProvider';
import { daggerheartSystem } from '../../systems/daggerheart.system';
import { writeCharacterToStorage } from '../../character/storage';
import { makeCharacter } from '../../character/fixtures';

function renderHope(hope: number) {
  writeCharacterToStorage(makeCharacter({ stats: { hope, hp: [], stress: [], armorSlots: [] } }));
  return render(
    <SystemProvider system={daggerheartSystem}>
      <CharacterProvider>
        <Hope />
      </CharacterProvider>
    </SystemProvider>
  );
}

function pips() {
  return within(screen.getByRole('group', { name: /Hope pips/i })).getAllByRole('button');
}

describe('Hope', () => {
  it('renders nothing when no character is loaded', () => {
    const { container } = render(
      <SystemProvider system={daggerheartSystem}>
        <CharacterProvider>
          <Hope />
        </CharacterProvider>
      </SystemProvider>
    );
    expect(container.querySelector('[aria-label="Hope"]')).toBeNull();
  });

  it('renders hope value as a 6-pip track from system config', () => {
    renderHope(4);
    expect(pips()).toHaveLength(6);
    expect(pips().filter((p) => p.dataset.state === 'filled')).toHaveLength(4);
  });

  it('clicking the next empty pip increments hope (filled count goes from 4 to 5)', () => {
    renderHope(4);
    fireEvent.click(pips()[4]);
    expect(pips().filter((p) => p.dataset.state === 'filled')).toHaveLength(5);
  });

  it('clicking a filled pip decrements hope', () => {
    renderHope(4);
    fireEvent.click(pips()[3]);
    expect(pips().filter((p) => p.dataset.state === 'filled')).toHaveLength(3);
  });

  it('cannot exceed system max even after many empty-pip clicks', () => {
    renderHope(5);
    fireEvent.click(pips()[5]);
    expect(pips().filter((p) => p.dataset.state === 'filled')).toHaveLength(6);
    // At max, no empty pips remain to click — clicking a filled pip decrements
    fireEvent.click(pips()[0]);
    expect(pips().filter((p) => p.dataset.state === 'filled')).toHaveLength(5);
  });

  it('cannot decrement below 0', () => {
    renderHope(0);
    expect(pips().filter((p) => p.dataset.state === 'filled')).toHaveLength(0);
    fireEvent.click(pips()[0]);
    expect(pips().filter((p) => p.dataset.state === 'filled')).toHaveLength(1);
  });
});
