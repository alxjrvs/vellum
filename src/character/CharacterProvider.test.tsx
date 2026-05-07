import { afterEach, describe, expect, it } from 'vitest';
import { act, render, screen } from '@testing-library/react';
import { CharacterProvider } from './CharacterProvider';
import { useCharacter } from './useCharacter';
import { STORAGE_KEY } from './storage';
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
