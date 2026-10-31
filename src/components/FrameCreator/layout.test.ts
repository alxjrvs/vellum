import { describe, expect, it } from 'vitest';
import { RESERVED_AREAS } from '../../themes/regions';
import { findOverlaps, obstaclesFor, placeRect, snapToStage, toPoint } from './layout';

const box = (x: number, y: number, width = 200, height = 100) => ({ x, y, width, height });

describe('frame editor layout', () => {
  it('snaps the center and top to the grid and keeps the widget on the stage', () => {
    expect(snapToStage(box(103, 47))).toEqual(box(100, 50));
    expect(snapToStage(box(-80, -30))).toEqual(box(0, 0));
    expect(snapToStage(box(1800, 1050))).toEqual(box(1720, 980));
  });

  it('moves freely into open space', () => {
    expect(placeRect(box(100, 300), box(400, 500), [])).toEqual(box(400, 500));
  });

  it('never moves onto another widget, sliding along the free axis instead', () => {
    const other = box(500, 300);
    // Straight onto the other widget: blocked on both axes, stays put.
    expect(placeRect(box(100, 300), box(500, 300), [other])).toEqual(box(100, 300));
    // Diagonally up into it from below: rising is blocked, so it slides across only.
    expect(placeRect(box(250, 500), box(450, 350), [other])).toEqual(box(450, 500));
  });

  it('keeps clear of the ticker and the Setup button', () => {
    const [ticker] = RESERVED_AREAS;
    const placed = placeRect(box(100, 0), box(ticker.x, 0), obstaclesFor('dice', {}));
    expect(placed).toEqual(box(100, 0));
  });

  it('lets an already-overlapping widget be dragged out', () => {
    const other = box(150, 300);
    expect(placeRect(box(100, 300), box(100, 600), [other])).toEqual(box(100, 600));
  });

  it('stores the center and top of the box', () => {
    expect(toPoint(box(100, 50, 301, 20))).toEqual({ x: 251, y: 50 });
  });

  it('reports overlapping widgets and covered reserved areas', () => {
    expect(
      findOverlaps({ dice: box(0, 600), vitals: box(100, 650), name: box(1600, 1000) })
    ).toEqual(['Dice and Stats overlap', 'Nameplate covers the setup button']);
    expect(findOverlaps({ dice: box(0, 600), vitals: box(300, 600) })).toEqual([]);
  });
});
