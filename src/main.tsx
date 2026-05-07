import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './App';
import { SystemProvider } from './systems/SystemProvider';
import { daggerheartSystem } from './systems/daggerheart.system';
import { ThemeProvider } from './themes/ThemeProvider';
import { daggerheartTheme } from './themes/daggerheart.theme';
import './index.css';

const rootElement = document.getElementById('root');
if (!rootElement) throw new Error('Root element #root not found');

createRoot(rootElement).render(
  <StrictMode>
    <SystemProvider system={daggerheartSystem}>
      <ThemeProvider theme={daggerheartTheme}>
        <App />
      </ThemeProvider>
    </SystemProvider>
  </StrictMode>
);
