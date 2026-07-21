import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { SetupWizard } from './SetupWizard';
import { CharacterProvider } from '../../character/CharacterProvider';
import { STORAGE_KEY } from '../../character/storage';
import { makeCharacter } from '../../character/fixtures';
import { ONBOARDED_STORAGE_KEY } from './storage';

function renderWizard() {
  return render(
    <CharacterProvider>
      <SetupWizard />
    </CharacterProvider>
  );
}

function seedCharacter() {
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(makeCharacter({ identity: { name: 'Mara', class: 'Rogue', ancestry: 'Human' } }))
  );
}

let writeText: ReturnType<typeof vi.fn>;

beforeEach(() => {
  writeText = vi.fn().mockResolvedValue(undefined);
  Object.defineProperty(navigator, 'clipboard', {
    configurable: true,
    value: { writeText },
  });
});

afterEach(() => {
  delete (window as { obsstudio?: unknown }).obsstudio;
  vi.restoreAllMocks();
});

describe('SetupWizard', () => {
  it('opens by default in a normal tab and guides the paste-and-play path', () => {
    renderWizard();

    expect(screen.getByRole('dialog', { name: /vellum setup/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /copy share link/i })).toBeInTheDocument();
    // No character yet — copy is gated until one exists.
    expect(screen.getByRole('button', { name: /copy share link/i })).toBeDisabled();
    expect(screen.getByText(/nothing is uploaded/i)).toBeInTheDocument();
  });

  it('copies a share link built from the persisted character', async () => {
    seedCharacter();
    renderWizard();

    const button = screen.getByRole('button', { name: /copy share link/i });
    expect(button).toBeEnabled();
    fireEvent.click(button);

    expect(writeText).toHaveBeenCalledOnce();
    expect(writeText.mock.calls[0][0]).toContain('?c=');
    // Must address the player scene: pasted into a non-interactive OBS browser
    // source, a hash-less link would strand the user on the scene selector.
    expect(writeText.mock.calls[0][0]).toContain('#/daggerheart/player');
    await waitFor(() =>
      expect(screen.getByRole('button', { name: /share link copied/i })).toBeInTheDocument()
    );
  });

  it('guides only the un-scriptable steps and a self-test when inside OBS', () => {
    (window as { obsstudio?: unknown }).obsstudio = {};
    renderWizard();

    expect(screen.getByText(/click one hp pip/i)).toBeInTheDocument();
    // The paste-and-play copy action is not part of the in-OBS flow.
    expect(screen.queryByRole('button', { name: /copy share link/i })).not.toBeInTheDocument();
  });

  it('persists onboarding on self-test confirm and stays reopenable', () => {
    (window as { obsstudio?: unknown }).obsstudio = {};
    renderWizard();

    fireEvent.click(screen.getByRole('button', { name: /confirm/i }));

    expect(localStorage.getItem(ONBOARDED_STORAGE_KEY)).toBe('true');
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();

    // The always-available affordance reopens it.
    fireEvent.click(screen.getByRole('button', { name: /setup help/i }));
    expect(screen.getByRole('dialog', { name: /vellum setup/i })).toBeInTheDocument();
  });

  it('does not reappear once onboarded, offering only the reopen affordance', () => {
    localStorage.setItem(ONBOARDED_STORAGE_KEY, 'true');
    renderWizard();

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: /setup help/i })).toBeInTheDocument();
  });

  it('persists onboarding when dismissed via the close control', () => {
    renderWizard();

    fireEvent.click(screen.getByRole('button', { name: /dismiss setup/i }));

    expect(localStorage.getItem(ONBOARDED_STORAGE_KEY)).toBe('true');
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });
});
