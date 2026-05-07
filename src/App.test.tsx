import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { App } from './App';
import { SystemProvider } from './systems/SystemProvider';
import { daggerheartSystem } from './systems/daggerheart.system';
import { ThemeProvider } from './themes/ThemeProvider';
import { daggerheartTheme } from './themes/daggerheart.theme';

function renderApp() {
  return render(
    <SystemProvider system={daggerheartSystem}>
      <ThemeProvider theme={daggerheartTheme}>
        <App />
      </ThemeProvider>
    </SystemProvider>
  );
}

describe('App', () => {
  it('renders the Vellum heading', () => {
    renderApp();
    expect(screen.getByRole('heading', { name: /vellum/i })).toBeInTheDocument();
  });

  it('reads system + theme labels from context (no hardcoded strings)', () => {
    renderApp();
    expect(screen.getByText(/Daggerheart · Theme: Daggerheart/i)).toBeInTheDocument();
  });
});
