import { useContext, type CSSProperties, type ReactNode } from 'react';
import { ThemeContext } from '../../themes/ThemeContext';
import { isPoint, isRightPlacement, regionsFor, type HudWidget } from '../../themes/regions';

/**
 * A widget's spot on the stage, chosen by the frame: a named slot, or a point
 * placed in the frame editor. Right-hand widgets carry data-side="right" so
 * they mirror and their labels read outside-in.
 */
export function HudRegion({ widget, children }: { widget: HudWidget; children: ReactNode }) {
  const placement = regionsFor(useContext(ThemeContext))[widget];
  const point = isPoint(placement) ? placement : null;
  return (
    <div
      className={`hud__region hud__region--${widget}`}
      data-slot={point ? 'free' : placement}
      data-side={isRightPlacement(placement) ? 'right' : undefined}
      style={
        point
          ? ({ '--region-x': `${point.x}px`, '--region-y': `${point.y}px` } as CSSProperties)
          : undefined
      }
    >
      {children}
    </div>
  );
}
