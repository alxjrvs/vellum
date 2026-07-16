import { afterEach, describe, expect, it } from 'vitest';
import { act, render, screen } from '@testing-library/react';
import { CharacterProvider } from './CharacterProvider';
import { useCharacter } from './useCharacter';
import { STORAGE_KEY } from './storage';
import { encodeCharacterToShareParam } from './shareCode';
import { makeCharacter } from './fixtures';

function Probe() {
  const { character, dispatch } = useCharacter();
  return (
    <div>
      <p data-testid="name">{character?.identity.name ?? 'NONE'}</p>
      <button onClick={() => dispatch({ type: 'SET_CHARACTER', character: makeCharacter() })}>
        set
      </button>
      <button onClick={() => dispatch({ type: 'CLEAR_CHARACTER' })}>clear</button>
    </div>
  );
}

afterEach(() => {
  localStorage.clear();
  window.history.replaceState({}, '', '/');
});

describe('CharacterProvider', () => {
  it('initializes with null when localStorage is empty', () => {
    render(
      <CharacterProvider>
        <Probe />
      </CharacterProvider>
    );
    expect(screen.getByTestId('name').textContent).toBe('NONE');
  });

  it('hydrates the initial character from localStorage on mount', () => {
    const character = makeCharacter({
      identity: { name: 'Restored', class: 'Bard', ancestry: 'Elf' },
    });
    localStorage.setItem(STORAGE_KEY, JSON.stringify(character));

    render(
      <CharacterProvider>
        <Probe />
      </CharacterProvider>
    );

    expect(screen.getByTestId('name').textContent).toBe('Restored');
  });

  it('persists state changes to localStorage', () => {
    render(
      <CharacterProvider>
        <Probe />
      </CharacterProvider>
    );

    act(() => {
      screen.getByText('set').click();
    });

    const stored = localStorage.getItem(STORAGE_KEY);
    expect(stored).not.toBeNull();
    expect(JSON.parse(stored as string).identity.name).toBe('Seraphine');
  });

  it('clears the stored character when CLEAR_CHARACTER is dispatched', () => {
    const character = makeCharacter();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(character));

    render(
      <CharacterProvider>
        <Probe />
      </CharacterProvider>
    );

    act(() => {
      screen.getByText('clear').click();
    });

    expect(localStorage.getItem(STORAGE_KEY)).toBeNull();
    expect(screen.getByTestId('name').textContent).toBe('NONE');
  });
});

describe('CharacterProvider ?c= share flow', () => {
  it('hydrates from a valid ?c= share param', () => {
    const character = makeCharacter({
      identity: { name: 'Shared', class: 'Bard', ancestry: 'Elf' },
    });
    window.history.replaceState({}, '', `/?c=${encodeCharacterToShareParam(character)}`);

    render(
      <CharacterProvider>
        <Probe />
      </CharacterProvider>
    );

    expect(screen.getByTestId('name').textContent).toBe('Shared');
  });

  it('strips the consumed ?c= param while preserving other params and the hash', () => {
    const character = makeCharacter({
      identity: { name: 'Shared', class: 'Bard', ancestry: 'Elf' },
    });
    const param = encodeCharacterToShareParam(character);
    window.history.replaceState({}, '', `/?c=${param}&mode=gm#sheet`);

    render(
      <CharacterProvider>
        <Probe />
      </CharacterProvider>
    );

    expect(screen.getByTestId('name').textContent).toBe('Shared');
    expect(new URLSearchParams(window.location.search).has('c')).toBe(false);
    expect(new URLSearchParams(window.location.search).get('mode')).toBe('gm');
    expect(window.location.hash).toBe('#sheet');
  });

  it('promotes the shared character into localStorage as the live store', () => {
    const character = makeCharacter({
      identity: { name: 'Shared', class: 'Bard', ancestry: 'Elf' },
    });
    window.history.replaceState({}, '', `/?c=${encodeCharacterToShareParam(character)}`);

    render(
      <CharacterProvider>
        <Probe />
      </CharacterProvider>
    );

    const stored = localStorage.getItem(STORAGE_KEY);
    expect(stored).not.toBeNull();
    expect(JSON.parse(stored as string).identity.name).toBe('Shared');
  });

  it('falls back to localStorage when no ?c= param is present', () => {
    const character = makeCharacter({
      identity: { name: 'Stored', class: 'Bard', ancestry: 'Elf' },
    });
    localStorage.setItem(STORAGE_KEY, JSON.stringify(character));
    window.history.replaceState({}, '', '/');

    render(
      <CharacterProvider>
        <Probe />
      </CharacterProvider>
    );

    expect(screen.getByTestId('name').textContent).toBe('Stored');
  });

  it('falls back to localStorage and leaves an invalid ?c= param untouched', () => {
    const character = makeCharacter({
      identity: { name: 'Stored', class: 'Bard', ancestry: 'Elf' },
    });
    localStorage.setItem(STORAGE_KEY, JSON.stringify(character));
    // A single base64url char is malformed (length ≡ 1 mod 4) → decode fails.
    window.history.replaceState({}, '', '/?c=x');

    render(
      <CharacterProvider>
        <Probe />
      </CharacterProvider>
    );

    expect(screen.getByTestId('name').textContent).toBe('Stored');
    // An unconsumed (invalid) param is not stripped from the URL.
    expect(new URLSearchParams(window.location.search).get('c')).toBe('x');
  });
});

describe('useCharacter', () => {
  it('throws a helpful error when used outside the provider', () => {
    const originalError = console.error;
    console.error = () => {};
    try {
      expect(() => render(<Probe />)).toThrow(/CharacterProvider/);
    } finally {
      console.error = originalError;
    }
  });
});
