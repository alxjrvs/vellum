import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { GmSetup } from './GmSetup';
import { SystemProvider } from '../../systems/SystemProvider';
import { daggerheartSystem } from '../../systems/daggerheart.system';

const writeText = vi.fn().mockResolvedValue(undefined);

beforeEach(() => {
  writeText.mockClear();
  Object.defineProperty(navigator, 'clipboard', {
    value: { writeText },
    configurable: true,
  });
});

afterEach(() => {
  window.history.replaceState({}, '', '/');
});

function renderGmSetup(onLaunch = vi.fn()) {
  render(
    <SystemProvider system={daggerheartSystem}>
      <GmSetup onLaunch={onLaunch} />
    </SystemProvider>
  );
  return onLaunch;
}

describe('GmSetup', () => {
  it('explains the screen using the system config rather than hardcoded numbers', () => {
    renderGmSetup();
    expect(
      screen.getByText(new RegExp(`${daggerheartSystem.fear.max}-pip track`))
    ).toBeInTheDocument();
  });

  it('states that nothing needs configuring', () => {
    renderGmSetup();
    expect(screen.getByText(/nothing to configure/i)).toBeInTheDocument();
  });

  it('calls onLaunch when the launch button is pressed', () => {
    const onLaunch = renderGmSetup();
    fireEvent.click(screen.getByRole('button', { name: /launch gm screen/i }));
    expect(onLaunch).toHaveBeenCalledOnce();
  });

  it('copies the GM scene URL, not the bare route', async () => {
    renderGmSetup();

    fireEvent.click(screen.getByRole('button', { name: /copy gm screen link/i }));

    expect(writeText).toHaveBeenCalledOnce();
    expect(writeText.mock.calls[0][0]).toContain('#/daggerheart/gm');
    await waitFor(() =>
      expect(screen.getByRole('button', { name: /link copied/i })).toBeInTheDocument()
    );
  });
});
