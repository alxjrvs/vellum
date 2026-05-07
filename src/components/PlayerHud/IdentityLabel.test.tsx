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

  it('includes level when provided', () => {
    renderLabel({
      identity: { name: 'Seraphine', class: 'Bard', ancestry: 'Elf', level: 3 },
    });
    expect(screen.getByLabelText('Character identity').textContent).toBe(
      'Seraphine — Lvl 3 Bard, Elf'
    );
  });

  it('includes subclass in parentheses when provided', () => {
    renderLabel({
      identity: { name: 'Seraphine', class: 'Bard', ancestry: 'Elf', subclass: 'Troubadour' },
    });
    expect(screen.getByLabelText('Character identity').textContent).toBe(
      'Seraphine — Bard (Troubadour), Elf'
    );
  });

  it('includes community after ancestry when provided', () => {
    renderLabel({
      identity: { name: 'Seraphine', class: 'Bard', ancestry: 'Elf', community: 'Wildborne' },
    });
    expect(screen.getByLabelText('Character identity').textContent).toBe(
      'Seraphine — Bard, Elf, Wildborne'
    );
  });

  it('combines all optional fields when present', () => {
    renderLabel({
      identity: {
        name: 'Seraphine',
        class: 'Bard',
        ancestry: 'Elf',
        subclass: 'Troubadour',
        community: 'Wildborne',
        level: 3,
      },
    });
    expect(screen.getByLabelText('Character identity').textContent).toBe(
      'Seraphine — Lvl 3 Bard (Troubadour), Elf, Wildborne'
    );
  });

  it('omits absent optional fields without placeholders', () => {
    renderLabel({ identity: { name: 'Seraphine', class: 'Bard', ancestry: 'Elf' } });
    const text = screen.getByLabelText('Character identity').textContent ?? '';
    expect(text).not.toMatch(/Lvl|\(|undefined|null/);
  });
});
