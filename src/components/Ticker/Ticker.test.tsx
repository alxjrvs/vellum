import { describe, expect, it } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { Ticker } from './Ticker';
import { readTickerFromStorage, writeTickerToStorage } from './storage';

describe('Ticker', () => {
  it('shows the add-ticker prompt when empty', () => {
    render(<Ticker />);
    const banner = screen.getByRole('button', { name: /add ticker text/i });
    expect(banner).toHaveAttribute('data-empty', 'true');
    expect(screen.getByText(/add ticker/i)).toBeInTheDocument();
  });

  it('renders text loaded from storage on mount', () => {
    writeTickerToStorage('Session starts at 8pm');
    render(<Ticker />);
    // The marquee duplicates the text for a seamless loop.
    expect(screen.getAllByText('Session starts at 8pm')).toHaveLength(2);
    expect(screen.getByRole('button', { name: /click to edit/i })).toBeInTheDocument();
  });

  it('lets the user edit the text and persists it on Enter', () => {
    render(<Ticker />);
    fireEvent.click(screen.getByRole('button', { name: /add ticker text/i }));

    const input = screen.getByRole('textbox', { name: /ticker text/i });
    fireEvent.change(input, { target: { value: 'Beware the mimic' } });
    fireEvent.keyDown(input, { key: 'Enter' });

    expect(screen.getAllByText('Beware the mimic').length).toBeGreaterThan(0);
    expect(readTickerFromStorage()).toBe('Beware the mimic');
  });

  it('commits the edit on blur', () => {
    render(<Ticker />);
    fireEvent.click(screen.getByRole('button', { name: /add ticker text/i }));
    const input = screen.getByRole('textbox', { name: /ticker text/i });
    fireEvent.change(input, { target: { value: 'Roll for initiative' } });
    fireEvent.blur(input);

    expect(readTickerFromStorage()).toBe('Roll for initiative');
  });

  it('discards the edit on Escape and keeps the previous text', () => {
    writeTickerToStorage('Original');
    render(<Ticker />);
    fireEvent.click(screen.getByRole('button', { name: /click to edit/i }));

    const input = screen.getByRole('textbox', { name: /ticker text/i });
    fireEvent.change(input, { target: { value: 'Discarded' } });
    fireEvent.keyDown(input, { key: 'Escape' });

    expect(readTickerFromStorage()).toBe('Original');
    expect(screen.getAllByText('Original').length).toBeGreaterThan(0);
    expect(screen.queryByText('Discarded')).not.toBeInTheDocument();
  });

  it('clears stored text when saved empty', () => {
    writeTickerToStorage('Temporary');
    render(<Ticker />);
    fireEvent.click(screen.getByRole('button', { name: /click to edit/i }));
    const input = screen.getByRole('textbox', { name: /ticker text/i });
    fireEvent.change(input, { target: { value: '   ' } });
    fireEvent.keyDown(input, { key: 'Enter' });

    expect(readTickerFromStorage()).toBe('');
    expect(screen.getByRole('button', { name: /add ticker text/i })).toBeInTheDocument();
  });
});
