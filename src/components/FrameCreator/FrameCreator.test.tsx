import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, within } from '@testing-library/react';
import { CharacterProvider } from '../../character/CharacterProvider';
import { FrameProvider } from '../../frames/FrameProvider';
import { readCustomFrames } from '../../frames/customFrames';
import { SystemProvider } from '../../systems/SystemProvider';
import { daggerheartSystem } from '../../systems/daggerheart.system';
import { daggerheartTheme } from '../../themes/daggerheart.theme';
import type { StageRect } from '../../themes/regions';
import { FrameCreator } from './FrameCreator';

const SCALE = 0.6;
let boxes: Record<string, StageRect>;

/** jsdom has no layout, so give the stage and each widget a box to measure. */
function fakeLayout(this: Element): DOMRect {
  const scaled = (r: StageRect) =>
    ({
      left: r.x * SCALE,
      top: r.y * SCALE,
      width: r.width * SCALE,
      height: r.height * SCALE,
    }) as DOMRect;
  if (this.classList.contains('frame-preview__stage')) {
    return scaled({ x: 0, y: 0, width: 1920, height: 1080 });
  }
  const widget = /hud__region--(\w+)/.exec(this.className)?.[1];
  const home = widget && boxes[widget];
  if (!home) return scaled({ x: 0, y: 0, width: 0, height: 0 });
  // A hand-placed widget sits at its point: center x, top y.
  const style = (this as HTMLElement).style;
  const x = parseFloat(style.getPropertyValue('--region-x'));
  const y = parseFloat(style.getPropertyValue('--region-y'));
  return scaled(Number.isNaN(x) ? home : { ...home, x: x - home.width / 2, y });
}

// jsdom has no PointerEvent, so pointer events would lose their coordinates.
if (typeof window.PointerEvent === 'undefined') {
  class FakePointerEvent extends MouseEvent {
    readonly pointerId: number;
    constructor(type: string, init: PointerEventInit = {}) {
      super(type, init);
      this.pointerId = init.pointerId ?? 0;
    }
  }
  window.PointerEvent = FakePointerEvent as unknown as typeof PointerEvent;
}

beforeEach(() => {
  boxes = {
    vitals: { x: 40, y: 40, width: 600, height: 300 },
    status: { x: 1400, y: 40, width: 480, height: 200 },
    dice: { x: 40, y: 700, width: 400, height: 300 },
    name: { x: 760, y: 900, width: 400, height: 120 },
  };
  vi.spyOn(Element.prototype, 'getBoundingClientRect').mockImplementation(fakeLayout);
});

afterEach(() => {
  vi.restoreAllMocks();
  localStorage.clear();
});

function renderCreator(onDone = () => undefined) {
  render(
    <SystemProvider system={daggerheartSystem}>
      <FrameProvider>
        <CharacterProvider>
          <FrameCreator base={daggerheartTheme} onDone={onDone} />
        </CharacterProvider>
      </FrameProvider>
    </SystemProvider>
  );
  return screen.getByRole('dialog', { name: 'Frame creator' });
}

describe('FrameCreator layout editing', () => {
  it('moves a widget with the arrow keys and saves where it was placed', () => {
    const creator = renderCreator();
    const dice = within(creator).getByRole('button', { name: 'Move Dice' });
    fireEvent.keyDown(dice, { key: 'ArrowUp', shiftKey: true });
    fireEvent.keyDown(dice, { key: 'ArrowRight' });
    fireEvent.click(within(creator).getByRole('button', { name: 'Save frame' }));
    // Center x 240 → 250, top 700 → 650.
    expect(readCustomFrames()[0].regions?.dice).toEqual({ x: 250, y: 650 });
  });

  it('drags a widget, stopping short of the widget in its way', () => {
    const creator = renderCreator();
    const dice = within(creator).getByRole('button', { name: 'Move Dice' });
    fireEvent.pointerDown(dice, { button: 0, clientX: 100, clientY: 500, pointerId: 1 });
    // 300 stage px up would land on the Stats widget, so it doesn't move.
    fireEvent.pointerMove(dice, { clientX: 100, clientY: 500 - 300 * SCALE, pointerId: 1 });
    // 300 stage px right is open space.
    fireEvent.pointerMove(dice, { clientX: 100 + 300 * SCALE, clientY: 500, pointerId: 1 });
    fireEvent.pointerUp(dice, { pointerId: 1 });
    fireEvent.click(within(creator).getByRole('button', { name: 'Save frame' }));
    expect(readCustomFrames()[0].regions?.dice).toEqual({ x: 540, y: 700 });
  });

  it('refuses to save overlapping widgets', () => {
    boxes.dice = { x: 300, y: 200, width: 400, height: 300 };
    const creator = renderCreator();
    expect(within(creator).getByRole('alert')).toHaveTextContent('Stats and Dice overlap');
    expect(within(creator).getByRole('button', { name: 'Save frame' })).toBeDisabled();
  });

  it('closes on Escape without saving', () => {
    const onDone = vi.fn();
    const creator = renderCreator(onDone);
    fireEvent.keyDown(creator, { key: 'Escape' });
    expect(onDone).toHaveBeenCalled();
    expect(readCustomFrames()).toEqual([]);
  });
});
