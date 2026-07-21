import { afterEach, describe, expect, it } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { act } from 'react';
import { App } from './App';
import { CharacterProvider } from './character/CharacterProvider';
import { STORAGE_KEY } from './character/storage';
import { makeCharacter } from './character/fixtures';
import { encodeCharacterToShareParam } from './character/shareCode';
import { launchStorageKey } from './scenes/launchStorage';
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

const PLAYER_URL = '/#/daggerheart/player';

describe('App', () => {
  it('shows the game + role selector on the bare route', () => {
    renderApp();

    expect(screen.getByLabelText('Choose a screen')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /player/i })).toHaveAttribute(
      'href',
      '#/daggerheart/player'
    );
    expect(screen.getByRole('link', { name: /gm/i })).toHaveAttribute('href', '#/daggerheart/gm');
    // The bare route no longer assumes the player HUD.
    expect(screen.queryByRole('heading', { name: /character details/i })).toBeNull();
  });

  it('shows the character setup form when no character is loaded', () => {
    window.history.replaceState({}, '', PLAYER_URL);
    renderApp();
    expect(screen.getByRole('heading', { name: /character details/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/^name/i)).toBeInTheDocument();
  });

  it('shows the loaded character identity in the overlay when localStorage has one', () => {
    const character = makeCharacter({
      identity: { name: 'Seraphine', class: 'Bard', ancestry: 'Elf' },
    });
    localStorage.setItem(STORAGE_KEY, JSON.stringify(character));
    window.history.replaceState({}, '', PLAYER_URL);

    renderApp();

    const identity = screen.getByLabelText('Character identity');
    expect(identity.querySelector('.identity-label__name')).toHaveTextContent('Seraphine');
    expect(identity.querySelector('.identity-label__detail')).toHaveTextContent('Bard · Elf');
    // The setup form is not shown while the overlay is active.
    expect(screen.queryByRole('heading', { name: /character details/i })).toBeNull();
  });

  it('reopens the setup form from the overlay via Edit details', () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(makeCharacter()));
    window.history.replaceState({}, '', PLAYER_URL);
    renderApp();

    fireEvent.click(screen.getByRole('button', { name: /edit details/i }));

    expect(screen.getByRole('heading', { name: /character details/i })).toBeInTheDocument();
  });

  describe.each([
    ['hash route #/daggerheart/gm', '/#/daggerheart/gm'],
    ['legacy ?mode=gm', '/?mode=gm'],
  ])('GM scene via %s', (_label, url) => {
    it('renders the GM HUD with only the Fear track and no player tracks', () => {
      const character = makeCharacter({
        stats: { hope: 0, fear: 5, hp: [], stress: [], armorSlots: [] },
      });
      localStorage.setItem(STORAGE_KEY, JSON.stringify(character));
      localStorage.setItem(launchStorageKey('gm'), 'true');
      window.history.replaceState({}, '', url);

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

  it('renders the Player HUD for a hash-less ?c= share link', () => {
    // Regression: share links generated before scene hashes existed carry no
    // hash, and would otherwise land on the selector — unrecoverable in a
    // non-interactive OBS browser source.
    const character = makeCharacter({
      identity: { name: 'Wren', class: 'Ranger', ancestry: 'Human' },
    });
    window.history.replaceState({}, '', `/?c=${encodeCharacterToShareParam(character)}`);

    renderApp();

    expect(screen.getByLabelText('Character identity')).toBeInTheDocument();
    expect(screen.queryByLabelText('Choose a screen')).toBeNull();
    expect(window.location.hash).toBe('#/daggerheart/player');
  });

  describe('GM scene setup → launch', () => {
    it('opens on the GM how-to rather than the live screen', () => {
      window.history.replaceState({}, '', '/#/daggerheart/gm');

      renderApp();

      expect(screen.getByLabelText('GM screen setup')).toBeInTheDocument();
      expect(screen.queryByLabelText('GM HUD')).toBeNull();
    });

    it('launches to the live screen and persists the launch', () => {
      window.history.replaceState({}, '', '/#/daggerheart/gm');
      renderApp();

      fireEvent.click(screen.getByRole('button', { name: /launch gm screen/i }));

      expect(screen.getByLabelText('GM HUD')).toBeInTheDocument();
      expect(screen.queryByLabelText('GM screen setup')).toBeNull();
      expect(localStorage.getItem(launchStorageKey('gm'))).toBe('true');
    });

    it('returns to setup via the Setup button without un-launching', () => {
      localStorage.setItem(launchStorageKey('gm'), 'true');
      window.history.replaceState({}, '', '/#/daggerheart/gm');
      renderApp();

      fireEvent.click(screen.getByRole('button', { name: /^setup$/i }));

      expect(screen.getByLabelText('GM screen setup')).toBeInTheDocument();
      expect(localStorage.getItem(launchStorageKey('gm'))).toBe('true');
    });

    it('does not leak the launch across scenes on a fresh mount', () => {
      localStorage.setItem(launchStorageKey('gm'), 'true');
      window.history.replaceState({}, '', '/#/daggerheart/player');

      renderApp();

      // No character, so the player scene is still in setup regardless of GM.
      expect(screen.getByRole('heading', { name: /character details/i })).toBeInTheDocument();
    });

    it('does not leak launch state when switching scenes in place', () => {
      // Both branches render a SceneShell in the same position, so without a
      // per-scene key React reuses the instance and the launched player scene
      // would carry its launch into GM — skipping the how-to for a URL that
      // shows it again on the next reload.
      localStorage.setItem(STORAGE_KEY, JSON.stringify(makeCharacter()));
      window.history.replaceState({}, '', '/#/daggerheart/player');
      renderApp();
      expect(screen.getByLabelText('Character identity')).toBeInTheDocument();

      act(() => {
        window.history.replaceState({}, '', '/#/daggerheart/gm');
        window.dispatchEvent(new HashChangeEvent('hashchange'));
      });

      expect(screen.getByLabelText('GM screen setup')).toBeInTheDocument();
      expect(screen.queryByLabelText('GM HUD')).toBeNull();
    });

    it('does not leak the editing state back to a launched player scene', () => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(makeCharacter()));
      localStorage.setItem(launchStorageKey('gm'), 'true');
      window.history.replaceState({}, '', '/#/daggerheart/gm');
      renderApp();

      fireEvent.click(screen.getByRole('button', { name: /^setup$/i }));
      expect(screen.getByLabelText('GM screen setup')).toBeInTheDocument();

      act(() => {
        window.history.replaceState({}, '', '/#/daggerheart/player');
        window.dispatchEvent(new HashChangeEvent('hashchange'));
      });

      // The player scene is launched and has a character — editing must not bleed.
      expect(screen.getByLabelText('Character identity')).toBeInTheDocument();
      expect(screen.queryByRole('heading', { name: /character details/i })).toBeNull();
    });
  });

  it('renders the GM Fear track with no character configured at all', () => {
    // Regression: the GM scene used to short-circuit to a blank page because
    // Fear was stored inside the character record a GM never creates.
    localStorage.setItem(launchStorageKey('gm'), 'true');
    window.history.replaceState({}, '', '/#/daggerheart/gm');

    renderApp();

    expect(screen.getByLabelText('GM HUD')).toBeInTheDocument();
    expect(screen.getByLabelText('Fear pool')).toBeInTheDocument();
    expect(screen.getByLabelText('Current Fear')).toHaveTextContent('0');
    expect(screen.queryByRole('heading', { name: /character details/i })).toBeNull();
  });

  it('renders the Player HUD for the hash route #/daggerheart/player', () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(makeCharacter()));
    window.history.replaceState({}, '', '/#/daggerheart/player');

    renderApp();

    expect(screen.getByLabelText('Character identity')).toBeInTheDocument();
    expect(screen.queryByLabelText('GM HUD')).toBeNull();
  });
});
