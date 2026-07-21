import './GmSetup.css';
import { useState } from 'react';
import { useSystem } from '../../systems/useSystem';
import { sceneHash } from '../../viewMode/useViewMode';

interface GmSetupProps {
  readonly onLaunch: () => void;
}

/**
 * The GM scene's setup step. A GM has nothing to configure — no character, no
 * slot counts — so this is the how-to half of the setup → launch pattern:
 * what the screen shows, how to drive it during play, and how to get it into
 * OBS. Launching persists, so a reload goes straight to the live view.
 */
export function GmSetup({ onLaunch }: GmSetupProps) {
  const system = useSystem();
  const [copied, setCopied] = useState(false);

  const copyScreenLink = () => {
    const url = `${window.location.origin}${window.location.pathname}${sceneHash('gm')}`;
    void navigator.clipboard.writeText(url).then(
      () => setCopied(true),
      () => setCopied(false)
    );
  };

  return (
    <section className="gm-setup" aria-label="GM screen setup">
      <h1 className="gm-setup__title">GM screen</h1>
      <p className="gm-setup__lede">
        Nothing to configure — this screen tracks the table&rsquo;s Fear, not a character.
      </p>

      <h2 className="gm-setup__heading">What you&rsquo;ll see</h2>
      <ul className="gm-setup__list">
        <li>
          <strong>The Fear pool</strong> — a {system.fear.max}-pip track, the table&rsquo;s shared
          Fear.
        </li>
        <li>
          <strong>The Duality Dice roller</strong> — the same roller the players have.
        </li>
        <li>
          <strong>The ticker</strong> — the editable banner shared with every screen.
        </li>
      </ul>

      <h2 className="gm-setup__heading">During play</h2>
      <ul className="gm-setup__list">
        <li>
          Click a pip to fill the track up to it; click the topmost filled pip to step back down.
        </li>
        <li>
          Or use the <strong>&minus;</strong> / <strong>+</strong> stepper for single steps. Fear
          stops at 0 and at {system.fear.max}.
        </li>
        <li>
          A roll <em>with Fear</em> gains you a Fear; Vellum reports the dice but never moves the
          track for you.
        </li>
        <li>Your Fear is saved continuously — a reload restores it within about a second.</li>
      </ul>

      <h2 className="gm-setup__heading">Get it onto your camera</h2>
      <ol className="gm-setup__steps">
        <li>
          Copy this screen&rsquo;s address:
          <div className="gm-setup__copy">
            <button type="button" className="gm-setup__copy-button" onClick={copyScreenLink}>
              {copied ? 'Link copied' : 'Copy GM screen link'}
            </button>
          </div>
        </li>
        <li>
          In OBS, add a <strong>Browser Source</strong> with that URL (1920&times;1080).
        </li>
        <li>
          Add your webcam as a <strong>Video Capture Device</strong> ordered <em>below</em> the HUD
          source.
        </li>
        <li>
          <strong>Start Virtual Camera</strong>, then pick <strong>OBS Virtual Camera</strong> in
          Discord under Settings &rarr; Voice &amp; Video.
        </li>
      </ol>

      <button type="button" className="gm-setup__launch" onClick={onLaunch}>
        Launch GM screen
      </button>
      <p className="gm-setup__note">
        You can come back to this page anytime with <strong>Setup</strong> on the live screen. The
        OBS browser source skips straight to the live view.
      </p>
    </section>
  );
}
