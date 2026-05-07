import { describe, expect, it } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { ConditionsPanel } from './ConditionsPanel';
import { CharacterProvider } from '../../character/CharacterProvider';
import { SystemProvider } from '../../systems/SystemProvider';
import { daggerheartSystem } from '../../systems/daggerheart.system';
import { writeCharacterToStorage } from '../../character/storage';
import { makeCharacter } from '../../character/fixtures';
import type { CharacterState } from '../../character/types';

function renderPanel(overrides: Partial<CharacterState> = {}) {
  writeCharacterToStorage(makeCharacter(overrides));
  return render(
    <SystemProvider system={daggerheartSystem}>
      <CharacterProvider>
        <ConditionsPanel />
      </CharacterProvider>
    </SystemProvider>
  );
}

function badge(label: string) {
  return screen.getByRole('button', { name: new RegExp(`^${label}\\b`, 'i') });
}

function toggle() {
  return screen.getByRole('button', { name: /^conditions$/i });
}

describe('ConditionsPanel', () => {
  it('renders nothing when no character is loaded', () => {
    const { container } = render(
      <SystemProvider system={daggerheartSystem}>
        <CharacterProvider>
          <ConditionsPanel />
        </CharacterProvider>
      </SystemProvider>
    );
    expect(container.querySelector('[aria-label="Conditions panel"]')).toBeNull();
  });

  it('panel is closed by default — badges are not rendered', () => {
    renderPanel({ featureConditions: ['On Fire'] });
    expect(toggle().getAttribute('aria-expanded')).toBe('false');
    expect(screen.queryByRole('button', { name: /^Hidden\b/i })).toBeNull();
    expect(screen.queryByRole('button', { name: /^On Fire\b/i })).toBeNull();
  });

  it('clicking the toggle opens the panel and reveals core + feature badges', () => {
    renderPanel({ featureConditions: ['On Fire', 'Stunned'] });
    fireEvent.click(toggle());
    expect(toggle().getAttribute('aria-expanded')).toBe('true');
    expect(badge('Hidden')).toBeTruthy();
    expect(badge('Restrained')).toBeTruthy();
    expect(badge('Vulnerable')).toBeTruthy();
    expect(badge('On Fire')).toBeTruthy();
    expect(badge('Stunned')).toBeTruthy();
  });

  it('with zero feature conditions, only the three core badges render when open', () => {
    renderPanel({ featureConditions: [] });
    fireEvent.click(toggle());
    const badges = screen.getAllByRole('button').filter((el) => el !== toggle());
    expect(badges).toHaveLength(3);
  });

  it('toggling a core condition flips its active state', () => {
    renderPanel();
    fireEvent.click(toggle());
    expect(badge('Hidden').dataset.state).toBe('inactive');
    fireEvent.click(badge('Hidden'));
    expect(badge('Hidden').dataset.state).toBe('active');
    expect(badge('Hidden').getAttribute('aria-pressed')).toBe('true');
  });

  it('toggling a feature condition flips its active state', () => {
    renderPanel({ featureConditions: ['On Fire'] });
    fireEvent.click(toggle());
    expect(badge('On Fire').dataset.state).toBe('inactive');
    fireEvent.click(badge('On Fire'));
    expect(badge('On Fire').dataset.state).toBe('active');
    expect(badge('On Fire').getAttribute('aria-pressed')).toBe('true');
  });

  it('reflects pre-existing active feature conditions when opened', () => {
    renderPanel({
      featureConditions: ['On Fire'],
      conditions: {
        core: { hidden: false, restrained: false, vulnerable: false },
        feature: { 'On Fire': true },
      },
    });
    fireEvent.click(toggle());
    expect(badge('On Fire').dataset.state).toBe('active');
  });
});
