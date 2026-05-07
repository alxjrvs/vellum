import './IdentityLabel.css';
import { useCharacter } from '../../character/useCharacter';

export function IdentityLabel() {
  const { character } = useCharacter();
  if (!character) return null;
  const { name, class: characterClass, ancestry } = character.identity;
  return (
    <p className="identity-label" aria-label="Character identity">
      <span className="identity-label__name">{name}</span>
      <span className="identity-label__separator" aria-hidden="true">
        {' — '}
      </span>
      <span className="identity-label__detail">
        {characterClass}, {ancestry}
      </span>
    </p>
  );
}
