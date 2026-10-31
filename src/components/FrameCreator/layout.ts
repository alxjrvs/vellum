import {
  HUD_WIDGET_LABELS,
  RESERVED_AREAS,
  STAGE_HEIGHT,
  STAGE_WIDTH,
  rectsOverlap,
  type HudPoint,
  type HudWidget,
  type StageRect,
} from '../../themes/regions';

/** Dragged widgets snap to this grid, in stage px. */
export const GRID = 10;

export type WidgetRects = Partial<Record<HudWidget, StageRect>>;

const snap = (n: number) => Math.round(n / GRID) * GRID;

/** Snap a widget's center and top to the grid, and keep it on the stage. */
export function snapToStage(rect: StageRect): StageRect {
  const x = snap(rect.x + rect.width / 2) - rect.width / 2;
  return {
    ...rect,
    x: Math.min(Math.max(x, 0), STAGE_WIDTH - rect.width),
    y: Math.min(Math.max(snap(rect.y), 0), STAGE_HEIGHT - rect.height),
  };
}

/** The boxes a widget must stay clear of: the other widgets and the reserved areas. */
export function obstaclesFor(widget: HudWidget, rects: WidgetRects): StageRect[] {
  return [
    ...RESERVED_AREAS,
    ...(Object.entries(rects) as [HudWidget, StageRect][])
      .filter(([w]) => w !== widget)
      .map(([, r]) => r),
  ];
}

/**
 * Where a widget lands when it is moved from `current` toward `desired`. If the
 * spot is taken it slides along whichever axis is still free, and if neither
 * is, it stays put. Widgets never overlap each other or a reserved area.
 */
export function placeRect(
  current: StageRect,
  desired: StageRect,
  obstacles: readonly StageRect[]
): StageRect {
  const target = snapToStage(desired);
  const candidates = [
    target,
    snapToStage({ ...target, y: current.y }),
    snapToStage({ ...target, x: current.x }),
  ];
  return (
    candidates.find((c) => !obstacles.some((o) => rectsOverlap(c, o))) ??
    // Already overlapping (say a widget grew): let it move anywhere free of
    // what it doesn't already touch, so it can be dragged out.
    candidates.find((c) =>
      obstacles.every((o) => rectsOverlap(current, o) || !rectsOverlap(c, o))
    ) ??
    current
  );
}

/** The point a frame stores for a widget's box: its center and top edge. */
export function toPoint(rect: StageRect): HudPoint {
  return { x: Math.round(rect.x + rect.width / 2), y: Math.round(rect.y) };
}

/** Every pair of widgets, or widget and reserved area, whose boxes overlap. */
export function findOverlaps(rects: WidgetRects): string[] {
  const entries = Object.entries(rects) as [HudWidget, StageRect][];
  const problems: string[] = [];
  entries.forEach(([a, ra], i) => {
    for (const [b, rb] of entries.slice(i + 1)) {
      if (rectsOverlap(ra, rb)) {
        problems.push(`${HUD_WIDGET_LABELS[a]} and ${HUD_WIDGET_LABELS[b]} overlap`);
      }
    }
    for (const area of RESERVED_AREAS) {
      if (rectsOverlap(ra, area)) {
        problems.push(`${HUD_WIDGET_LABELS[a]} covers the ${area.label.toLowerCase()}`);
      }
    }
  });
  return problems;
}
