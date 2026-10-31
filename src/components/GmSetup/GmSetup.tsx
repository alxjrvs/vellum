import './GmSetup.css';
import { useState } from 'react';
import { useSystem } from '../../systems/useSystem';
import { useSourceQuery } from '../../sourceLink/useSourceQuery';
import { sceneUrl } from '../../viewMode/useViewMode';
import { OBS_SCRIPT_URL } from '../SetupWizard/obs';

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
  const sourceQuery = useSourceQuery();
  const [copied, setCopied] = useState(false);

  const copyScreenLink = () => {
    const url = sceneUrl('gm', sourceQuery);
    void navigator.clipboard.writeText(url).then(
      () => setCopied(true),
      () => setCopied(false)
    );
  };

  return (
    <section className="gm-setup" aria-label="GM screen setup">
      <h1 className="gm-setup__title">GM screen</h1>
      <p className="gm-setup__lede">
        Nothing to configure: this screen tracks the table&rsquo;s Fear, not a character.
      </p>

      <h2 className="gm-setup__heading">What you&rsquo;ll see</h2>
      <ul className="gm-setup__list">
        <li>
          <strong>Fear</strong>, a {system.fear.max}-pip track. Click a pip to fill up to it, or use{' '}
          <strong>&minus;</strong> / <strong>+</strong>. A roll <em>with Fear</em> never moves it
          for you.
        </li>
        <li>
          <strong>The Duality Dice</strong> and <strong>the ticker</strong>, shared with every
          screen.
        </li>
      </ul>

      <h2 className="gm-setup__heading">Get it onto your camera</h2>
      <ol className="gm-setup__steps">
        <li>
          <button type="button" className="gm-setup__copy-button" onClick={copyScreenLink}>
            {copied ? 'Link copied' : 'Copy GM screen link'}
          </button>
        </li>
        <li>
          In OBS, load the <a href={OBS_SCRIPT_URL}>Vellum script</a> under Tools &rarr; Scripts.
        </li>
        <li>
          Paste the link into <strong>Your Vellum link</strong>, pick your webcam, and press{' '}
          <strong>Set up Vellum</strong>.
        </li>
        <li>
          In Discord, pick <strong>OBS Virtual Camera</strong> under Settings &rarr; Voice &amp;
          Video.
        </li>
      </ol>

      <button type="button" className="gm-setup__launch" onClick={onLaunch}>
        Launch GM screen
      </button>
      <p className="gm-setup__note">
        <strong>Setup</strong> on the live screen brings you back here. OBS skips straight to the
        live view.
      </p>
    </section>
  );
}
