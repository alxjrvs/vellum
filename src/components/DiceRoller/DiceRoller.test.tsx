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

describe('DiceRoller', () => {
  it('shows no result before the first roll', () => {
    render(<DiceRoller />);
    expect(screen.queryByLabelText('Roll total')).not.toBeInTheDocument();
  });

  it('rolls with a zero modifier and no advantage by default', () => {
    rollDuality.mockReturnValue(result({ total: 10, hope: 6, fear: 4 }));
    render(<DiceRoller />);
    fireEvent.click(screen.getByRole('button', { name: 'Roll' }));
    expect(rollDuality).toHaveBeenCalledWith({ modifier: 0, advantage: 'none' });
    expect(screen.getByLabelText('Roll total')).toHaveTextContent('10');
  });

  it('steps the modifier up and passes it to the roll', () => {
    rollDuality.mockReturnValue(result({ modifier: 2, total: 12 }));
    render(<DiceRoller />);
    fireEvent.click(screen.getByRole('button', { name: 'Increase modifier' }));
    fireEvent.click(screen.getByRole('button', { name: 'Increase modifier' }));
    expect(screen.getByLabelText('Current modifier')).toHaveTextContent('+2');
    fireEvent.click(screen.getByRole('button', { name: 'Roll' }));
    expect(rollDuality).toHaveBeenCalledWith({ modifier: 2, advantage: 'none' });
  });

  it('steps the modifier below zero and renders a signed value', () => {
    rollDuality.mockReturnValue(result({ modifier: -1 }));
    render(<DiceRoller />);
    fireEvent.click(screen.getByRole('button', { name: 'Decrease modifier' }));
    expect(screen.getByLabelText('Current modifier')).toHaveTextContent('-1');
    fireEvent.click(screen.getByRole('button', { name: 'Roll' }));
    expect(rollDuality).toHaveBeenCalledWith({ modifier: -1, advantage: 'none' });
  });

  it('rolls with advantage when the advantage toggle is selected', () => {
    rollDuality.mockReturnValue(result({ advantageValue: 3, rolledWith: 'advantage', total: 13 }));
    render(<DiceRoller />);
    fireEvent.click(screen.getByRole('button', { name: 'Advantage', pressed: false }));
    fireEvent.click(screen.getByRole('button', { name: 'Roll' }));
    expect(rollDuality).toHaveBeenCalledWith({ modifier: 0, advantage: 'advantage' });
  });

  it('renders the Hope and Fear dice in the breakdown', () => {
    rollDuality.mockReturnValue(result({ hope: 9, fear: 5, outcome: 'hope' }));
    render(<DiceRoller />);
    fireEvent.click(screen.getByRole('button', { name: 'Roll' }));
    expect(screen.getByText('Hope')).toBeInTheDocument();
    expect(screen.getByText('Fear')).toBeInTheDocument();
    expect(screen.getByText('9')).toBeInTheDocument();
    expect(screen.getByText('With Hope')).toBeInTheDocument();
  });

  it('labels a critical when the dice match', () => {
    rollDuality.mockReturnValue(result({ hope: 7, fear: 7, outcome: 'critical hope', total: 14 }));
    render(<DiceRoller />);
    fireEvent.click(screen.getByRole('button', { name: 'Roll' }));
    expect(screen.getByText('Critical!')).toBeInTheDocument();
  });

  it('hides the modifier chip in the breakdown when the modifier is zero', () => {
    rollDuality.mockReturnValue(result({ modifier: 0 }));
    render(<DiceRoller />);
    fireEvent.click(screen.getByRole('button', { name: 'Roll' }));
    expect(screen.queryByText('Mod')).not.toBeInTheDocument();
  });
});

// Type-only guard: the mocked module must satisfy the real signature.
const _typecheck: (i: DualityRollInput) => DualityRoll = rollDuality;
void _typecheck;
