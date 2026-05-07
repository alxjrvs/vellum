import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { GmHud } from './GmHud';
import { CharacterProvider } from '../../character/CharacterProvider';
import { SystemProvider } from '../../systems/SystemProvider';
import { daggerheartSystem } from '../../systems/daggerheart.system';
import { writeCharacterToStorage } from '../../character/storage';
import { makeCharacter } from '../../character/fixtures';

function renderHud() {
  writeCharacterToStorage(
    makeCharacter({ stats: { hope: 0, fear: 3, hp: [], stress: [], armorSlots: [] } })
  );
  return render(
    <SystemProvider system={daggerheartSystem}>
      <CharacterProvider>
        <GmHud />
      </CharacterProvider>
    </SystemProvider>
  );
}

describe('GmHud', () => {
  it('renders the Fear track inside a labelled GM HUD frame', () => {
    renderHud();
    const hud = screen.getByLabelText('GM HUD');
    expect(hud).toBeInTheDocument();
    expect(hud.querySelector('[aria-label="Fear"]')).not.toBeNull();
  });

  it('does not render any player stat tracks', () => {
    renderHud();
    expect(screen.queryByLabelText('Hope')).toBeNull();
    expect(screen.queryByLabelText('HP')).toBeNull();
    expect(screen.queryByLabelText('Stress')).toBeNull();
    expect(screen.queryByLabelText('Armor')).toBeNull();
    expect(screen.queryByLabelText('Conditions panel')).toBeNull();
  });
});
