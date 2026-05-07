import { describe, expect, it } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { CoreConditions } from './CoreConditions';
import { CharacterProvider } from '../../character/CharacterProvider';
import { SystemProvider } from '../../systems/SystemProvider';
import { daggerheartSystem } from '../../systems/daggerheart.system';
import { writeCharacterToStorage } from '../../character/storage';
import { makeCharacter } from '../../character/fixtures';
import type { CharacterState } from '../../character/types';

function renderConditions(overrides: Partial<CharacterState> = {}) {
  writeCharacterToStorage(makeCharacter(overrides));
  return render(
    <SystemProvider system={daggerheartSystem}>
      <CharacterProvider>
        <CoreConditions />
      </CharacterProvider>
    </SystemProvider>
  );
}

function badge(label: string) {
  return screen.getByRole('button', { name: new RegExp(`^${label}\\b`, 'i') });
}

describe('CoreConditions', () => {
  it('renders nothing when no character is loaded', () => {
    const { container } = render(
      <SystemProvider system={daggerheartSystem}>
        <CharacterProvider>
          <CoreConditions />
        </CharacterProvider>
      </SystemProvider>
    );
    expect(container.querySelector('[aria-label="Core conditions"]')).toBeNull();
  });

  it('renders three inactive badges (Hidden, Restrained, Vulnerable) by default', () => {
    renderConditions();
    expect(badge('Hidden').dataset.state).toBe('inactive');
    expect(badge('Restrained').dataset.state).toBe('inactive');
    expect(badge('Vulnerable').dataset.state).toBe('inactive');
  });

  it('clicking an inactive badge toggles it active', () => {
    renderConditions();
    fireEvent.click(badge('Vulnerable'));
    expect(badge('Vulnerable').dataset.state).toBe('active');
    expect(badge('Hidden').dataset.state).toBe('inactive');
    expect(badge('Restrained').dataset.state).toBe('inactive');
  });

  it('clicking an active badge toggles it inactive', () => {
    renderConditions({
      conditions: {
        core: { hidden: false, restrained: true, vulnerable: false },
        feature: {},
      },
    });
    fireEvent.click(badge('Restrained'));
    expect(badge('Restrained').dataset.state).toBe('inactive');
  });

  it('aria-pressed reflects the active state', () => {
    renderConditions();
    expect(badge('Hidden').getAttribute('aria-pressed')).toBe('false');
    fireEvent.click(badge('Hidden'));
    expect(badge('Hidden').getAttribute('aria-pressed')).toBe('true');
  });
});
