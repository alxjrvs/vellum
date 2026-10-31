import { useContext } from 'react';
import { CameraContext } from '../camera/CameraContext';
import { cameraQuery } from '../camera/cameraSettings';
import { FrameContext } from '../frames/FrameContext';
import { encodeFrameParam, FRAME_DATA_PARAM } from '../frames/customFrames';

/**
 * Query params that carry this browser's setup into a copied OBS link: one of
 * My frames (which isn't bundled, so the link carries the frame itself) and
 * any camera settings. The frame's id is in the link's path. The OBS source
 * has its own storage, so the link is how it learns them. Empty when there is
 * nothing to carry.
 */
export function useSourceQuery(): string {
  const frame = useContext(FrameContext)?.frame;
  const camera = useContext(CameraContext)?.settings;
  return [
    frame?.origin === 'custom' ? `${FRAME_DATA_PARAM}=${encodeFrameParam(frame)}` : '',
    camera ? cameraQuery(camera) : '',
  ]
    .filter(Boolean)
    .join('&');
}
