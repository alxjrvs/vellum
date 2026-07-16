import './Ticker.css';
import { useState } from 'react';
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

  const startEditing = () => {
    setDraft(text);
    setEditing(true);
  };

  const commit = () => {
    const next = draft.trim();
    setText(next);
    writeTickerToStorage(next);
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
          onBlur={commit}
          onKeyDown={(event) => {
            if (event.key === 'Enter') commit();
            else if (event.key === 'Escape') setEditing(false);
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
