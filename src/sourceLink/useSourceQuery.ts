import { useContext } from 'react';
import { CameraContext } from '../camera/CameraContext';
import { cameraQuery } from '../camera/cameraSettings';
import { FrameContext } from '../frames/FrameContext';
import { FRAME_QUERY_PARAM } from '../frames/frameStorage';
import { encodeFrameParam, FRAME_DATA_PARAM } from '../frames/customFrames';

/**
 * Query params that carry this browser's setup into a copied OBS link: the
 * active frame (and, for one of My frames, the frame itself) and any camera
 * settings. The OBS source has its own storage,
 * so the link is how it learns them. Empty when there is nothing to carry.
 */
export function useSourceQuery(): string {
  const frame = useContext(FrameContext)?.frame;
  const camera = useContext(CameraContext)?.settings;
  return [
    frame ? `${FRAME_QUERY_PARAM}=${encodeURIComponent(frame.id)}` : '',
    // One of My frames isn't bundled, so the link carries the frame itself.
    frame?.origin === 'custom' ? `${FRAME_DATA_PARAM}=${encodeFrameParam(frame)}` : '',
    camera ? cameraQuery(camera) : '',
  ]
    .filter(Boolean)
    .join('&');
}
