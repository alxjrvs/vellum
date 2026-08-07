import { afterEach, describe, expect, it } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { SceneShell } from './SceneShell';
import { launchStorageKey } from './launchStorage';

afterEach(() => {
  localStorage.clear();
  delete window.obsstudio;
});

interface HarnessProps {
  readonly canLaunch?: boolean;
  readonly defaultLaunched?: boolean;
}

function renderShell({ canLaunch = true, defaultLaunched = false }: HarnessProps = {}) {
  return render(
    <SceneShell
      scene="gm"
      canLaunch={canLaunch}
      defaultLaunched={defaultLaunched}
      renderSetup={({ launch, canLaunch: ready }) => (
        <div>
          <p>setup view</p>
          <button type="button" onClick={launch} disabled={!ready}>
            Launch
          </button>
        </div>
      )}
      renderLive={({ edit }) => (
        <div>
          <p>live view</p>
          <button type="button" onClick={edit}>
            Edit
          </button>
        </div>
      )}
    />
  );
}

describe('SceneShell', () => {
  it('starts on setup when the scene has never been launched', () => {
    renderShell();
    expect(screen.getByText('setup view')).toBeInTheDocument();
  });

  it('launches to the live view and persists it for the scene', () => {
    renderShell();
    fireEvent.click(screen.getByRole('button', { name: 'Launch' }));

    expect(screen.getByText('live view')).toBeInTheDocument();
    expect(localStorage.getItem(launchStorageKey('gm'))).toBe('true');
  });

  it('honours a persisted launch on mount', () => {
    localStorage.setItem(launchStorageKey('gm'), 'true');
    renderShell();
    expect(screen.getByText('live view')).toBeInTheDocument();
  });

  it('honours a persisted false over the default', () => {
    localStorage.setItem(launchStorageKey('gm'), 'false');
    renderShell({ defaultLaunched: true });
    expect(screen.getByText('setup view')).toBeInTheDocument();
  });

  it('falls back to the default when nothing is recorded', () => {
    renderShell({ defaultLaunched: true });
    expect(screen.getByText('live view')).toBeInTheDocument();
  });

  it('edit returns to setup without clearing the persisted launch', () => {
    localStorage.setItem(launchStorageKey('gm'), 'true');
    renderShell();

    fireEvent.click(screen.getByRole('button', { name: 'Edit' }));

    expect(screen.getByText('setup view')).toBeInTheDocument();
    expect(localStorage.getItem(launchStorageKey('gm'))).toBe('true');
  });

  it('stays on setup while the scene is not ready, even once launched', () => {
    localStorage.setItem(launchStorageKey('gm'), 'true');
    renderShell({ canLaunch: false });

    expect(screen.getByText('setup view')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Launch' })).toBeDisabled();
  });

  describe('inside the OBS browser source', () => {
    it('skips setup entirely — the source is non-interactive', () => {
      window.obsstudio = { pluginVersion: '2.18.2' };
      renderShell();
      expect(screen.getByText('live view')).toBeInTheDocument();
    });

    it('still respects readiness, so an unconfigured scene cannot render live', () => {
      window.obsstudio = { pluginVersion: '2.18.2' };
      renderShell({ canLaunch: false });
      expect(screen.getByText('setup view')).toBeInTheDocument();
    });

    it('honours an explicit edit — only the launch gate is skipped', () => {
      // Regression: OBS short-circuited the whole gate, so "Edit details" (and
      // the GM's "Setup") set state that could never take effect.
      window.obsstudio = { pluginVersion: '2.18.2' };
      renderShell();

      fireEvent.click(screen.getByRole('button', { name: 'Edit' }));

      expect(screen.getByText('setup view')).toBeInTheDocument();
    });

    it('launching from that edit returns to the live scene', () => {
      window.obsstudio = { pluginVersion: '2.18.2' };
      renderShell();

      fireEvent.click(screen.getByRole('button', { name: 'Edit' }));
      fireEvent.click(screen.getByRole('button', { name: 'Launch' }));

      expect(screen.getByText('live view')).toBeInTheDocument();
    });
  });
});
