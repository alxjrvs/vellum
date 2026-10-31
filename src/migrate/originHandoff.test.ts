import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  applyOriginHandoff,
  collectVellumKeys,
  decodeHandoff,
  encodeHandoff,
} from './originHandoff';

afterEach(() => {
  localStorage.clear();
});

describe('origin handoff', () => {
  it('collects only vellum keys', () => {
    localStorage.setItem('vellum:character', '{"a":1}');
    localStorage.setItem('vellum:fear', '3');
    localStorage.setItem('other', 'x');
    expect(collectVellumKeys(localStorage)).toEqual({
      'vellum:character': '{"a":1}',
      'vellum:fear': '3',
    });
  });

  it('round-trips keys and the original route, including Unicode', () => {
    const keys = { 'vellum:character': '{"name":"Ælfwyn ✦"}', 'vellum:fear': '2' };
    const hash = encodeHandoff(keys, '#/daggerheart/gm');
    expect(decodeHandoff(hash)).toEqual({ keys, to: '#/daggerheart/gm' });
  });

  it('ignores fragments that are not a handoff or are malformed', () => {
    expect(decodeHandoff('#/daggerheart/player')).toBeNull();
    expect(decodeHandoff('#migrate=%%%')).toBeNull();
    expect(decodeHandoff(`#migrate=${btoa('[1,2]')}`)).toBeNull();
  });

  it('drops non-vellum keys and non-string values from a crafted payload', () => {
    const payload = btoa(JSON.stringify({ evil: 'x', 'vellum:fear': 4, 'vellum:ticker': 'hi' }));
    expect(decodeHandoff(`#migrate=${payload}&to=%23%2Fgm`)).toEqual({
      keys: { 'vellum:ticker': 'hi' },
      to: '#/gm',
    });
  });

  it('imports missing keys, keeps existing ones, and restores the route', () => {
    localStorage.setItem('vellum:fear', '9');
    const replaceState = vi.fn();
    const hash = encodeHandoff({ 'vellum:fear': '1', 'vellum:ticker': 'Session 4' }, '#/gm');
    const imported = applyOriginHandoff(
      { hash, pathname: '/app/', search: '?c=abc' },
      { replaceState },
      localStorage
    );
    expect(imported).toBe(1);
    expect(localStorage.getItem('vellum:fear')).toBe('9');
    expect(localStorage.getItem('vellum:ticker')).toBe('Session 4');
    expect(replaceState).toHaveBeenCalledWith(null, '', '/app/?c=abc#/gm');
  });

  it('does nothing without a handoff', () => {
    const replaceState = vi.fn();
    expect(
      applyOriginHandoff({ hash: '#/gm', pathname: '/app/', search: '' }, { replaceState })
    ).toBe(0);
    expect(replaceState).not.toHaveBeenCalled();
  });
});
