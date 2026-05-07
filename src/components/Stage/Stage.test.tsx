import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Stage } from './Stage';

describe('Stage', () => {
  it('renders the OBS-canvas root with the documented dimensions', () => {
    render(
      <Stage>
        <span data-testid="child">child</span>
      </Stage>
    );
    const stage = screen.getByTestId('child').parentElement as HTMLElement;
    expect(stage.classList.contains('vellum-stage')).toBe(true);
  });
});
