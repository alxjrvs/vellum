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

function name(): string {
  return (
    screen.getByLabelText('Character identity').querySelector('.identity-label__name')
      ?.textContent ?? ''
  );
}

function detail(): string {
  return (
    screen.getByLabelText('Character identity').querySelector('.identity-label__detail')
      ?.textContent ?? ''
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

  it('renders the name and a "Class · Ancestry" detail from the identity fields', () => {
    renderLabel({ identity: { name: 'Seraphine', class: 'Bard', ancestry: 'Elf' } });
    expect(name()).toBe('Seraphine');
    expect(detail()).toBe('Bard · Elf');
  });

  it('reflects different identity values without hardcoding', () => {
    renderLabel({ identity: { name: 'Brakkar', class: 'Guardian', ancestry: 'Goblin' } });
    expect(name()).toBe('Brakkar');
    expect(detail()).toBe('Guardian · Goblin');
  });

  it('includes level when provided', () => {
    renderLabel({
      identity: { name: 'Seraphine', class: 'Bard', ancestry: 'Elf', level: 3 },
    });
    expect(detail()).toBe('Lvl 3 Bard · Elf');
  });

  it('includes subclass in parentheses when provided', () => {
    renderLabel({
      identity: { name: 'Seraphine', class: 'Bard', ancestry: 'Elf', subclass: 'Troubadour' },
    });
    expect(detail()).toBe('Bard (Troubadour) · Elf');
  });

  it('includes community after ancestry when provided', () => {
    renderLabel({
      identity: { name: 'Seraphine', class: 'Bard', ancestry: 'Elf', community: 'Wildborne' },
    });
    expect(detail()).toBe('Bard · Elf, Wildborne');
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
    expect(name()).toBe('Seraphine');
    expect(detail()).toBe('Lvl 3 Bard (Troubadour) · Elf, Wildborne');
  });

  it('omits absent optional fields without placeholders', () => {
    renderLabel({ identity: { name: 'Seraphine', class: 'Bard', ancestry: 'Elf' } });
    expect(detail()).not.toMatch(/Lvl|\(|undefined|null/);
  });
});
