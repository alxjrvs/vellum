import { afterEach, describe, expect, it } from 'vitest';
import { launchStorageKey, readLaunchedFromStorage, writeLaunchedToStorage } from './launchStorage';

afterEach(() => {
  localStorage.clear();
});

describe('launch storage', () => {
  it('namespaces the key per scene', () => {
    expect(launchStorageKey('gm')).toBe('vellum:launched:gm');
    expect(launchStorageKey('player')).toBe('vellum:launched:player');
  });

  it('returns null when the scene has never recorded a launch', () => {
    expect(readLaunchedFromStorage('gm')).toBeNull();
  });

  it('distinguishes an explicit false from never-recorded', () => {
    writeLaunchedToStorage('gm', false);
    expect(readLaunchedFromStorage('gm')).toBe(false);
  });

  it('round-trips a launch', () => {
    writeLaunchedToStorage('player', true);
    expect(readLaunchedFromStorage('player')).toBe(true);
  });

  it('keeps scenes independent', () => {
    writeLaunchedToStorage('gm', true);
    expect(readLaunchedFromStorage('player')).toBeNull();
  });
});
