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
import { FrameProvider } from './frames/FrameProvider';
import { CameraProvider } from './camera/CameraProvider';
import { publishCommand } from './commands/commandBus';
import { FRAME_STORAGE_KEY } from './frames/frameStorage';

function renderApp() {
  return render(
    <SystemProvider system={daggerheartSystem}>
      <FrameProvider>
        <CameraProvider>
          <CharacterProvider>
            <App />
          </CharacterProvider>
        </CameraProvider>
      </FrameProvider>
    </SystemProvider>
  );
}

afterEach(() => {
  localStorage.clear();
  window.history.replaceState({}, '', '/');
});

const PLAYER_URL = '/frames/daggerheart-player/';
const GM_URL = '/frames/daggerheart-gm/';

describe('App', () => {
  it('opens the first official frame on the bare route, and shows its address', () => {
    renderApp();

    expect(screen.getByRole('heading', { name: /character details/i })).toBeInTheDocument();
    expect(window.location.pathname).toBe(PLAYER_URL);
  });

  it('opens the stored frame on the bare route', () => {
    localStorage.setItem(FRAME_STORAGE_KEY, 'daggerheart-gm');
    renderApp();

    expect(screen.getByLabelText('GM screen setup')).toBeInTheDocument();
    expect(window.location.pathname).toBe(GM_URL);
  });

  it('lets the address win over the stored frame', () => {
    localStorage.setItem(FRAME_STORAGE_KEY, 'daggerheart-ledger');
    window.history.replaceState({}, '', GM_URL);
    renderApp();

    expect(screen.getByLabelText('GM screen setup')).toBeInTheDocument();
    expect(window.location.pathname).toBe(GM_URL);
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
    ['frame path /frames/daggerheart-gm/', GM_URL],
    ['old screen path /daggerheart/gm/', '/daggerheart/gm/'],
    ['old hash #/daggerheart/gm', '/#/daggerheart/gm'],
    ['old ?mode=gm', '/?mode=gm'],
  ])('GM frame via %s', (_label, url) => {
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
      // Old addresses move to the frame's own address.
      expect(window.location.pathname).toBe(GM_URL);
      expect(window.location.hash).toBe('');
      expect(window.location.search).toBe('');
    });
  });

  it('moves an old GM address to the GM frame even when a player frame is stored', () => {
    localStorage.setItem(FRAME_STORAGE_KEY, 'daggerheart-ledger');
    window.history.replaceState({}, '', GM_URL);
    renderApp();

    expect(window.location.pathname).toBe(GM_URL);
  });

  it('moves an old player address to the frame it pinned', () => {
    window.history.replaceState({}, '', '/daggerheart/player/?frame=daggerheart-ledger&cam=1');
    renderApp();

    expect(window.location.pathname).toBe('/frames/daggerheart-ledger/');
    expect(window.location.search).toBe('?cam=1');
  });

  it('moves an old player address to the stored player frame', () => {
    localStorage.setItem(FRAME_STORAGE_KEY, 'daggerheart-ledger');
    window.history.replaceState({}, '', '/daggerheart/player/');
    renderApp();

    expect(window.location.pathname).toBe('/frames/daggerheart-ledger/');
  });

  it('finds the player frame by its old id', () => {
    localStorage.setItem(FRAME_STORAGE_KEY, 'daggerheart-gm');
    window.history.replaceState({}, '', '/frames/daggerheart/');
    renderApp();

    expect(window.location.pathname).toBe(PLAYER_URL);
  });

  it('renders the Player HUD for a ?c= share link to the bare app', () => {
    // Regression: share links generated before frame paths existed name no
    // frame, and must open a player HUD even if a GM frame is stored —
    // anything else is unrecoverable in a non-interactive OBS browser source.
    localStorage.setItem(FRAME_STORAGE_KEY, 'daggerheart-gm');
    const character = makeCharacter({
      identity: { name: 'Wren', class: 'Ranger', ancestry: 'Human' },
    });
    window.history.replaceState({}, '', `/?c=${encodeCharacterToShareParam(character)}`);

    renderApp();

    expect(screen.getByLabelText('Character identity')).toBeInTheDocument();
    expect(window.location.pathname).toBe(PLAYER_URL);
    expect(window.location.search).toBe('');
  });

  describe('GM frame setup → launch', () => {
    it('opens on the GM how-to rather than the live screen', () => {
      window.history.replaceState({}, '', GM_URL);

      renderApp();

      expect(screen.getByLabelText('GM screen setup')).toBeInTheDocument();
      expect(screen.queryByLabelText('GM HUD')).toBeNull();
    });

    it('launches to the live screen and persists the launch', () => {
      window.history.replaceState({}, '', GM_URL);
      renderApp();

      fireEvent.click(screen.getByRole('button', { name: /launch gm screen/i }));

      expect(screen.getByLabelText('GM HUD')).toBeInTheDocument();
      expect(screen.queryByLabelText('GM screen setup')).toBeNull();
      expect(localStorage.getItem(launchStorageKey('gm'))).toBe('true');
    });

    it('returns to setup via the Setup button without un-launching', () => {
      localStorage.setItem(launchStorageKey('gm'), 'true');
      window.history.replaceState({}, '', GM_URL);
      renderApp();

      fireEvent.click(screen.getByRole('button', { name: /^setup$/i }));

      expect(screen.getByLabelText('GM screen setup')).toBeInTheDocument();
      expect(localStorage.getItem(launchStorageKey('gm'))).toBe('true');
    });

    it('does not leak the launch across kinds of frame on a fresh mount', () => {
      localStorage.setItem(launchStorageKey('gm'), 'true');
      window.history.replaceState({}, '', PLAYER_URL);

      renderApp();

      // No character, so the player screen is still in setup regardless of GM.
      expect(screen.getByRole('heading', { name: /character details/i })).toBeInTheDocument();
    });

    it('does not leak launch state when switching to a GM frame in place', () => {
      // Both branches render a SceneShell in the same position, so without a
      // per-kind key React reuses the instance and the launched player screen
      // would carry its launch into GM — skipping the how-to for a URL that
      // shows it again on the next reload.
      localStorage.setItem(STORAGE_KEY, JSON.stringify(makeCharacter()));
      window.history.replaceState({}, '', PLAYER_URL);
      renderApp();
      expect(screen.getByLabelText('Character identity')).toBeInTheDocument();

      act(() => publishCommand({ type: 'frame.set', frame: 'daggerheart-gm' }));

      expect(screen.getByLabelText('GM screen setup')).toBeInTheDocument();
      expect(screen.queryByLabelText('GM HUD')).toBeNull();
      expect(window.location.pathname).toBe(GM_URL);
    });

    it('does not leak the editing state back to a launched player frame', () => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(makeCharacter()));
      localStorage.setItem(launchStorageKey('gm'), 'true');
      window.history.replaceState({}, '', GM_URL);
      renderApp();

      fireEvent.click(screen.getByRole('button', { name: /^setup$/i }));
      expect(screen.getByLabelText('GM screen setup')).toBeInTheDocument();

      act(() => publishCommand({ type: 'frame.set', frame: 'daggerheart-player' }));

      // The player screen is launched and has a character — editing must not bleed.
      expect(screen.getByLabelText('Character identity')).toBeInTheDocument();
      expect(screen.queryByRole('heading', { name: /character details/i })).toBeNull();
    });
  });

  it('renders the GM Fear track with no character configured at all', () => {
    // Regression: the GM scene used to short-circuit to a blank page because
    // Fear was stored inside the character record a GM never creates.
    localStorage.setItem(launchStorageKey('gm'), 'true');
    window.history.replaceState({}, '', GM_URL);

    renderApp();

    expect(screen.getByLabelText('GM HUD')).toBeInTheDocument();
    expect(screen.getByLabelText('Fear pool')).toBeInTheDocument();
    expect(screen.getByLabelText('Current Fear')).toHaveTextContent('0');
    expect(screen.queryByRole('heading', { name: /character details/i })).toBeNull();
  });

  it('renders the Player HUD for the player frame path', () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(makeCharacter()));
    window.history.replaceState({}, '', PLAYER_URL);

    renderApp();

    expect(screen.getByLabelText('Character identity')).toBeInTheDocument();
    expect(screen.queryByLabelText('GM HUD')).toBeNull();
  });
});
