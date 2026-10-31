import './SetupWizard.css';
import { useState } from 'react';
import { useCharacter } from '../../character/useCharacter';
import { encodeCharacterToShareParam } from '../../character/shareCode';
import { useSourceLink } from '../../sourceLink/useSourceLink';
import { isInsideObs, OBS_SCRIPT_URL } from './obs';
import { readOnboardedFromStorage, writeOnboardedToStorage } from './storage';

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

  // The share link carries the character in the URL, and names the frame in
  // its path, so an OBS source that has never been set up opens onto this HUD.
  const characterLink = useSourceLink(
    'player',
    character ? `c=${encodeCharacterToShareParam(character)}` : ''
  );
  const shareUrl = character ? characterLink : null;

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
            <button
              type="button"
              className="setup-button setup-button--primary setup-wizard__done"
              onClick={dismiss}
            >
              Yes — confirm
            </button>
          </div>
        </div>
      ) : (
        <div className="setup-wizard__flow">
          <ol className="setup-wizard__steps">
            <li>
              Fill in your character, then copy your link.
              <div className="setup-wizard__copy">
                <button
                  type="button"
                  className="setup-button setup-wizard__copy-button"
                  onClick={copyShareLink}
                  disabled={!shareUrl}
                >
                  {copied ? 'Share link copied' : 'Copy share link'}
                </button>
                {/* Always one line here, so the steps below never shift. */}
                <span className="setup-wizard__copy-hint">
                  {shareUrl ? 'You paste it in step 3.' : 'Save a character first.'}
                </span>
              </div>
            </li>
            <li>
              In OBS, load the <a href={OBS_SCRIPT_URL}>Vellum script</a> under Tools &rarr;
              Scripts.
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
          <button
            type="button"
            className="setup-button setup-button--primary setup-wizard__done"
            onClick={dismiss}
          >
            Got it
          </button>
        </div>
      )}

      <p className="setup-wizard__trust">Runs in your browser. Nothing is uploaded.</p>
    </aside>
  );
}
