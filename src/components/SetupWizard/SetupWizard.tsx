import './SetupWizard.css';
import { useState } from 'react';
import { useCharacter } from '../../character/useCharacter';
import { encodeCharacterToShareParam } from '../../character/shareCode';
import { useSourceQuery } from '../../sourceLink/useSourceQuery';
import { sceneHash } from '../../viewMode/useViewMode';
import { isInsideObs } from './obs';
import { readOnboardedFromStorage, writeOnboardedToStorage } from './storage';

/** The OBS script that builds the Vellum scene and adds the hotkeys. */
const OBS_SCRIPT_URL = 'https://vellumhud.com/downloads/vellum.lua';

/**
 * A non-intrusive, dismissible first-run setup panel. It floats over a corner
 * of the live HUD (never blanking it — safe-mode), and adapts to where it is:
 * a normal browser tab gets the paste-and-play path with an inline copy-link,
 * while the OBS browser source gets only what the OBS script can't do plus a
 * self-test. Confirming or dismissing persists `vellum:onboarded` so it stays
 * closed on reload; a small "Setup help" affordance always reopens it.
 */
export function SetupWizard() {
  const { character } = useCharacter();
  const [open, setOpen] = useState(() => !readOnboardedFromStorage());
  const [copied, setCopied] = useState(false);
  const insideObs = isInsideObs();
  const sourceQuery = useSourceQuery();

  // The share link carries the character in the URL, so build it from the live
  // location at runtime rather than any hardcoded host.
  // The trailing scene hash matters: pasted into an OBS browser source, a
  // hash-less link would land on the scene selector with no way to click past it.
  const shareUrl = character
    ? `${window.location.origin}${window.location.pathname}?c=${encodeCharacterToShareParam(character)}${sourceQuery ? `&${sourceQuery}` : ''}${sceneHash('player')}`
    : null;

  const dismiss = () => {
    writeOnboardedToStorage(true);
    setOpen(false);
  };

  const copyShareLink = () => {
    if (!shareUrl) return;
    void navigator.clipboard.writeText(shareUrl).then(
      () => setCopied(true),
      () => setCopied(false)
    );
  };

  if (!open) {
    return (
      <button type="button" className="setup-help" onClick={() => setOpen(true)}>
        Setup help
      </button>
    );
  }

  return (
    <aside className="setup-wizard" role="dialog" aria-label="Vellum setup">
      <div className="setup-wizard__head">
        <h2 className="setup-wizard__title">Set up Vellum</h2>
        <button
          type="button"
          className="setup-wizard__close"
          onClick={dismiss}
          aria-label="Dismiss setup"
        >
          &times;
        </button>
      </div>

      {insideObs ? (
        <div className="setup-wizard__flow">
          <p className="setup-wizard__lead">
            This page <em>is</em> the HUD source — only the un-scriptable parts are left:
          </p>
          <ol className="setup-wizard__steps">
            <li>
              Used <strong>Set up Vellum</strong> in the Vellum script? Your webcam and the Virtual
              Camera are already on. Otherwise, add your webcam <em>below</em> this source and{' '}
              <strong>Start Virtual Camera</strong>.
            </li>
            <li>
              In Discord, pick <strong>OBS Virtual Camera</strong> under Settings &rarr; Voice &amp;
              Video.
            </li>
          </ol>
          <div className="setup-wizard__selftest">
            <p className="setup-wizard__selftest-q">
              Click one HP pip — did it move on your camera?
            </p>
            <button type="button" className="setup-wizard__done" onClick={dismiss}>
              Yes — confirm
            </button>
          </div>
        </div>
      ) : (
        <div className="setup-wizard__flow">
          <p className="setup-wizard__lead">
            This tab is your control panel. Configure a character, copy its link, and paste it into
            OBS.
          </p>
          <ol className="setup-wizard__steps">
            <li>Configure your character in the details form.</li>
            <li>
              Copy your share link:
              <div className="setup-wizard__copy">
                <button
                  type="button"
                  className="setup-wizard__copy-button"
                  onClick={copyShareLink}
                  disabled={!shareUrl}
                >
                  {copied ? 'Share link copied' : 'Copy share link'}
                </button>
                {!shareUrl && (
                  <span className="setup-wizard__copy-hint">
                    Save a character first to enable this.
                  </span>
                )}
              </div>
            </li>
            <li>
              In OBS, load the <a href={OBS_SCRIPT_URL}>Vellum script</a> under Tools &rarr;
              Scripts.
            </li>
            <li>
              Paste your link into <strong>Your Vellum link</strong>, pick your webcam, and press{' '}
              <strong>Set up Vellum</strong>.
            </li>
            <li>
              In Discord, pick <strong>OBS Virtual Camera</strong> under Settings &rarr; Voice &amp;
              Video.
            </li>
          </ol>
          <button type="button" className="setup-wizard__done" onClick={dismiss}>
            Got it
          </button>
        </div>
      )}

      <p className="setup-wizard__trust">Runs entirely in your browser — nothing is uploaded.</p>
    </aside>
  );
}
