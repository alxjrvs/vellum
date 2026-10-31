import { useEffect, useState, type CSSProperties, type ReactNode } from 'react';
import { useCameraContext } from '../../camera/useCameraContext';
import { useFaceAnchors } from '../../tracking/useFaceAnchors';
import './CameraHud.css';

interface CameraHudProps {
  readonly children: ReactNode;
  readonly 'data-view'?: string;
}

/**
 * The live HUD surface. With the camera on, Vellum draws the webcam behind
 * the widgets; with face tracking on, face-anchored widgets (the nameplate,
 * the conditions) follow the face. With both off it is the plain transparent
 * HUD that sits over OBS's own camera source.
 */
export function CameraHud({ children, ...rest }: CameraHudProps) {
  const ctx = useCameraContext();
  const [video, setVideo] = useState<HTMLVideoElement | null>(null);
  const stream = ctx?.camera.status === 'live' ? ctx.camera.stream : null;
  const mirror = ctx?.settings.mirror ?? true;
  const { status: tracking, anchors } = useFaceAnchors(
    video,
    !!stream && (ctx?.settings.followFace ?? false),
    mirror
  );

  const style = anchors
    ? ({
        '--anchor-crown-x': anchors.crown.x,
        '--anchor-crown-y': anchors.crown.y,
        '--anchor-chin-x': anchors.chin.x,
        '--anchor-chin-y': anchors.chin.y,
      } as CSSProperties)
    : undefined;

  return (
    <main
      className="hud"
      data-camera={stream ? 'on' : undefined}
      data-follow-face={anchors ? 'on' : undefined}
      data-tracking={tracking === 'off' ? undefined : tracking}
      style={style}
      {...rest}
    >
      {stream && <CameraBackdrop stream={stream} mirror={mirror} onVideo={setVideo} />}
      {children}
    </main>
  );
}

function CameraBackdrop({
  stream,
  mirror,
  onVideo,
}: {
  stream: MediaStream;
  mirror: boolean;
  onVideo: (video: HTMLVideoElement | null) => void;
}) {
  const [el, setEl] = useState<HTMLVideoElement | null>(null);
  useEffect(() => {
    if (!el) return;
    el.srcObject = stream;
    onVideo(el);
    return () => onVideo(null);
  }, [el, stream, onVideo]);
  return (
    <video
      ref={setEl}
      className="camera-backdrop"
      data-mirror={mirror ? 'on' : undefined}
      autoPlay
      muted
      playsInline
      aria-hidden="true"
    />
  );
}
