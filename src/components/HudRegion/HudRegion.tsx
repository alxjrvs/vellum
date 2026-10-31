import { useContext, type ReactNode } from 'react';
import { ThemeContext } from '../../themes/ThemeContext';
import { isRightSlot, regionsFor, type HudWidget } from '../../themes/regions';

/**
 * A widget's spot on the stage, chosen by the frame. Right-hand slots carry
 * data-side="right" so the widget mirrors and its labels read outside-in.
 */
export function HudRegion({ widget, children }: { widget: HudWidget; children: ReactNode }) {
  const slot = regionsFor(useContext(ThemeContext))[widget];
  return (
    <div
      className={`hud__region hud__region--${widget}`}
      data-slot={slot}
      data-side={isRightSlot(slot) ? 'right' : undefined}
    >
      {children}
    </div>
  );
}
