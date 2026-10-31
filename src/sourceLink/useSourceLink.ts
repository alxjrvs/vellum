import { useContext } from 'react';
import { FrameContext } from '../frames/FrameContext';
import { FRAME_LIBRARY } from '../frames/library';
import { frameUrl } from '../routes/frameRoute';
import type { FrameKind } from '../themes/types';
import { useSourceQuery } from './useSourceQuery';

/**
 * The link to paste into OBS: the address of the frame being worn, with this
 * browser's setup in the query (see useSourceQuery) and any `extra` params
 * first. If the worn frame shows a different screen than `kind`, it links the
 * first official frame of that kind.
 */
export function useSourceLink(kind: FrameKind, extra = ''): string {
  const worn = useContext(FrameContext)?.frame;
  const sourceQuery = useSourceQuery();
  const frame =
    worn?.kind === kind ? worn : (FRAME_LIBRARY.find((f) => f.kind === kind) ?? FRAME_LIBRARY[0]);
  return frameUrl(frame.id, [extra, sourceQuery].filter(Boolean).join('&'));
}
