import { useCharacter } from './character/useCharacter';
import { CharacterSetup } from './components/CharacterSetup';
import { PlayerHud, ConditionsPanel, IdentityLabel } from './components/PlayerHud';
import { DiceRoller } from './components/DiceRoller';
import { GmHud } from './components/GmHud';
import { GmSetup } from './components/GmSetup';
import { Ticker } from './components/Ticker';
import { SetupWizard } from './components/SetupWizard';
import { FramePicker } from './components/FramePicker';
import { CameraHud } from './components/CameraHud';
import { HudRegion } from './components/HudRegion';
import { CameraSetup } from './components/CameraSetup';
import { SceneSelector } from './components/SceneSelector';
import { SceneShell } from './scenes/SceneShell';
import { useViewMode } from './viewMode/useViewMode';
import { FrameDeckReport, PlayerDeckReport } from './deck/DeckReport';

export function App() {
  const { character } = useCharacter();
  const viewMode = useViewMode();

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
      <SceneShell
        // Keyed by scene: both branches return a SceneShell in the same
        // position, so without this React reuses the instance across a hash
        // change and the launched/editing state bleeds between scenes.
        key="gm"
        scene="gm"
        // A GM configures nothing, so the scene is always ready to launch — but
        // it still starts on its how-to rather than assuming you've read it.
        canLaunch
        defaultLaunched={false}
        // No SetupWizard on either GM view: it is written for the player
        // onramp (its OBS self-test asks you to click an HP pip, which the GM
        // screen has none of), and inside a non-interactive OBS source it would
        // float over a live camera with no way to dismiss it. GmSetup is the
        // GM's how-to.
        renderSetup={({ launch }) => (
          <main className="setup-shell">
            <GmSetup onLaunch={launch} />
            <FramePicker />
            <CameraSetup />
          </main>
        )}
        renderLive={({ edit }) => (
          <CameraHud data-view="gm">
            <FrameDeckReport />
            <div className="hud__region hud__region--ticker">
              <Ticker />
            </div>
            <GmHud />
            <div className="hud__region hud__region--utility" data-side="right">
              <button type="button" className="edit-details" onClick={edit}>
                Setup
              </button>
            </div>
          </CameraHud>
        )}
      />
    );
  }

  return (
    <SceneShell
      // See the GM branch: keyed so scene state never survives a scene switch.
      key="player"
      scene="player"
      // The player HUD can't render without a character, so saving one is what
      // enables launch. An existing character also counts as already-launched,
      // so upgrading users aren't sent back through setup.
      canLaunch={character !== null}
      defaultLaunched={character !== null}
      renderSetup={({ launch }) => (
        <main className="setup-shell">
          <CharacterSetup onDone={launch} />
          <FramePicker />
          <CameraSetup />
          <SetupWizard />
        </main>
      )}
      renderLive={({ edit }) => (
        <CameraHud>
          <FrameDeckReport />
          <PlayerDeckReport />
          <div className="hud__region hud__region--ticker">
            <Ticker />
          </div>
          <HudRegion widget="vitals">
            <PlayerHud />
          </HudRegion>
          <HudRegion widget="status">
            <ConditionsPanel />
          </HudRegion>
          <HudRegion widget="dice">
            <DiceRoller />
          </HudRegion>
          <HudRegion widget="name">
            <IdentityLabel />
          </HudRegion>
          <div className="hud__region hud__region--utility" data-side="right">
            <button type="button" className="edit-details" onClick={edit}>
              Edit details
            </button>
          </div>
          <SetupWizard />
        </CameraHud>
      )}
    />
  );
}
