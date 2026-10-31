import { useContext } from 'react';
import { FrameContext } from './FrameContext';
import { FRAME_QUERY_PARAM } from './frameStorage';

/**
 * `frame=<id>` for the active frame, to put in a copied OBS link so the
 * source wears the frame picked here. Empty outside a FrameProvider.
 */
export function useFrameQuery(): string {
  const id = useContext(FrameContext)?.frame.id;
  return id ? `${FRAME_QUERY_PARAM}=${encodeURIComponent(id)}` : '';
}
