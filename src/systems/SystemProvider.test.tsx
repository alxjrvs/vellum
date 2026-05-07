import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { SystemProvider } from './SystemProvider';
import { useSystem } from './useSystem';
import { daggerheartSystem } from './daggerheart.system';

function HopeReadout() {
  const sys = useSystem();
  return <span data-testid="hope-max">{sys.hope.max}</span>;
}

describe('SystemProvider', () => {
  it('exposes the supplied system config to descendants', () => {
    render(
      <SystemProvider system={daggerheartSystem}>
        <HopeReadout />
      </SystemProvider>
    );
    expect(screen.getByTestId('hope-max')).toHaveTextContent('6');
  });

  it('throws when useSystem is called outside a provider', () => {
    expect(() => render(<HopeReadout />)).toThrow(/SystemProvider/);
  });
});
