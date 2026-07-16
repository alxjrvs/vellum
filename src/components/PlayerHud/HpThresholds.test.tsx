import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, within } from '@testing-library/react';
import { HpThresholds } from './HpThresholds';

describe('HpThresholds', () => {
  it('renders the three damage tiers with their HP costs', () => {
    render(<HpThresholds thresholds={{ major: 7, severe: 12 }} onTakeDamage={() => {}} />);
    const strip = screen.getByRole('region', { name: /damage thresholds/i });
    expect(within(strip).getByText('Minor')).toBeInTheDocument();
    expect(within(strip).getByText('Major')).toBeInTheDocument();
    expect(within(strip).getByText('Severe')).toBeInTheDocument();
    expect(within(strip).getByText('1 HP')).toBeInTheDocument();
    expect(within(strip).getByText('2 HP')).toBeInTheDocument();
    expect(within(strip).getByText('3 HP')).toBeInTheDocument();
  });

  it('shows the Major and Severe threshold values between the tiers', () => {
    render(<HpThresholds thresholds={{ major: 7, severe: 12 }} onTakeDamage={() => {}} />);
    expect(screen.getByLabelText('Major threshold 7')).toHaveTextContent('7');
    expect(screen.getByLabelText('Severe threshold 12')).toHaveTextContent('12');
  });

  it('takes the tier amount of damage when a tier is clicked', () => {
    const onTakeDamage = vi.fn();
    render(<HpThresholds thresholds={{ major: 7, severe: 12 }} onTakeDamage={onTakeDamage} />);
    fireEvent.click(screen.getByRole('button', { name: /take minor damage/i }));
    fireEvent.click(screen.getByRole('button', { name: /take major damage/i }));
    fireEvent.click(screen.getByRole('button', { name: /take severe damage/i }));
    expect(onTakeDamage.mock.calls).toEqual([[1], [2], [3]]);
  });
});
