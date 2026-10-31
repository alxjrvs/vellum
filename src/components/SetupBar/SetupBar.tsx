import './SetupBar.css';
import type { ReactNode } from 'react';
import wordmarkUrl from '../../../docs/branding/wordmark-dark.svg';
import { useSystem } from '../../systems/useSystem';

interface SetupBarProps {
  /** What this setup screen is for, e.g. "Player setup". */
  readonly title: string;
  /** Actions shown at the far end of the bar. */
  readonly children?: ReactNode;
}

/**
 * The strip across the top of every setup screen: the Nameplate wordmark, then
 * which screen you're setting up and for which game, on a label plate.
 */
export function SetupBar({ title, children }: SetupBarProps) {
  const system = useSystem();
  return (
    <header className="setup-bar">
      <img className="setup-bar__wordmark" src={wordmarkUrl} alt="Vellum" />
      <p className="setup-bar__title">
        <span className="setup-bar__scene">{title}</span>
        <span className="setup-bar__system">{system.label}</span>
      </p>
      {children && <div className="setup-bar__actions">{children}</div>}
    </header>
  );
}
