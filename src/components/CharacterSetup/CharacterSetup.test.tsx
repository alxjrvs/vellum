import { afterEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { CharacterSetup } from './CharacterSetup';
import { CharacterProvider } from '../../character/CharacterProvider';
import { STORAGE_KEY } from '../../character/storage';
import { useCharacter } from '../../character/useCharacter';
import { makeCharacter } from '../../character/fixtures';
import { SystemProvider } from '../../systems/SystemProvider';
import { daggerheartSystem } from '../../systems/daggerheart.system';

function Probe() {
  const { character } = useCharacter();
  if (!character) return <p>no character</p>;
  const { identity, slotCounts, stats } = character;
  return (
    <dl>
      <dd data-testid="name">{identity.name}</dd>
      <dd data-testid="class">{identity.class}</dd>
      <dd data-testid="hp-max">{slotCounts.hp}</dd>
      <dd data-testid="stress-max">{slotCounts.stress}</dd>
      <dd data-testid="hope">{stats.hope}</dd>
    </dl>
  );
}

function renderSetup(onDone = vi.fn()) {
  const result = render(
    <SystemProvider system={daggerheartSystem}>
      <CharacterProvider>
        <CharacterSetup onDone={onDone} />
        <Probe />
      </CharacterProvider>
    </SystemProvider>
  );
  return { onDone, ...result };
}

function typeInto(label: RegExp, value: string) {
  fireEvent.change(screen.getByLabelText(label), { target: { value } });
}

afterEach(() => localStorage.clear());

describe('CharacterSetup', () => {
  it('builds a character from the form and calls onDone', () => {
    localStorage.clear();
    const { onDone } = renderSetup();

    typeInto(/^name/i, 'Kesh');
    typeInto(/^class/i, 'Warrior');
    typeInto(/^ancestry/i, 'Dwarf');
    typeInto(/hp slots/i, '7');
    typeInto(/starting hope/i, '3');

    fireEvent.click(screen.getByRole('button', { name: /show overlay/i }));

    expect(onDone).toHaveBeenCalledOnce();
    expect(screen.getByTestId('name')).toHaveTextContent('Kesh');
    expect(screen.getByTestId('class')).toHaveTextContent('Warrior');
    expect(screen.getByTestId('hp-max')).toHaveTextContent('7');
    expect(screen.getByTestId('hope')).toHaveTextContent('3');
  });

  it('rejects submit when required identity fields are blank', () => {
    localStorage.clear();
    const { onDone } = renderSetup();

    fireEvent.click(screen.getByRole('button', { name: /show overlay/i }));

    expect(onDone).not.toHaveBeenCalled();
    expect(screen.getByRole('alert')).toHaveTextContent(/required/i);
    expect(screen.getByText('no character')).toBeInTheDocument();
  });

  it('prefills from an existing character and preserves in-range marks when maxes change', () => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(
        makeCharacter({
          identity: { name: 'Mara', class: 'Rogue', ancestry: 'Human' },
          stats: { hope: 2, hp: [0, 1, 4], stress: [], armorSlots: [] },
          slotCounts: { hp: 6, stress: 6, armorSlots: 3 },
        })
      )
    );
    renderSetup();

    // Prefilled.
    expect(screen.getByLabelText(/^name/i)).toHaveValue('Mara');
    expect(screen.getByLabelText(/hp slots/i)).toHaveValue(6);

    // Shrink HP max to 3 — the mark at index 4 should be dropped, 0 and 1 kept.
    typeInto(/hp slots/i, '3');
    fireEvent.click(screen.getByRole('button', { name: /show overlay/i }));

    expect(screen.getByTestId('hp-max')).toHaveTextContent('3');
    expect(screen.getByTestId('name')).toHaveTextContent('Mara');
  });
});
