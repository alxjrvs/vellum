import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { PlayerHud } from './PlayerHud';
import { CharacterProvider } from '../../character/CharacterProvider';
import { SystemProvider } from '../../systems/SystemProvider';
import { daggerheartSystem } from '../../systems/daggerheart.system';
import { writeCharacterToStorage } from '../../character/storage';
import { makeCharacter } from '../../character/fixtures';

function renderHud() {
  writeCharacterToStorage(makeCharacter());
  return render(
    <SystemProvider system={daggerheartSystem}>
      <CharacterProvider>
        <PlayerHud />
      </CharacterProvider>
    </SystemProvider>
  );
}

describe('PlayerHud', () => {
  it('renders the identity label, all four core stat tracks, and the conditions toggle inside a player-hud card frame', () => {
    const { container } = renderHud();
    const card = container.querySelector('.player-hud');
    expect(card).not.toBeNull();
    expect(card).toHaveAttribute('aria-label', 'Player HUD');
    expect(screen.getByLabelText('Character identity')).toBeInTheDocument();
    expect(screen.getByLabelText(/^Hope$/)).toBeInTheDocument();
    expect(screen.getByLabelText(/^HP$/)).toBeInTheDocument();
    expect(screen.getByLabelText(/^Stress$/)).toBeInTheDocument();
    expect(screen.getByLabelText(/^Armor$/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /^Conditions/ })).toBeInTheDocument();
  });

  it('renders nothing when no character is loaded', () => {
    const { container } = render(
      <SystemProvider system={daggerheartSystem}>
        <CharacterProvider>
          <PlayerHud />
        </CharacterProvider>
      </SystemProvider>
    );
    expect(container.querySelector('.player-hud')).toBeNull();
  });
});
