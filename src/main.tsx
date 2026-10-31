import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './App';
import { CharacterProvider } from './character/CharacterProvider';
import { Stage } from './components/Stage';
import { SystemProvider } from './systems/SystemProvider';
import { daggerheartSystem } from './systems/daggerheart.system';
import { FrameProvider } from './frames/FrameProvider';
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

// Before anything reads localStorage: import data carried over from the old
// github.io origin, if this load came through its redirect stub.
applyOriginHandoff();
// OBS hotkeys and Stream Deck keys reach the HUD as `vellum:command` events.
listenForExternalCommands();

const rootElement = document.getElementById('root');
if (!rootElement) throw new Error('Root element #root not found');

createRoot(rootElement).render(
  <StrictMode>
    <SystemProvider system={daggerheartSystem}>
      <FrameProvider>
        <CharacterProvider>
          <Stage>
            <App />
          </Stage>
        </CharacterProvider>
      </FrameProvider>
    </SystemProvider>
  </StrictMode>
);
