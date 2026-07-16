import { useState } from 'react';
import { useCharacter } from './character/useCharacter';
import { CharacterSetup } from './components/CharacterSetup';
import { PlayerHud, ConditionsPanel, IdentityLabel } from './components/PlayerHud';
import { DiceRoller } from './components/DiceRoller';
import { GmHud } from './components/GmHud';
import { useViewMode } from './viewMode/useViewMode';

export function App() {
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

  if (showSetup) {
    return (
      <main className="setup-shell">
        <CharacterSetup onDone={() => setEditing(false)} />
      </main>
    );
  }

  return (
    <main className="hud">
      <div className="hud__region hud__region--vitals">
        <PlayerHud />
      </div>
      <div className="hud__region hud__region--status">
        <ConditionsPanel />
      </div>
      <div className="hud__region hud__region--dice">
        <DiceRoller />
      </div>
      <div className="hud__region hud__region--name">
        <IdentityLabel />
      </div>
      <div className="hud__region hud__region--utility">
        <button type="button" className="edit-details" onClick={() => setEditing(true)}>
          Edit details
        </button>
      </div>
    </main>
  );
}
