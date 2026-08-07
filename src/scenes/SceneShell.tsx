import { useState, type ReactNode } from 'react';
import { isInsideObs } from '../components/SetupWizard/obs';
import { readLaunchedFromStorage, writeLaunchedToStorage } from './launchStorage';
import type { ViewMode } from '../viewMode/useViewMode';

interface SetupRenderProps {
  /** Persist the launch and switch to the live scene. */
  readonly launch: () => void;
  /** False while the scene still needs configuration (a player without a character). */
  readonly canLaunch: boolean;
}

interface LiveRenderProps {
  /** Return to the setup view without un-launching the scene. */
  readonly edit: () => void;
}

interface SceneShellProps {
  readonly scene: ViewMode;
  /**
   * Whether the scene has everything it needs to render live. The player scene
   * needs a character; the GM scene needs nothing.
   */
  readonly canLaunch: boolean;
  /** Launch state to assume when the scene has never recorded one. */
  readonly defaultLaunched: boolean;
  readonly renderSetup: (props: SetupRenderProps) => ReactNode;
  readonly renderLive: (props: LiveRenderProps) => ReactNode;
}

/**
 * Every scene follows the same lifecycle: **setup → launch → live**, with an
 * "edit" path back to setup. This shell owns that lifecycle so each scene only
 * supplies its own two views and a readiness rule.
 *
 * Inside the OBS browser source the *launch gate* is skipped: that source is
 * non-interactive by default, so making a launched-elsewhere scene wait for a
 * click there would strand a setup page on a live camera.
 *
 * Only the launch gate, though — an explicit *edit* still opens setup inside
 * OBS. Skipping that too made "Edit details" (and the GM's "Setup") dead
 * buttons in the one place the browser source is being interacted with, which
 * is precisely the case where the operator does want setup. Nothing gets
 * stranded: setup only appears after a deliberate click, and every setup view
 * has its own way back to live.
 *
 * Readiness still applies inside OBS, so this is not an absolute guarantee: a
 * player scene with no character has nothing to render and stays on setup even
 * in OBS. That carve-out is deliberate — the alternative is a blank HUD — and
 * the paste-and-play onramp avoids it by carrying the character in the URL.
 */
export function SceneShell({
  scene,
  canLaunch,
  defaultLaunched,
  renderSetup,
  renderLive,
}: SceneShellProps) {
  const [launched, setLaunched] = useState(() => readLaunchedFromStorage(scene) ?? defaultLaunched);
  const [editing, setEditing] = useState(false);

  const launch = () => {
    writeLaunchedToStorage(scene, true);
    setLaunched(true);
    setEditing(false);
  };

  // `editing` is checked outside the OBS branch so that an explicit edit wins
  // everywhere; OBS only bypasses `launched`.
  const showLive = canLaunch && !editing && (isInsideObs() || launched);

  return showLive
    ? renderLive({ edit: () => setEditing(true) })
    : renderSetup({ launch, canLaunch });
}
