import { afterEach, describe, expect, it } from 'vitest';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { publishCommand } from '../commands/commandBus';
import { FramePicker } from '../components/FramePicker';
import { SystemProvider } from '../systems/SystemProvider';
import { daggerheartSystem } from '../systems/daggerheart.system';
import { validateFrame } from '../themes/frameRules';
import { FrameProvider } from './FrameProvider';
import { FRAME_STORAGE_KEY } from './frameStorage';
import { FRAME_LIBRARY } from './library';
import { useFrame } from './useFrame';

function ActiveFrame() {
  return <output aria-label="active frame">{useFrame().frame.id}</output>;
}

function renderFrames() {
  return render(
    <SystemProvider system={daggerheartSystem}>
      <FrameProvider>
        <ActiveFrame />
        <FramePicker />
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

  it.each(FRAME_LIBRARY.map((f) => [f.id, f] as const))('%s passes the frame rules', (_, f) => {
    expect(validateFrame(f)).toEqual([]);
  });
});

describe('FrameProvider', () => {
  it("defaults to the system's first official frame", () => {
    renderFrames();
    expect(active()).toBe('daggerheart');
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
    window.history.replaceState({}, '', '/?frame=daggerheart-ledger#/daggerheart/player');
    renderFrames();
    expect(active()).toBe('daggerheart-ledger');
  });

  it('ignores an unknown frame id', () => {
    window.history.replaceState({}, '', '/?frame=nope');
    renderFrames();
    expect(active()).toBe('daggerheart');
    act(() => publishCommand({ type: 'frame.set', frame: 'nope' }));
    expect(active()).toBe('daggerheart');
  });

  it('switches frames on frame.set and frame.cycle commands', () => {
    renderFrames();
    act(() => publishCommand({ type: 'frame.set', frame: 'daggerheart-ledger' }));
    expect(active()).toBe('daggerheart-ledger');
    act(() => publishCommand({ type: 'frame.cycle', delta: 1 }));
    expect(active()).toBe('daggerheart');
    act(() => publishCommand({ type: 'frame.cycle', delta: -1 }));
    expect(active()).toBe('daggerheart-ledger');
    expect(localStorage.getItem(FRAME_STORAGE_KEY)).toBe('daggerheart-ledger');
  });
});
