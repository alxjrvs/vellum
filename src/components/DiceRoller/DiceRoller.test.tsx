import { afterEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import type { DualityRoll, DualityRollInput } from '../../dice';
import { DiceRoller } from './DiceRoller';

const rollDuality = vi.hoisted(() => vi.fn());
vi.mock('../../dice', () => ({ rollDuality }));

function result(over: Partial<DualityRoll>): DualityRoll {
  return {
    total: 10,
    outcome: 'hope',
    hope: 6,
    fear: 4,
    modifier: 0,
    advantageValue: undefined,
    rolledWith: 'none',
    ...over,
  };
}

afterEach(() => vi.clearAllMocks());

function roll() {
  fireEvent.click(screen.getByRole('button', { name: 'Roll' }));
}

/** The newest log row (data-latest="true"). */
function latestRow(): HTMLElement {
  const row = document.querySelector<HTMLElement>('.dice-roller__log-row[data-latest="true"]');
  if (!row) throw new Error('no latest log row');
  return row;
}

function within(row: HTMLElement, selector: string): HTMLElement | null {
  return row.querySelector<HTMLElement>(selector);
}

describe('DiceRoller', () => {
  it('shows an empty state and no log rows before the first roll', () => {
    render(<DiceRoller />);
    expect(screen.getByText('No rolls yet')).toBeInTheDocument();
    expect(document.querySelectorAll('.dice-roller__log-row')).toHaveLength(0);
  });

  it('rolls with a zero modifier and no advantage by default', () => {
    rollDuality.mockReturnValue(result({ total: 10, hope: 6, fear: 4 }));
    render(<DiceRoller />);
    roll();
    expect(rollDuality).toHaveBeenCalledWith({ modifier: 0, advantage: 'none' });
    expect(within(latestRow(), '.dice-roller__log-total')).toHaveTextContent('10');
  });

  it('steps the modifier up and passes it to the roll', () => {
    rollDuality.mockReturnValue(result({ modifier: 2, total: 12 }));
    render(<DiceRoller />);
    fireEvent.click(screen.getByRole('button', { name: 'Increase modifier' }));
    fireEvent.click(screen.getByRole('button', { name: 'Increase modifier' }));
    expect(screen.getByLabelText('Current modifier')).toHaveTextContent('+2');
    roll();
    expect(rollDuality).toHaveBeenCalledWith({ modifier: 2, advantage: 'none' });
  });

  it('steps the modifier below zero and renders a signed value', () => {
    rollDuality.mockReturnValue(result({ modifier: -1 }));
    render(<DiceRoller />);
    fireEvent.click(screen.getByRole('button', { name: 'Decrease modifier' }));
    expect(screen.getByLabelText('Current modifier')).toHaveTextContent('-1');
    roll();
    expect(rollDuality).toHaveBeenCalledWith({ modifier: -1, advantage: 'none' });
  });

  it('rolls with advantage when the advantage toggle is selected', () => {
    rollDuality.mockReturnValue(result({ advantageValue: 3, rolledWith: 'advantage', total: 13 }));
    render(<DiceRoller />);
    fireEvent.click(screen.getByRole('button', { name: 'Adv', pressed: false }));
    roll();
    expect(rollDuality).toHaveBeenCalledWith({ modifier: 0, advantage: 'advantage' });
    expect(within(latestRow(), '[data-kind="advantage"]')).toHaveTextContent('+3');
  });

  it('renders the Hope and Fear dice in the breakdown of the latest roll', () => {
    rollDuality.mockReturnValue(result({ hope: 9, fear: 5, outcome: 'hope', total: 14 }));
    render(<DiceRoller />);
    roll();
    const row = latestRow();
    expect(within(row, '[data-kind="hope"]')).toHaveTextContent('9');
    expect(within(row, '[data-kind="fear"]')).toHaveTextContent('5');
    expect(within(row, '.dice-roller__log-outcome')).toHaveTextContent('With Hope');
  });

  it('labels a critical when the dice match', () => {
    rollDuality.mockReturnValue(result({ hope: 7, fear: 7, outcome: 'critical hope', total: 14 }));
    render(<DiceRoller />);
    roll();
    expect(within(latestRow(), '.dice-roller__log-outcome')).toHaveTextContent('Critical!');
  });

  it('omits the modifier chip in the breakdown when the modifier is zero', () => {
    rollDuality.mockReturnValue(result({ modifier: 0 }));
    render(<DiceRoller />);
    roll();
    expect(within(latestRow(), '[data-kind="modifier"]')).toBeNull();
  });

  it('accumulates a history of rolls, newest first', () => {
    render(<DiceRoller />);
    rollDuality.mockReturnValue(result({ total: 10 }));
    roll();
    rollDuality.mockReturnValue(result({ total: 15 }));
    roll();
    const rows = document.querySelectorAll('.dice-roller__log-row');
    expect(rows).toHaveLength(2);
    // Newest roll is first and flagged as latest.
    expect(rows[0]).toHaveAttribute('data-latest', 'true');
    expect(rows[0].querySelector('.dice-roller__log-total')).toHaveTextContent('15');
    expect(rows[1].querySelector('.dice-roller__log-total')).toHaveTextContent('10');
  });

  it('clears the history via the Clear button', () => {
    rollDuality.mockReturnValue(result({ total: 10 }));
    render(<DiceRoller />);
    const clear = screen.getByRole('button', { name: 'Clear roll history' });
    expect(clear).toBeDisabled();
    roll();
    expect(document.querySelectorAll('.dice-roller__log-row')).toHaveLength(1);
    expect(clear).toBeEnabled();
    fireEvent.click(clear);
    expect(document.querySelectorAll('.dice-roller__log-row')).toHaveLength(0);
    expect(screen.getByText('No rolls yet')).toBeInTheDocument();
  });
});

// Type-only guard: the mocked module must satisfy the real signature.
const _typecheck: (i: DualityRollInput) => DualityRoll = rollDuality;
void _typecheck;
