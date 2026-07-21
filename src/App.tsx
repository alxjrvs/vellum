import { useState } from 'react';
import { useCharacter } from './character/useCharacter';
import { CharacterSetup } from './components/CharacterSetup';
import { PlayerHud, ConditionsPanel, IdentityLabel } from './components/PlayerHud';
import { DiceRoller } from './components/DiceRoller';
import { GmHud } from './components/GmHud';
import { Ticker } from './components/Ticker';
import { SetupWizard } from './components/SetupWizard';
import { SceneSelector } from './components/SceneSelector';
import { useViewMode } from './viewMode/useViewMode';

export function App() {
  const { character } = useCharacter();
  const viewMode = useViewMode();
  const [editing, setEditing] = useState(false);

  // The bare route addresses no scene: offer the game + role picker rather
  // than silently assuming the player HUD.
  if (viewMode === null) {
    return (
      <main className="setup-shell">
        <SceneSelector />
      </main>
    );
  }

  if (viewMode === 'gm') {
    return (
      <main className="hud" data-view="gm">
        <div className="hud__region hud__region--ticker">
          <Ticker />
        </div>
        <GmHud />
      </main>
    );
  }

  const showSetup = editing || !character;

  if (showSetup) {
    return (
      <main className="setup-shell">
        <CharacterSetup onDone={() => setEditing(false)} />
        <SetupWizard />
      </main>
    );
  }

  return (
    <main className="hud">
      <div className="hud__region hud__region--ticker">
        <Ticker />
      </div>
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
      <SetupWizard />
    </main>
  );
}
