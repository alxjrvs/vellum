import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './App';
import { CharacterProvider } from './character/CharacterProvider';
import { Stage } from './components/Stage';
import { SystemProvider } from './systems/SystemProvider';
import { daggerheartSystem } from './systems/daggerheart.system';
import { FrameProvider } from './frames/FrameProvider';
import { CameraProvider } from './camera/CameraProvider';
// Self-hosted faces (bundled, so OBS needs no network) — weights the chassis uses.
import '@fontsource/barlow-condensed/latin-600.css';
import '@fontsource/barlow-condensed/latin-700.css';
import '@fontsource/barlow-condensed/latin-800-italic.css';
import '@fontsource/barlow-condensed/latin-900-italic.css';
import '@fontsource/barlow/latin-400.css';
import '@fontsource/barlow/latin-600.css';
import '@fontsource/ibm-plex-mono/latin-500.css';
import './themes/vellum.tokens.css';
import './index.css';
import { applyOriginHandoff } from './migrate/originHandoff';
import { listenForExternalCommands } from './commands/commandBus';
import { shouldLinkDeck, startDeckLink } from './deck/deckLink';
import { listenForObsScript } from './obsScript/obsScriptPresence';
import { migrateLegacyRoute } from './viewMode/useViewMode';

// Before anything reads localStorage: import data carried over from the old
// github.io origin, if this load came through its redirect stub.
applyOriginHandoff();
// Old `#/daggerheart/gm` and `?mode=gm` links move to their scene path.
migrateLegacyRoute();
// OBS hotkeys and Stream Deck keys reach the HUD as `vellum:command` events.
listenForExternalCommands();
// Inside OBS, keep a line open to the Stream Deck plugin on this machine, if
// it is running. It sends key presses in and gets live values back.
if (shouldLinkDeck()) startDeckLink();
// The Vellum OBS script announces itself so setup can confirm it's loaded.
listenForObsScript();

const rootElement = document.getElementById('root');
if (!rootElement) throw new Error('Root element #root not found');

createRoot(rootElement).render(
  <StrictMode>
    <SystemProvider system={daggerheartSystem}>
      <FrameProvider>
        <CameraProvider>
          <CharacterProvider>
            <Stage>
              <App />
            </Stage>
          </CharacterProvider>
        </CameraProvider>
      </FrameProvider>
    </SystemProvider>
  </StrictMode>
);
