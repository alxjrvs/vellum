import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { SceneSelector } from './SceneSelector';
import { SystemProvider } from '../../systems/SystemProvider';
import { daggerheartSystem } from '../../systems/daggerheart.system';

function renderSelector() {
  return render(
    <SystemProvider system={daggerheartSystem}>
      <SceneSelector />
    </SystemProvider>
  );
}

describe('SceneSelector', () => {
  it('names the game from the mounted system config', () => {
    renderSelector();
    expect(screen.getByRole('heading', { name: 'Daggerheart' })).toBeInTheDocument();
  });

  it('links each role at its canonical scene hash', () => {
    renderSelector();

    expect(screen.getByRole('link', { name: /player/i })).toHaveAttribute(
      'href',
      '#/daggerheart/player'
    );
    expect(screen.getByRole('link', { name: /gm/i })).toHaveAttribute('href', '#/daggerheart/gm');
  });

  it('offers exactly one link per shipped scene', () => {
    renderSelector();
    expect(screen.getAllByRole('link')).toHaveLength(2);
  });
});
