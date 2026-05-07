import { useId, useRef, useState, type ChangeEvent } from 'react';
import { useCharacter } from '../../character/useCharacter';
import { parseCharacterJson } from '../../character/parseCharacter';

export function CharacterImport() {
  const inputId = useId();
  const errorId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const { dispatch } = useCharacter();
  const [error, setError] = useState<string | null>(null);

  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onerror = () => {
      setError('Could not read file.');
      if (inputRef.current) inputRef.current.value = '';
    };
    reader.onload = () => {
      const text = typeof reader.result === 'string' ? reader.result : '';
      const result = parseCharacterJson(text);
      if (!result.ok) {
        setError(result.error);
      } else {
        dispatch({ type: 'SET_CHARACTER', character: result.character });
        setError(null);
      }
      if (inputRef.current) inputRef.current.value = '';
    };
    reader.readAsText(file);
  }

  return (
    <div>
      <label htmlFor={inputId}>Import character</label>
      <input
        ref={inputRef}
        id={inputId}
        type="file"
        accept="application/json,.json"
        onChange={handleChange}
        aria-describedby={error ? errorId : undefined}
      />
      {error && (
        <p id={errorId} role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
