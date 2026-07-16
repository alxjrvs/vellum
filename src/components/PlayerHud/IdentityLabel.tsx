import './IdentityLabel.css';
import { useCharacter } from '../../character/useCharacter';

export function IdentityLabel() {
  const { character } = useCharacter();
  if (!character) return null;
  const { name, class: characterClass, ancestry, subclass, community, level } = character.identity;
  const classPart = subclass ? `${characterClass} (${subclass})` : characterClass;
  const leadingClass = level !== undefined ? `Lvl ${level} ${classPart}` : classPart;
  const ancestryPart = community ? `${ancestry}, ${community}` : ancestry;
  return (
    <section className="identity-label" aria-label="Character identity">
      <h2 className="identity-label__name">{name}</h2>
      <p className="identity-label__detail">
        {leadingClass} · {ancestryPart}
      </p>
    </section>
  );
}
