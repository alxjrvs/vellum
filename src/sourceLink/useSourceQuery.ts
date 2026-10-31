import { useContext } from 'react';
import { CameraContext } from '../camera/CameraContext';
import { cameraQuery } from '../camera/cameraSettings';
import { FrameContext } from '../frames/FrameContext';
import { FRAME_QUERY_PARAM } from '../frames/frameStorage';

/**
 * Query params that carry this browser's setup into a copied OBS link: the
 * active frame and any camera settings. The OBS source has its own storage,
 * so the link is how it learns them. Empty when there is nothing to carry.
 */
export function useSourceQuery(): string {
  const frameId = useContext(FrameContext)?.frame.id;
  const camera = useContext(CameraContext)?.settings;
  return [
    frameId ? `${FRAME_QUERY_PARAM}=${encodeURIComponent(frameId)}` : '',
    camera ? cameraQuery(camera) : '',
  ]
    .filter(Boolean)
    .join('&');
}
