import { act, render, screen, within } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { startDeckLink } from '../../deck/deckLink';
import {
  OBS_SCRIPT_EVENT,
  OBS_SCRIPT_STALE_MS,
  isObsScriptLoaded,
  listenForObsScript,
  resetObsScriptPresence,
} from '../../obsScript/obsScriptPresence';
import { SetupChecks } from './SetupChecks';

function row(label: string) {
  const item = screen.getByText(label).closest('li');
  if (!item) throw new Error(`no row ${label}`);
  return item;
}

afterEach(() => {
  delete (window as { obsstudio?: unknown }).obsstudio;
  resetObsScriptPresence();
});

describe('obs script presence', () => {
  it('counts the script as loaded until it goes quiet', () => {
    let now = 1000;
    const target = new EventTarget();
    const stop = listenForObsScript(target, () => now);
    expect(isObsScriptLoaded(now)).toBe(false);
    target.dispatchEvent(new CustomEvent(OBS_SCRIPT_EVENT, { detail: { version: 1 } }));
    expect(isObsScriptLoaded(now)).toBe(true);
    now += OBS_SCRIPT_STALE_MS;
    expect(isObsScriptLoaded(now)).toBe(false);
    stop();
  });
});

describe('SetupChecks', () => {
  it('in a browser tab, points the player at OBS for the OBS-only checks', () => {
    render(<SetupChecks />);
    expect(within(row('OBS')).getByText('Check in OBS')).toBeInTheDocument();
    expect(within(row('Vellum OBS script')).getByText('Only OBS can run it.')).toBeInTheDocument();
    expect(within(row('Stream Deck plugin')).getByText('Check in OBS')).toBeInTheDocument();
  });

  it('inside OBS, asks for the script until it announces itself', () => {
    window.obsstudio = {};
    const stop = listenForObsScript();
    render(<SetupChecks />);
    expect(within(row('Vellum OBS script')).getByText('Needs you')).toBeInTheDocument();
    act(() => {
      window.dispatchEvent(new CustomEvent(OBS_SCRIPT_EVENT, { detail: { version: 1 } }));
    });
    expect(within(row('Vellum OBS script')).getByText('Ready')).toBeInTheDocument();
    expect(within(row('OBS')).getByText('Ready')).toBeInTheDocument();
    stop();
  });

  it('shows the Stream Deck plugin as connected once the link opens', () => {
    window.obsstudio = {};
    class FakeSocket extends EventTarget {
      readyState = 0;
      send = vi.fn();
      close() {
        this.dispatchEvent(new Event('close'));
      }
    }
    const socket = new FakeSocket();
    const stop = startDeckLink({ createSocket: () => socket as unknown as WebSocket });
    render(<SetupChecks />);
    expect(within(row('Stream Deck plugin')).getByText('Optional')).toBeInTheDocument();
    act(() => {
      socket.readyState = 1;
      socket.dispatchEvent(new Event('open'));
    });
    expect(within(row('Stream Deck plugin')).getByText('Ready')).toBeInTheDocument();
    act(() => stop());
  });
});
