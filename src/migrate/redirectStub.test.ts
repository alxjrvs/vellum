import { afterEach, describe, expect, it } from 'vitest';
import { decodeHandoff } from './originHandoff';
import html from '../../deploy/github-pages-redirect/redirect.html?raw';

// The GitHub Pages redirect stub is plain inline JS (it must run on the old
// origin with no build). Run its script against a fake location and check the
// app's decoder accepts what it produces.
const script = /<script>([\s\S]*?)<\/script>/.exec(html)?.[1] ?? '';

function runStub(url: string): string {
  const parsed = new URL(url);
  let replaced = '';
  const location = {
    pathname: parsed.pathname,
    search: parsed.search,
    hash: parsed.hash,
    replace: (to: string) => {
      replaced = to;
    },
  };
  new Function('location', 'localStorage', script)(location, localStorage);
  return replaced;
}

afterEach(() => {
  localStorage.clear();
});

describe('GitHub Pages redirect stub', () => {
  it('hands app URLs over with their saved data, query and route', () => {
    localStorage.setItem('vellum:fear', '4');
    localStorage.setItem('vellum:character', '{"identity":{"name":"Ælfwyn"}}');
    localStorage.setItem('unrelated', 'x');
    const to = runStub('https://alxjrvs.github.io/vellum/app/?c=abc#/daggerheart/gm');
    const url = new URL(to);
    expect(url.origin + url.pathname + url.search).toBe('https://vellumhud.com/app/?c=abc');
    expect(decodeHandoff(url.hash)).toEqual({
      keys: { 'vellum:fear': '4', 'vellum:character': '{"identity":{"name":"Ælfwyn"}}' },
      to: '#/daggerheart/gm',
    });
  });

  it('keeps pinned version paths', () => {
    const to = runStub('https://alxjrvs.github.io/vellum/app/v0.2.0/#/daggerheart/player');
    expect(to.startsWith('https://vellumhud.com/app/v0.2.0/#migrate=')).toBe(true);
  });

  it('sends site pages straight across without data', () => {
    expect(runStub('https://alxjrvs.github.io/vellum/')).toBe('https://vellumhud.com/');
    expect(runStub('https://alxjrvs.github.io/vellum/docs/#setup')).toBe(
      'https://vellumhud.com/docs/#setup'
    );
  });
});
