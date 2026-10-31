import { afterEach, describe, expect, it } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import { CharacterProvider } from '../../character/CharacterProvider';
import { FrameProvider } from '../../frames/FrameProvider';
import { SystemProvider } from '../../systems/SystemProvider';
import { daggerheartSystem } from '../../systems/daggerheart.system';
import { FrameInfo } from './FrameInfo';

function renderInfo() {
  return render(
    <SystemProvider system={daggerheartSystem}>
      <FrameProvider>
        <CharacterProvider>
          <FrameInfo />
        </CharacterProvider>
      </FrameProvider>
    </SystemProvider>
  );
}

afterEach(() => {
  localStorage.clear();
  window.history.replaceState({}, '', '/');
  document.documentElement.removeAttribute('style');
});

describe('FrameInfo', () => {
  it("details the worn player frame's stats and widgets", () => {
    renderInfo();
    const info = screen.getByRole('region', { name: 'This frame' });
    expect(info).toHaveTextContent('Player HUD');
    expect(info).toHaveTextContent('Official');
    const terms = within(info)
      .getAllByRole('term')
      .map((t) => t.textContent);
    expect(terms).toEqual(['HP', 'Hope', 'Stress', 'Armor', 'Shows']);
    expect(within(info).getByText('Stats, Conditions, Dice, Nameplate')).toBeInTheDocument();
  });

  it('shows only Fear for a GM frame', () => {
    window.history.replaceState({}, '', '/?frame=daggerheart-gm');
    renderInfo();
    const info = screen.getByRole('region', { name: 'This frame' });
    expect(info).toHaveTextContent('GM screen');
    const terms = within(info)
      .getAllByRole('term')
      .map((t) => t.textContent);
    expect(terms).toEqual(['Fear', 'Shows']);
    expect(within(info).getByText('Fear, Dice')).toBeInTheDocument();
  });
});
