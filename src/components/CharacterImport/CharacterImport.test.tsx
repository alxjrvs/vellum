import { describe, expect, it } from 'vitest';
import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CharacterImport } from './CharacterImport';
import { CharacterProvider } from '../../character/CharacterProvider';
import { useCharacter } from '../../character/useCharacter';
import { makeCharacter } from '../../character/fixtures';
import { STORAGE_KEY } from '../../character/storage';

function StateProbe() {
  const { character } = useCharacter();
  return <p data-testid="loaded-name">{character?.identity.name ?? 'NONE'}</p>;
}

function renderImport() {
  return render(
    <CharacterProvider>
      <CharacterImport />
      <StateProbe />
    </CharacterProvider>
  );
}

function jsonFile(name: string, body: string): File {
  return new File([body], name, { type: 'application/json' });
}

describe('CharacterImport', () => {
  it('loads a valid character into state and clears any prior error', async () => {
    const user = userEvent.setup();
    renderImport();

    const character = makeCharacter({
      identity: { name: 'Imported', class: 'Bard', ancestry: 'Elf' },
    });
    const file = jsonFile('character.json', JSON.stringify(character));

    const input = screen.getByLabelText(/import character/i) as HTMLInputElement;
    await act(async () => {
      await user.upload(input, file);
    });

    expect(screen.getByTestId('loaded-name').textContent).toBe('Imported');
    expect(screen.queryByRole('alert')).toBeNull();
  });

  it('shows an error and preserves prior character on schema-invalid file', async () => {
    const user = userEvent.setup();
    const existing = makeCharacter({
      identity: { name: 'Existing', class: 'Bard', ancestry: 'Elf' },
    });
    localStorage.setItem(STORAGE_KEY, JSON.stringify(existing));
    renderImport();

    const invalid = jsonFile(
      'broken.json',
      JSON.stringify({ ...existing, identity: { name: '', class: 'Bard', ancestry: 'Elf' } })
    );

    const input = screen.getByLabelText(/import character/i) as HTMLInputElement;
    await act(async () => {
      await user.upload(input, invalid);
    });

    expect(screen.getByRole('alert').textContent).toMatch(/identity\.name/);
    expect(screen.getByTestId('loaded-name').textContent).toBe('Existing');
  });

  it('shows an error and preserves prior character on malformed JSON', async () => {
    const user = userEvent.setup();
    const existing = makeCharacter({
      identity: { name: 'Existing', class: 'Bard', ancestry: 'Elf' },
    });
    localStorage.setItem(STORAGE_KEY, JSON.stringify(existing));
    renderImport();

    const malformed = jsonFile('bad.json', '{not json');

    const input = screen.getByLabelText(/import character/i) as HTMLInputElement;
    await act(async () => {
      await user.upload(input, malformed);
    });

    expect(screen.getByRole('alert').textContent).toMatch(/JSON/);
    expect(screen.getByTestId('loaded-name').textContent).toBe('Existing');
  });

  it('does nothing when the file dialog is dismissed without a selection', async () => {
    renderImport();
    const input = screen.getByLabelText(/import character/i) as HTMLInputElement;

    await act(async () => {
      input.dispatchEvent(new Event('change', { bubbles: true }));
    });

    expect(screen.getByTestId('loaded-name').textContent).toBe('NONE');
    expect(screen.queryByRole('alert')).toBeNull();
  });
});
