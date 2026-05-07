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
});
