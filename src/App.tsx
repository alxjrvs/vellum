import { useState } from 'react';
import { useCharacter } from './character/useCharacter';
import { CharacterSetup } from './components/CharacterSetup';
import { PlayerHud } from './components/PlayerHud';
import { DiceRoller } from './components/DiceRoller';
import { GmHud } from './components/GmHud';
import { useSystem } from './systems/useSystem';
import { useTheme } from './themes/useTheme';
import { useViewMode } from './viewMode/useViewMode';

export function App() {
  const system = useSystem();
  const theme = useTheme();
  const { character } = useCharacter();
  const viewMode = useViewMode();
  const [editing, setEditing] = useState(false);

  if (viewMode === 'gm') {
    return (
      <main>
        <GmHud />
      </main>
    );
  }

  const showSetup = editing || !character;

  return (
    <main>
      <h1>Vellum</h1>
      <p>
        System: {system.label} · Theme: {theme.label}
      </p>
      {showSetup ? (
        <CharacterSetup onDone={() => setEditing(false)} />
      ) : (
        <>
          <div className="overview">
            <PlayerHud />
            <DiceRoller />
          </div>
          <button type="button" className="edit-details" onClick={() => setEditing(true)}>
            Edit details
          </button>
        </>
      )}
    </main>
  );
}
