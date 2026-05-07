import { useCharacter } from './character/useCharacter';
import { CharacterImport } from './components/CharacterImport';
import { CharacterExport } from './components/CharacterExport';
import { PlayerHud } from './components/PlayerHud';
import { GmHud } from './components/GmHud';
import { useSystem } from './systems/useSystem';
import { useTheme } from './themes/useTheme';
import { useViewMode } from './viewMode/useViewMode';

export function App() {
  const system = useSystem();
  const theme = useTheme();
  const { character } = useCharacter();
  const viewMode = useViewMode();

  if (viewMode === 'gm') {
    return (
      <main>
        <GmHud />
      </main>
    );
  }

  return (
    <main>
      <h1>Vellum</h1>
      <p>
        System: {system.label} · Theme: {theme.label}
      </p>
      {character ? <PlayerHud /> : <p>Import a character to begin.</p>}
      <CharacterImport />
      <CharacterExport />
    </main>
  );
}
