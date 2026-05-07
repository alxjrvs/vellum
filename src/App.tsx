import { useCharacter } from './character/useCharacter';
import { CharacterImport } from './components/CharacterImport';
import { CharacterExport } from './components/CharacterExport';
import { Hope, HP, Stress, Armor, ConditionsPanel, IdentityLabel } from './components/PlayerHud';
import { useSystem } from './systems/useSystem';
import { useTheme } from './themes/useTheme';

export function App() {
  const system = useSystem();
  const theme = useTheme();
  const { character } = useCharacter();

  return (
    <main>
      <h1>Vellum</h1>
      <p>
        System: {system.label} · Theme: {theme.label}
      </p>
      {character ? (
        <>
          <IdentityLabel />
          <Hope />
          <HP />
          <Stress />
          <Armor />
          <ConditionsPanel />
        </>
      ) : (
        <p>Import a character to begin.</p>
      )}
      <CharacterImport />
      <CharacterExport />
    </main>
  );
}
