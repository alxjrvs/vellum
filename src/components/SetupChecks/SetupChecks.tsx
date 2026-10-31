import { useEffect, useState, useSyncExternalStore } from 'react';
import { useCameraContext } from '../../camera/useCameraContext';
import type { CameraStatus } from '../../camera/useCamera';
import { deckStatus, subscribeDeckStatus, type DeckStatus } from '../../deck/deckLink';
import {
  OBS_SCRIPT_STALE_MS,
  obsScriptLastSeen,
  subscribeObsScript,
} from '../../obsScript/obsScriptPresence';
import { isInsideObs } from '../SetupWizard/obs';
import './SetupChecks.css';

type CheckState = 'ok' | 'todo' | 'optional' | 'info';

interface Check {
  readonly id: string;
  readonly label: string;
  readonly state: CheckState;
  readonly detail: string;
}

const STATE_TEXT: Record<CheckState, string> = {
  ok: 'Ready',
  todo: 'Needs you',
  optional: 'Optional',
  info: 'Check in OBS',
};

/** Re-render on an interval so a script that went quiet shows as gone. */
function useNow(intervalMs: number): number {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), intervalMs);
    return () => clearInterval(id);
  }, [intervalMs]);
  return now;
}

function cameraCheck(enabled: boolean, status: CameraStatus, insideObs: boolean): Check {
  const label = 'Camera';
  if (!enabled) {
    return {
      id: 'camera',
      label,
      state: 'optional',
      detail: 'Off. Turn it on below to draw your camera and follow your face.',
    };
  }
  switch (status) {
    case 'live':
      return { id: 'camera', label, state: 'ok', detail: 'Vellum is drawing your camera.' };
    case 'starting':
      return { id: 'camera', label, state: 'info', detail: 'Asking for your camera…' };
    case 'blocked':
      return {
        id: 'camera',
        label,
        state: 'todo',
        detail: insideObs
          ? 'OBS refused the camera. Start OBS with --enable-media-stream (see below).'
          : 'Your browser refused the camera. Allow it in the address bar and reload.',
      };
    case 'busy':
      return {
        id: 'camera',
        label,
        state: 'todo',
        detail: 'Another app has the camera. Hide OBS’s Video Capture Device source.',
      };
    case 'missing':
      return {
        id: 'camera',
        label,
        state: 'todo',
        detail: 'No camera found. Plug one in and reload.',
      };
    case 'off':
      return { id: 'camera', label, state: 'info', detail: 'Waiting to start.' };
  }
}

function deckCheck(status: DeckStatus, insideObs: boolean): Check {
  const label = 'Stream Deck plugin';
  if (status === 'linked') {
    return { id: 'deck', label, state: 'ok', detail: 'Connected. Your keys show live values.' };
  }
  if (status === 'off' && !insideObs) {
    return {
      id: 'deck',
      label,
      state: 'info',
      detail: 'Vellum looks for the plugin when it runs inside OBS.',
    };
  }
  return {
    id: 'deck',
    label,
    state: 'optional',
    detail: 'Not found. Install it for keys that show your values.',
  };
}

/**
 * One glance at what's set up and what isn't: OBS, the Vellum OBS script, the
 * camera and the Stream Deck plugin. Each row says what to do next, so setup
 * never has to ask "did that work?".
 */
export function SetupChecks() {
  const insideObs = isInsideObs();
  const camera = useCameraContext();
  const lastSeen = useSyncExternalStore(subscribeObsScript, obsScriptLastSeen);
  const deck = useSyncExternalStore(subscribeDeckStatus, deckStatus);
  const now = useNow(2000);
  const scriptLoaded = lastSeen !== null && now - lastSeen < OBS_SCRIPT_STALE_MS;

  const checks: Check[] = [
    insideObs
      ? {
          id: 'obs',
          label: 'OBS',
          state: 'ok',
          detail: 'This page is running in an OBS browser source.',
        }
      : {
          id: 'obs',
          label: 'OBS',
          state: 'info',
          detail:
            'This is a browser tab. Copy your link into OBS, then open setup there to check the rest.',
        },
    scriptLoaded
      ? {
          id: 'script',
          label: 'Vellum OBS script',
          state: 'ok',
          detail: 'Loaded. Hotkeys reach this HUD.',
        }
      : insideObs
        ? {
            id: 'script',
            label: 'Vellum OBS script',
            state: 'todo',
            detail: 'Not heard yet. In OBS, open Tools → Scripts and add vellum.lua.',
          }
        : {
            id: 'script',
            label: 'Vellum OBS script',
            state: 'info',
            detail: 'Only OBS can run it.',
          },
    ...(camera ? [cameraCheck(camera.settings.camera, camera.camera.status, insideObs)] : []),
    deckCheck(deck, insideObs),
  ];

  return (
    <section className="setup-checks" aria-label="Setup checks">
      <h2 className="setup-checks__heading">Setup checks</h2>
      <ul className="setup-checks__list">
        {checks.map((check) => (
          <li key={check.id} className="setup-checks__row" data-state={check.state}>
            <span className="setup-checks__label">{check.label}</span>
            <span className="setup-checks__state">{STATE_TEXT[check.state]}</span>
            <span className="setup-checks__detail">{check.detail}</span>
          </li>
        ))}
      </ul>
      <p className="setup-checks__more">
        Step by step: <a href="https://vellumhud.com/docs/obs/">OBS setup guide</a>.
      </p>
    </section>
  );
}
