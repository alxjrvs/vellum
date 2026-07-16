import './Ticker.css';
import { useRef, useState } from 'react';
import { readTickerFromStorage, writeTickerToStorage } from './storage';

/**
 * An editable scrolling text banner across the top of the overlay. The text is
 * global (shared by player and GM views) and persisted to localStorage so it
 * survives reloads and reaches the OBS browser source. Click to edit.
 */
export function Ticker() {
  const [text, setText] = useState(readTickerFromStorage);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState('');
  // Guards the edit session so it resolves exactly once: Escape must discard
  // even though removing the focused input can also fire onBlur (which would
  // otherwise commit the discarded draft), and Enter+blur must not double-save.
  const resolvedRef = useRef(false);

  const startEditing = () => {
    resolvedRef.current = false;
    setDraft(text);
    setEditing(true);
  };

  const finishEditing = (save: boolean) => {
    if (resolvedRef.current) return;
    resolvedRef.current = true;
    if (save) {
      const next = draft.trim();
      setText(next);
      writeTickerToStorage(next);
    }
    setEditing(false);
  };

  if (editing) {
    return (
      <div className="ticker ticker--editing">
        <input
          className="ticker__input"
          type="text"
          autoFocus
          aria-label="Ticker text"
          placeholder="Type ticker text…"
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          onBlur={() => finishEditing(true)}
          onKeyDown={(event) => {
            if (event.key === 'Enter') finishEditing(true);
            else if (event.key === 'Escape') finishEditing(false);
          }}
        />
      </div>
    );
  }

  return (
    <div
      className="ticker"
      data-empty={text === ''}
      role="button"
      tabIndex={0}
      aria-label={text ? `Ticker: ${text}. Click to edit.` : 'Add ticker text'}
      onClick={startEditing}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          startEditing();
        }
      }}
    >
      {text === '' ? (
        <span className="ticker__placeholder">＋ Add ticker</span>
      ) : (
        <div className="ticker__viewport">
          <div className="ticker__track">
            <span className="ticker__text">{text}</span>
            <span className="ticker__text" aria-hidden="true">
              {text}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
