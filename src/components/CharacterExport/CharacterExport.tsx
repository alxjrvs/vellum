import { useCharacter } from '../../character/useCharacter';
import { exportCharacter } from '../../character/exportCharacter';

export function CharacterExport() {
  const { character } = useCharacter();
  const disabled = character === null;

  function handleClick() {
    if (!character) return;
    const { blob, filename } = exportCharacter(character);
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = filename;
    anchor.rel = 'noopener';
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
    URL.revokeObjectURL(url);
  }

  return (
    <button type="button" onClick={handleClick} disabled={disabled}>
      Export character
    </button>
  );
}
