import { afterEach, describe, expect, it } from 'vitest';
import { renderHook } from '@testing-library/react';
import { act } from 'react';
import { SCENES, sceneHash, useViewMode } from './useViewMode';

afterEach(() => {
  window.history.replaceState({}, '', '/');
});

describe('sceneHash', () => {
  it('builds the canonical namespaced hash for each scene', () => {
    expect(sceneHash('player')).toBe('#/daggerheart/player');
    expect(sceneHash('gm')).toBe('#/daggerheart/gm');
  });
});

describe('useViewMode', () => {
  it('defaults to player when the URL addresses no scene', () => {
    window.history.replaceState({}, '', '/');
    const { result } = renderHook(() => useViewMode());
    expect(result.current).toBe('player');
  });

  it.each(SCENES)('reads the canonical hash `#/daggerheart/%s`', (scene) => {
    window.history.replaceState({}, '', `/${sceneHash(scene)}`);
    const { result } = renderHook(() => useViewMode());
    expect(result.current).toBe(scene);
  });

  it('accepts the bare `#/gm` shorthand', () => {
    window.history.replaceState({}, '', '/#/gm');
    const { result } = renderHook(() => useViewMode());
    expect(result.current).toBe('gm');
  });

  it('falls back to legacy `?mode=gm` when no hash scene is present', () => {
    window.history.replaceState({}, '', '/?mode=gm');
    const { result } = renderHook(() => useViewMode());
    expect(result.current).toBe('gm');
  });

  it('prefers the hash scene over a legacy `?mode=` query', () => {
    window.history.replaceState({}, '', '/?mode=gm#/daggerheart/player');
    const { result } = renderHook(() => useViewMode());
    expect(result.current).toBe('player');
  });

  it('ignores an unknown scene segment and falls back to player', () => {
    window.history.replaceState({}, '', '/#/daggerheart/table');
    const { result } = renderHook(() => useViewMode());
    expect(result.current).toBe('player');
  });

  it('re-renders when the hash changes', () => {
    window.history.replaceState({}, '', '/#/daggerheart/player');
    const { result } = renderHook(() => useViewMode());
    expect(result.current).toBe('player');

    act(() => {
      window.history.replaceState({}, '', '/#/daggerheart/gm');
      window.dispatchEvent(new HashChangeEvent('hashchange'));
    });

    expect(result.current).toBe('gm');
  });
});
