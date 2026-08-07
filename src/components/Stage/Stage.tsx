import type { CSSProperties, ReactNode } from 'react';
import './Stage.css';
import { STAGE_HEIGHT, STAGE_WIDTH } from './stageScale';
import { useStageScale } from './useStageScale';

interface StageProps {
  children: ReactNode;
}

/**
 * The 1920x1080 design canvas, scaled to fit whatever viewport it lands in.
 *
 * Everything inside is authored in canvas pixels — the HUD's corner anchors,
 * the type scale, the pip sizes — so the canvas keeps its exact dimensions and
 * the *whole frame* is scaled instead. A browser source of any size therefore
 * shows the entire HUD at the right proportions, rather than a clipped slice of
 * a 1920-wide layout.
 */
export function Stage({ children }: StageProps) {
  const scale = useStageScale();
  const style = {
    width: `${STAGE_WIDTH}px`,
    height: `${STAGE_HEIGHT}px`,
    transform: `translate(-50%, -50%) scale(${scale})`,
  } satisfies CSSProperties;

  return (
    <div className="vellum-stage" style={style}>
      {children}
    </div>
  );
}
