import { useEffect, useState } from 'react';
import { useCameraContext } from '../../camera/useCameraContext';
import type { CameraStatus } from '../../camera/useCamera';
import { isInsideObs } from '../SetupWizard/obs';
import './CameraSetup.css';

const STATUS_TEXT: Record<CameraStatus, string> = {
  off: 'Camera off.',
  starting: 'Asking for your camera…',
  live: 'Camera on.',
  blocked: 'Camera access was refused.',
  busy: 'Your camera is in use by another app.',
  missing: 'No camera found.',
};

/**
 * Opt-in camera and face tracking. With the camera on, Vellum draws your
 * webcam itself (replacing OBS's Video Capture Device), which is what lets
 * widgets follow your face.
 */
export function CameraSetup() {
  const ctx = useCameraContext();
  if (!ctx) return null;
  const { settings, update, camera } = ctx;
  const insideObs = isInsideObs();

  return (
    <section className="camera-setup" aria-label="Camera and face tracking">
      <h2 className="camera-setup__heading">Camera and face tracking</h2>
      <p className="camera-setup__lede">
        Optional. Vellum can draw your webcam itself, so widgets can follow your face: your
        conditions above your head, your nameplate under your chin. Everything runs on this
        computer. No picture ever leaves it.
      </p>

      <label className="camera-setup__toggle">
        <input
          type="checkbox"
          checked={settings.camera}
          onChange={(e) =>
            update({ camera: e.target.checked, ...(e.target.checked ? {} : { followFace: false }) })
          }
        />
        Draw my camera in Vellum
      </label>
      <label className="camera-setup__toggle">
        <input
          type="checkbox"
          checked={settings.followFace}
          disabled={!settings.camera}
          onChange={(e) => update({ followFace: e.target.checked })}
        />
        Widgets follow my face
      </label>
      <label className="camera-setup__toggle">
        <input
          type="checkbox"
          checked={settings.mirror}
          disabled={!settings.camera}
          onChange={(e) => update({ mirror: e.target.checked })}
        />
        Mirror (selfie view)
      </label>

      <p className="camera-setup__status" role="status">
        {STATUS_TEXT[camera.status]}
      </p>
      {camera.status === 'live' && camera.stream && (
        <Preview stream={camera.stream} mirror={settings.mirror} />
      )}

      {settings.camera && (
        <div className="camera-setup__help">
          {camera.status === 'busy' && (
            <p>
              Close other apps using the camera. In OBS, hide or delete the{' '}
              <strong>Video Capture Device</strong> source: Vellum draws the camera now.
            </p>
          )}
          {camera.status === 'blocked' && insideObs && <ObsLaunchFlag />}
          {camera.status === 'blocked' && !insideObs && (
            <p>
              Allow camera access for this site in your browser&rsquo;s address bar, then reload.
            </p>
          )}
          {camera.status === 'live' && (
            <p>
              In OBS, remove or hide the <strong>Video Capture Device</strong> source; the Vellum
              browser source now carries your camera. Copy your link again so OBS gets these
              settings.
            </p>
          )}
        </div>
      )}
    </section>
  );
}

function ObsLaunchFlag() {
  return (
    <>
      <p>
        OBS only lets a browser source use the camera when it starts with{' '}
        <code>--enable-media-stream</code>. Quit OBS, then start it like this:
      </p>
      <ul className="camera-setup__flags">
        <li>
          <strong>Windows:</strong> right-click the OBS shortcut, Properties, and add{' '}
          <code>--enable-media-stream</code> to the end of Target.
        </li>
        <li>
          <strong>macOS:</strong> <code>open -a OBS --args --enable-media-stream</code>
        </li>
        <li>
          <strong>Linux:</strong> <code>obs --enable-media-stream</code>
        </li>
      </ul>
    </>
  );
}

function Preview({ stream, mirror }: { stream: MediaStream; mirror: boolean }) {
  const [el, setEl] = useState<HTMLVideoElement | null>(null);
  useEffect(() => {
    if (el) el.srcObject = stream;
  }, [el, stream]);
  return (
    <video
      ref={setEl}
      className="camera-setup__preview"
      data-mirror={mirror ? 'on' : undefined}
      autoPlay
      muted
      playsInline
      aria-label="Camera preview"
    />
  );
}
