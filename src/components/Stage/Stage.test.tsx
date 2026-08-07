import { act } from 'react';
import { afterEach, describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Stage } from './Stage';

const originalWidth = window.innerWidth;
const originalHeight = window.innerHeight;

function setViewport(width: number, height: number) {
  Object.defineProperty(window, 'innerWidth', { value: width, configurable: true });
  Object.defineProperty(window, 'innerHeight', { value: height, configurable: true });
}

function renderStage() {
  render(
    <Stage>
      <span data-testid="child">child</span>
    </Stage>
  );
  return screen.getByTestId('child').parentElement as HTMLElement;
}

afterEach(() => setViewport(originalWidth, originalHeight));

describe('Stage', () => {
  it('renders the OBS-canvas root with the documented dimensions', () => {
    setViewport(1920, 1080);
    const stage = renderStage();
    expect(stage.classList.contains('vellum-stage')).toBe(true);
    // The canvas keeps its authored size at every viewport — only the
    // transform changes — because everything inside is laid out in its pixels.
    expect(stage.style.width).toBe('1920px');
    expect(stage.style.height).toBe('1080px');
    expect(stage.style.transform).toBe('translate(-50%, -50%) scale(1)');
  });

  it('scales the canvas down to fit a smaller browser source', () => {
    setViewport(960, 540);
    expect(renderStage().style.transform).toBe('translate(-50%, -50%) scale(0.5)');
  });

  it('rescales when the browser source is resized', () => {
    setViewport(1920, 1080);
    const stage = renderStage();

    setViewport(960, 540);
    act(() => {
      window.dispatchEvent(new Event('resize'));
    });

    expect(stage.style.transform).toBe('translate(-50%, -50%) scale(0.5)');
  });
});
