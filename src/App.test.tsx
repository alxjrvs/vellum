import { afterEach, describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { App } from './App';
import { CharacterProvider } from './character/CharacterProvider';
import { STORAGE_KEY } from './character/storage';
import { makeCharacter } from './character/fixtures';
import { SystemProvider } from './systems/SystemProvider';
import { daggerheartSystem } from './systems/daggerheart.system';
import { ThemeProvider } from './themes/ThemeProvider';
import { daggerheartTheme } from './themes/daggerheart.theme';

function renderApp() {
  return render(
    <SystemProvider system={daggerheartSystem}>
      <ThemeProvider theme={daggerheartTheme}>
        <CharacterProvider>
          <App />
        </CharacterProvider>
      </ThemeProvider>
    </SystemProvider>
  );
}

afterEach(() => {
  localStorage.clear();
  window.history.replaceState({}, '', '/');
});

describe('App', () => {
  it('renders the Vellum heading', () => {
    renderApp();
    expect(screen.getByRole('heading', { name: /vellum/i })).toBeInTheDocument();
  });

  it('reads system + theme labels from context (no hardcoded strings)', () => {
    renderApp();
    expect(screen.getByText(/Daggerheart · Theme: Daggerheart/i)).toBeInTheDocument();
  });

  it('shows an import prompt when no character is loaded', () => {
    renderApp();
    expect(screen.getByText(/import a character to begin/i)).toBeInTheDocument();
  });

  it('shows the loaded character identity when localStorage has one', () => {
    const character = makeCharacter({
      identity: { name: 'Seraphine', class: 'Bard', ancestry: 'Elf' },
    });
    localStorage.setItem(STORAGE_KEY, JSON.stringify(character));

    renderApp();

    expect(screen.getByLabelText('Character identity').textContent).toBe('Seraphine — Bard, Elf');
  });

  describe('?mode=gm', () => {
    it('renders the GM HUD with only the Fear track and no player tracks', () => {
      const character = makeCharacter({
        stats: { hope: 0, fear: 5, hp: [], stress: [], armorSlots: [] },
      });
      localStorage.setItem(STORAGE_KEY, JSON.stringify(character));
      window.history.replaceState({}, '', '/?mode=gm');

      renderApp();

      expect(screen.getByLabelText('GM HUD')).toBeInTheDocument();
      expect(screen.getByLabelText('Fear')).toBeInTheDocument();
      expect(screen.queryByLabelText('Hope')).toBeNull();
      expect(screen.queryByLabelText('HP')).toBeNull();
      expect(screen.queryByLabelText('Stress')).toBeNull();
      expect(screen.queryByLabelText('Armor')).toBeNull();
      expect(screen.queryByLabelText('Conditions panel')).toBeNull();
      expect(screen.queryByLabelText('Character identity')).toBeNull();
    });
  });
});
