import {
  useCallback,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent,
  type PointerEvent,
} from 'react';
import { CharacterContext } from '../../character/CharacterContext';
import { makeCharacter } from '../../character/fixtures';
import { useCharacter } from '../../character/useCharacter';
import { themeToCssVars } from '../../themes/cssVars';
import { ThemeContext } from '../../themes/ThemeContext';
import {
  HUD_WIDGET_LABELS,
  HUD_WIDGETS,
  RESERVED_AREAS,
  STAGE_WIDTH,
  type HudPoint,
  type HudWidget,
  type StageRect,
} from '../../themes/regions';
import type { ThemeConfig } from '../../themes/types';
import { DiceRoller } from '../DiceRoller';
import { HudRegion } from '../HudRegion';
import { ConditionsPanel, IdentityLabel, PlayerHud } from '../PlayerHud';
import { GRID, obstaclesFor, placeRect, toPoint, type WidgetRects } from './layout';
import './FramePreview.css';

const SAMPLE = makeCharacter({
  stats: { hope: 3, hp: [0, 1], stress: [0], armorSlots: [0] },
});

const KEY_STEPS: Record<string, [number, number]> = {
  ArrowLeft: [-1, 0],
  ArrowRight: [1, 0],
  ArrowUp: [0, -1],
  ArrowDown: [0, 1],
};

const sameRect = (a: StageRect | undefined, b: StageRect) =>
  !!a && a.x === b.x && a.y === b.y && a.width === b.width && a.height === b.height;

const boxStyle = (r: StageRect): CSSProperties => ({
  left: r.x,
  top: r.y,
  width: r.width,
  height: r.height,
});

interface FramePreviewProps {
  readonly frame: ThemeConfig;
  /** How far the 1920×1080 stage is shrunk. Defaults to 0.5. */
  readonly scale?: number;
  /** Each widget's measured box on the stage, owned by the caller. */
  readonly rects?: WidgetRects;
  readonly onMeasure?: (rects: WidgetRects) => void;
  /**
   * A widget was dragged (or nudged with the arrow keys) to a new spot. Leave
   * it out for a still preview, such as a thumbnail.
   */
  readonly onPlace?: (widget: HudWidget, point: HudPoint) => void;
}

const NO_RECTS: WidgetRects = {};

interface Drag {
  readonly widget: HudWidget;
  readonly pointerX: number;
  readonly pointerY: number;
  readonly start: StageRect;
  current: StageRect;
}

/**
 * The real HUD widgets wearing a frame on a scaled-down 1920×1080 stage. The
 * frame's tokens are scoped to the preview, so the rest of the page keeps the
 * active frame.
 *
 * Given `onPlace`, it is the frame editor's canvas: drag a widget to move it,
 * or select it and use the arrow keys. It snaps to a grid and stops at
 * anything in its way, so widgets never overlap each other, the ticker or the
 * Setup button.
 */
export function FramePreview({
  frame,
  scale,
  rects = NO_RECTS,
  onMeasure,
  onPlace,
}: FramePreviewProps) {
  const editable = onPlace !== undefined;
  const { character } = useCharacter();
  const stageRef = useRef<HTMLDivElement>(null);
  const drag = useRef<Drag | null>(null);
  const rectsRef = useRef(rects);
  rectsRef.current = rects;
  const [selected, setSelected] = useState<HudWidget | null>(null);
  const style = themeToCssVars(frame) as CSSProperties;
  const figureStyle =
    scale === undefined ? undefined : ({ '--preview-scale': scale } as CSSProperties);

  const measure = useCallback(() => {
    const stage = stageRef.current;
    if (!stage || !onMeasure) return;
    const box = stage.getBoundingClientRect();
    if (box.width === 0) return;
    const scale = box.width / STAGE_WIDTH;
    const next: Record<string, StageRect> = {};
    let changed = false;
    for (const widget of HUD_WIDGETS) {
      const el = stage.querySelector(`.hud__region--${widget}`);
      if (!el) continue;
      const r = el.getBoundingClientRect();
      const rect = {
        x: Math.round((r.left - box.left) / scale),
        y: Math.round((r.top - box.top) / scale),
        width: Math.round(r.width / scale),
        height: Math.round(r.height / scale),
      };
      next[widget] = rect;
      if (!sameRect(rectsRef.current[widget], rect)) changed = true;
    }
    if (changed) onMeasure(next);
  }, [onMeasure]);

  // Re-measure after every render (a frame change can resize a widget) and
  // whenever a widget resizes on its own, such as when a font loads.
  useLayoutEffect(measure);
  useLayoutEffect(() => {
    const stage = stageRef.current;
    if (!stage || !onMeasure || typeof ResizeObserver === 'undefined') return;
    const observer = new ResizeObserver(measure);
    stage.querySelectorAll('.hud__region').forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [measure, onMeasure]);

  const moveTo = (widget: HudWidget, current: StageRect, desired: StageRect) => {
    const next = placeRect(current, desired, obstaclesFor(widget, rectsRef.current));
    if (!sameRect(current, next)) onPlace?.(widget, toPoint(next));
    return next;
  };

  const onPointerDown = (e: PointerEvent<HTMLButtonElement>, widget: HudWidget) => {
    const rect = rects[widget];
    if (!rect || e.button !== 0) return;
    e.currentTarget.setPointerCapture?.(e.pointerId);
    drag.current = { widget, pointerX: e.clientX, pointerY: e.clientY, start: rect, current: rect };
    setSelected(widget);
  };

  const onPointerMove = (e: PointerEvent<HTMLButtonElement>) => {
    const d = drag.current;
    const stage = stageRef.current;
    if (!d || !stage) return;
    const scale = stage.getBoundingClientRect().width / STAGE_WIDTH || 1;
    const desired = {
      ...d.start,
      x: d.start.x + (e.clientX - d.pointerX) / scale,
      y: d.start.y + (e.clientY - d.pointerY) / scale,
    };
    d.current = moveTo(d.widget, d.current, desired);
  };

  const endDrag = () => {
    drag.current = null;
  };

  const onKeyDown = (e: KeyboardEvent<HTMLButtonElement>, widget: HudWidget) => {
    const step = KEY_STEPS[e.key];
    const rect = rects[widget];
    if (!step || !rect) return;
    e.preventDefault();
    const by = (e.shiftKey ? 5 : 1) * GRID;
    moveTo(widget, rect, { ...rect, x: rect.x + step[0] * by, y: rect.y + step[1] * by });
  };

  return (
    <figure className="frame-preview" style={figureStyle}>
      <div className="frame-preview__tile">
        <div className="frame-preview__stage" style={style} ref={stageRef}>
          <div className="frame-preview__hud" aria-hidden="true" inert>
            <ThemeContext.Provider value={frame}>
              <CharacterContext.Provider
                value={{ character: character ?? SAMPLE, dispatch: () => undefined }}
              >
                <div className="hud">
                  <HudRegion widget="vitals">
                    <PlayerHud />
                  </HudRegion>
                  <HudRegion widget="status">
                    <ConditionsPanel />
                  </HudRegion>
                  <HudRegion widget="dice">
                    <DiceRoller />
                  </HudRegion>
                  <HudRegion widget="name">
                    <IdentityLabel />
                  </HudRegion>
                </div>
              </CharacterContext.Provider>
            </ThemeContext.Provider>
          </div>

          {editable &&
            RESERVED_AREAS.map((area) => (
              <div key={area.label} className="frame-preview__reserved" style={boxStyle(area)}>
                {area.label}
              </div>
            ))}

          {editable &&
            HUD_WIDGETS.map((widget) => {
              const rect = rects[widget];
              return (
                <button
                  key={widget}
                  type="button"
                  className="frame-preview__handle"
                  style={rect ? boxStyle(rect) : undefined}
                  aria-label={`Move ${HUD_WIDGET_LABELS[widget]}`}
                  aria-pressed={selected === widget}
                  data-edge={rect && rect.y < 60 ? 'top' : undefined}
                  onFocus={() => setSelected(widget)}
                  onPointerDown={(e) => onPointerDown(e, widget)}
                  onPointerMove={onPointerMove}
                  onPointerUp={endDrag}
                  onPointerCancel={endDrag}
                  onKeyDown={(e) => onKeyDown(e, widget)}
                >
                  <span className="frame-preview__handle-label">{HUD_WIDGET_LABELS[widget]}</span>
                </button>
              );
            })}
        </div>
      </div>
      {editable && (
        <figcaption className="frame-preview__caption">
          Drag a widget to move it, or select it and use the arrow keys. Widgets can’t overlap.
        </figcaption>
      )}
    </figure>
  );
}
