import { act, renderHook } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { publishCommand } from '../commands/commandBus';
import { readFearFromStorage } from './fearStorage';
import { useFear } from './useFear';

afterEach(() => {
  localStorage.clear();
});

describe('useFear commands', () => {
  it('gains, spends and sets Fear from the command bus, clamped and persisted', () => {
    const { result } = renderHook(() => useFear(12));
    act(() => publishCommand({ type: 'track.adjust', track: 'fear', delta: 3 }));
    expect(result.current.fear).toBe(3);
    act(() => publishCommand({ type: 'track.set', track: 'fear', value: 20 }));
    expect(result.current.fear).toBe(12);
    act(() => publishCommand({ type: 'track.adjust', track: 'fear', delta: -15 }));
    expect(result.current.fear).toBe(0);
    expect(readFearFromStorage()).toBe(0);
  });

  it('ignores commands for other tracks', () => {
    const { result } = renderHook(() => useFear(12));
    act(() => publishCommand({ type: 'track.adjust', track: 'hope', delta: 1 }));
    expect(result.current.fear).toBe(0);
  });
});
