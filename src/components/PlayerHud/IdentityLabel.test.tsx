import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { IdentityLabel } from './IdentityLabel';
import { CharacterProvider } from '../../character/CharacterProvider';
import { SystemProvider } from '../../systems/SystemProvider';
import { daggerheartSystem } from '../../systems/daggerheart.system';
import { writeCharacterToStorage } from '../../character/storage';
import { makeCharacter } from '../../character/fixtures';
import type { CharacterState } from '../../character/types';

function renderLabel(overrides: Partial<CharacterState> = {}) {
  writeCharacterToStorage(makeCharacter(overrides));
  return render(
    <SystemProvider system={daggerheartSystem}>
      <CharacterProvider>
        <IdentityLabel />
      </CharacterProvider>
    </SystemProvider>
  );
}

describe('IdentityLabel', () => {
  it('renders nothing when no character is loaded', () => {
    const { container } = render(
      <SystemProvider system={daggerheartSystem}>
        <CharacterProvider>
          <IdentityLabel />
        </CharacterProvider>
      </SystemProvider>
    );
    expect(container.querySelector('[aria-label="Character identity"]')).toBeNull();
  });

  it('renders "Name — Class, Ancestry" from the identity fields', () => {
    renderLabel({ identity: { name: 'Seraphine', class: 'Bard', ancestry: 'Elf' } });
    const label = screen.getByLabelText('Character identity');
    expect(label.textContent).toBe('Seraphine — Bard, Elf');
  });

  it('reflects different identity values without hardcoding', () => {
    renderLabel({ identity: { name: 'Brakkar', class: 'Guardian', ancestry: 'Goblin' } });
    expect(screen.getByLabelText('Character identity').textContent).toBe(
      'Brakkar — Guardian, Goblin'
    );
  });
});
