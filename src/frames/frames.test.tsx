import { afterEach, describe, expect, it } from 'vitest';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { publishCommand } from '../commands/commandBus';
import { CharacterProvider } from '../character/CharacterProvider';
import { FramePicker } from '../components/FramePicker';
import { SystemProvider } from '../systems/SystemProvider';
import { daggerheartSystem } from '../systems/daggerheart.system';
import { validateFrame } from '../themes/frameRules';
import { FrameProvider } from './FrameProvider';
import { FRAME_STORAGE_KEY } from './frameStorage';
import { FRAME_LIBRARY } from './library';
import { BUNDLED_FRAME_IDS } from '../routes/paths';
import { useFrame } from './useFrame';

function ActiveFrame() {
  return <output aria-label="active frame">{useFrame().frame.id}</output>;
}

function renderFrames() {
  return render(
    <SystemProvider system={daggerheartSystem}>
      <FrameProvider>
        <CharacterProvider>
          <ActiveFrame />
          <FramePicker />
        </CharacterProvider>
      </FrameProvider>
    </SystemProvider>
  );
}

const active = () => screen.getByLabelText('active frame').textContent;

afterEach(() => {
  localStorage.clear();
  window.history.replaceState({}, '', '/');
  document.documentElement.removeAttribute('style');
});

describe('frame library', () => {
  it('gives every frame a unique id', () => {
    const ids = FRAME_LIBRARY.map((f) => f.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('has a page in the build for every bundled frame', () => {
    expect(BUNDLED_FRAME_IDS).toEqual(FRAME_LIBRARY.map((f) => f.id));
  });

  it('ships a player and a GM frame', () => {
    expect(FRAME_LIBRARY.map((f) => [f.id, f.kind])).toEqual(
      expect.arrayContaining([
        ['daggerheart-player', 'player'],
        ['daggerheart-gm', 'gm'],
      ])
    );
  });

  it.each(FRAME_LIBRARY.map((f) => [f.id, f] as const))('%s passes the frame rules', (_, f) => {
    expect(validateFrame(f)).toEqual([]);
  });
});

describe('FrameProvider', () => {
  it("defaults to the system's first official frame", () => {
    renderFrames();
    expect(active()).toBe('daggerheart-player');
  });

  it('applies the frame to the page as CSS variables', () => {
    renderFrames();
    fireEvent.click(screen.getByRole('radio', { name: /Ledger/ }));
    expect(document.documentElement.style.getPropertyValue('--color-signal')).toBe('#5cc8ff');
  });

  it('remembers a picked frame', () => {
    renderFrames();
    fireEvent.click(screen.getByRole('radio', { name: /Ledger/ }));
    expect(active()).toBe('daggerheart-ledger');
    expect(localStorage.getItem(FRAME_STORAGE_KEY)).toBe('daggerheart-ledger');
    expect(screen.getByRole('radio', { name: /Ledger/ })).toHaveAttribute('aria-checked', 'true');
  });

  it('restores the stored frame', () => {
    localStorage.setItem(FRAME_STORAGE_KEY, 'daggerheart-ledger');
    renderFrames();
    expect(active()).toBe('daggerheart-ledger');
  });

  it('lets ?frame= in the URL win over the stored choice', () => {
    localStorage.setItem(FRAME_STORAGE_KEY, 'daggerheart');
    window.history.replaceState({}, '', '/?frame=daggerheart-ledger');
    renderFrames();
    expect(active()).toBe('daggerheart-ledger');
  });

  it('ignores an unknown frame id', () => {
    window.history.replaceState({}, '', '/?frame=nope');
    renderFrames();
    expect(active()).toBe('daggerheart-player');
    act(() => publishCommand({ type: 'frame.set', frame: 'nope' }));
    expect(active()).toBe('daggerheart-player');
  });

  it('switches frames on frame.set and frame.cycle commands', () => {
    renderFrames();
    act(() => publishCommand({ type: 'frame.set', frame: 'daggerheart-ledger' }));
    expect(active()).toBe('daggerheart-ledger');
    // Cycling skips the GM frame: it restyles the screen, never swaps it.
    act(() => publishCommand({ type: 'frame.cycle', delta: 1 }));
    expect(active()).toBe('daggerheart-player');
    act(() => publishCommand({ type: 'frame.cycle', delta: -1 }));
    expect(active()).toBe('daggerheart-ledger');
    expect(localStorage.getItem(FRAME_STORAGE_KEY)).toBe('daggerheart-ledger');
  });

  it('puts the worn frame in the address', () => {
    renderFrames();
    expect(window.location.pathname).toBe('/frames/daggerheart-player/');
    fireEvent.click(screen.getByRole('radio', { name: /GM/ }));
    expect(window.location.pathname).toBe('/frames/daggerheart-gm/');
  });

  it('keeps every frame action in place, disabling the ones only your own frames have', () => {
    renderFrames();
    const actions = ['Customize', 'Export', 'Delete'].map((name) =>
      screen.getByRole('button', { name })
    );
    expect(actions.map((b) => (b as HTMLButtonElement).disabled)).toEqual([false, true, true]);
    expect(screen.getByLabelText('Import')).toBeInTheDocument();
  });
});
