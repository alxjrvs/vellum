import { afterEach, describe, expect, it } from 'vitest';
import {
  appRoot,
  frameIdFromPath,
  framePath,
  kindFromLegacyUrl,
  showFrameInUrl,
} from './frameRoute';

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
    ['/app/frames/daggerheart-gm/', '/app/'],
    ['/app/frames/custom-mine-ab12c', '/app/'],
    ['/app/v0.3.0/frames/daggerheart-player/', '/app/v0.3.0/'],
    ['/dist/frames/daggerheart-player/index.html', '/dist/'],
    ['/app/daggerheart/gm/', '/app/'],
    ['/app/v0.3.0/daggerheart/player/', '/app/v0.3.0/'],
  ])('%s mounts at %s', (pathname, root) => {
    expect(appRoot(pathname)).toBe(root);
  });
});

describe('framePath', () => {
  it('hangs each frame off the app root', () => {
    expect(framePath('daggerheart-gm', '/app/')).toBe('/app/frames/daggerheart-gm/');
    expect(framePath('custom-x', '/app/daggerheart/player/')).toBe('/app/frames/custom-x/');
  });
});

describe('frameIdFromPath', () => {
  it.each([
    ['/app/frames/daggerheart-gm/', 'daggerheart-gm'],
    ['/app/frames/custom-mine-ab12c', 'custom-mine-ab12c'],
    ['/app/frames/_/', '_'],
    ['/app/', null],
    ['/app/daggerheart/gm/', null],
  ])('%s addresses %s', (pathname, id) => {
    expect(frameIdFromPath(pathname)).toBe(id);
  });
});

describe('kindFromLegacyUrl', () => {
  it.each([
    [{ pathname: '/app/daggerheart/gm/', search: '', hash: '' }, 'gm'],
    [{ pathname: '/app/daggerheart/player/', search: '', hash: '' }, 'player'],
    [{ pathname: '/app/', search: '', hash: '#/daggerheart/gm' }, 'gm'],
    [{ pathname: '/app/', search: '', hash: '#/gm' }, 'gm'],
    [{ pathname: '/app/', search: '?mode=gm', hash: '' }, 'gm'],
    [{ pathname: '/app/', search: '?c=abc', hash: '' }, 'player'],
    [{ pathname: '/app/', search: '', hash: '' }, null],
    // A frame address always wins over anything old in the URL.
    [{ pathname: '/app/frames/daggerheart-gm/', search: '?c=abc', hash: '' }, null],
  ])('%o asks for %s', (location, kind) => {
    expect(kindFromLegacyUrl(location)).toBe(kind);
  });
});

describe('showFrameInUrl', () => {
  it.each([
    ['/app/', '/app/frames/daggerheart-player/'],
    ['/app/#/daggerheart/gm', '/app/frames/daggerheart-player/'],
    ['/app/daggerheart/gm/?mode=gm&frame=x&cam=1', '/app/frames/daggerheart-player/?cam=1'],
    ['/app/frames/daggerheart-gm/?cam=1#keep', '/app/frames/daggerheart-player/?cam=1#keep'],
  ])('moves %s to %s', (from, to) => {
    window.history.replaceState({}, '', from);
    showFrameInUrl('daggerheart-player');
    const { pathname, search, hash } = window.location;
    expect(`${pathname}${search}${hash}`).toBe(to);
  });
});
