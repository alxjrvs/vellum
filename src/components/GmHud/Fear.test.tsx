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

function filledPips() {
  return pips().filter((p) => p.dataset.state === 'filled');
}

function increaseButton() {
  return screen.getByRole('button', { name: 'Increase Fear' });
}

function decreaseButton() {
  return screen.getByRole('button', { name: 'Decrease Fear' });
}

function currentValue() {
  return screen.getByLabelText('Current Fear');
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
    expect(container.querySelector('[aria-label="Fear pool"]')).toBeNull();
    expect(container.querySelector('[aria-label="Fear"]')).toBeNull();
  });

  it('renders fear value as a 12-pip dial sized from system config', () => {
    renderFear(7);
    expect(pips()).toHaveLength(daggerheartSystem.fear.max);
    expect(filledPips()).toHaveLength(7);
    expect(currentValue()).toHaveTextContent('7');
  });

  it('clicking an unfilled pip sets fear cumulatively (7 → 8)', () => {
    renderFear(7);
    fireEvent.click(pips()[7]);
    expect(filledPips()).toHaveLength(8);
    expect(currentValue()).toHaveTextContent('8');
  });

  it('clicking the topmost filled pip steps fear down (7 → 6)', () => {
    renderFear(7);
    fireEvent.click(pips()[6]);
    expect(filledPips()).toHaveLength(6);
    expect(currentValue()).toHaveTextContent('6');
  });

  it('the Increase button raises fear', () => {
    renderFear(3);
    fireEvent.click(increaseButton());
    expect(filledPips()).toHaveLength(4);
    expect(currentValue()).toHaveTextContent('4');
  });

  it('the Decrease button lowers fear', () => {
    renderFear(3);
    fireEvent.click(decreaseButton());
    expect(filledPips()).toHaveLength(2);
    expect(currentValue()).toHaveTextContent('2');
  });

  it('disables Decrease at 0 and cannot go below 0', () => {
    renderFear(0);
    expect(filledPips()).toHaveLength(0);
    expect(decreaseButton()).toBeDisabled();
    expect(currentValue()).toHaveTextContent('0');
  });

  it('disables Increase at the system max of 12', () => {
    renderFear(12);
    expect(filledPips()).toHaveLength(12);
    expect(increaseButton()).toBeDisabled();
    expect(currentValue()).toHaveTextContent('12');
  });
});
