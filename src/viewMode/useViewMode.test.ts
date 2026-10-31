import { afterEach, describe, expect, it } from 'vitest';
import { renderHook } from '@testing-library/react';
import { act } from 'react';
import { SCENES, appRoot, migrateLegacyRoute, scenePath, useViewMode } from './useViewMode';

afterEach(() => {
  window.history.replaceState({}, '', '/');
});

describe('appRoot', () => {
  it.each([
    ['/', '/'],
    ['/app/', '/app/'],
    ['/app', '/'],
    ['/app/index.html', '/app/'],
    ['/app/v0.3.0/', '/app/v0.3.0/'],
    ['/app/daggerheart/gm/', '/app/'],
    ['/app/daggerheart/gm', '/app/'],
    ['/app/v0.3.0/daggerheart/player/', '/app/v0.3.0/'],
    ['/dist/daggerheart/player/index.html', '/dist/'],
  ])('%s mounts at %s', (pathname, root) => {
    expect(appRoot(pathname)).toBe(root);
  });
});

describe('scenePath', () => {
  it('hangs each scene off the app root', () => {
    expect(scenePath('player', '/app/')).toBe('/app/daggerheart/player/');
    expect(scenePath('gm', '/app/daggerheart/player/')).toBe('/app/daggerheart/gm/');
  });
});

describe('migrateLegacyRoute', () => {
  it.each([
    ['/app/#/daggerheart/gm', '/app/daggerheart/gm/'],
    ['/app/#/gm', '/app/daggerheart/gm/'],
    ['/app/?c=abc&source=obs#/daggerheart/player', '/app/daggerheart/player/?c=abc&source=obs'],
    ['/app/?mode=gm&frame=x', '/app/daggerheart/gm/?frame=x'],
  ])('moves %s to %s', (from, to) => {
    window.history.replaceState({}, '', from);
    expect(migrateLegacyRoute()).toBe(true);
    expect(`${window.location.pathname}${window.location.search}${window.location.hash}`).toBe(to);
  });

  it('leaves path routes and the bare app alone', () => {
    for (const url of ['/app/daggerheart/gm/', '/app/', '/app/#migrate=x']) {
      window.history.replaceState({}, '', url);
      expect(migrateLegacyRoute()).toBe(false);
    }
  });
});

describe('useViewMode', () => {
  it('returns null when the URL addresses no scene, so the selector renders', () => {
    const { result } = renderHook(() => useViewMode());
    expect(result.current).toBeNull();
  });

  it.each(SCENES)('reads the scene path `/daggerheart/%s/`', (scene) => {
    window.history.replaceState({}, '', scenePath(scene));
    const { result } = renderHook(() => useViewMode());
    expect(result.current).toBe(scene);
  });

  it('still reads a legacy hash or `?mode=` before it is migrated', () => {
    window.history.replaceState({}, '', '/#/gm');
    expect(renderHook(() => useViewMode()).result.current).toBe('gm');
    window.history.replaceState({}, '', '/?mode=gm');
    expect(renderHook(() => useViewMode()).result.current).toBe('gm');
  });

  it('prefers the path over a legacy `?mode=` query', () => {
    window.history.replaceState({}, '', '/daggerheart/player/?mode=gm');
    expect(renderHook(() => useViewMode()).result.current).toBe('player');
  });

  it('ignores an unknown scene segment and falls back to the selector', () => {
    window.history.replaceState({}, '', '/daggerheart/table/');
    expect(renderHook(() => useViewMode()).result.current).toBeNull();
  });

  it('re-renders on navigation', () => {
    window.history.replaceState({}, '', '/daggerheart/player/');
    const { result } = renderHook(() => useViewMode());
    expect(result.current).toBe('player');

    act(() => {
      window.history.pushState({}, '', '/daggerheart/gm/');
      window.dispatchEvent(new PopStateEvent('popstate'));
    });

    expect(result.current).toBe('gm');
  });
});
