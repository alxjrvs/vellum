import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import { subscribeCommands } from '../commands/commandBus';
import { useSystem } from '../systems/useSystem';
import { ThemeProvider } from '../themes/ThemeProvider';
import type { ThemeConfig } from '../themes/types';
import { FrameContext } from './FrameContext';
import { readFrameFromUrl, readStoredFrame, writeStoredFrame } from './frameStorage';
import { FRAME_LIBRARY, framesForSystem } from './library';

interface FrameProviderProps {
  children: ReactNode;
  /** Defaults to the bundled library; tests pass their own. */
  library?: readonly ThemeConfig[];
}

/**
 * Chooses the frame the HUD wears and applies it. A `?frame=` in the URL wins
 * (an OBS source pins its frame that way), then the stored choice, then the
 * system's first official frame. Hotkeys switch it with `frame.set` /
 * `frame.cycle` commands.
 */
export function FrameProvider({ children, library = FRAME_LIBRARY }: FrameProviderProps) {
  const system = useSystem();
  const frames = useMemo(() => framesForSystem(system.id, library), [system.id, library]);
  const [frameId, setFrameId] = useState<string>(
    () => [readFrameFromUrl(), readStoredFrame()].find((id) => known(frames, id)) ?? frames[0].id
  );
  const frame = frames.find((f) => f.id === frameId) ?? frames[0];

  const setFrame = useCallback(
    (id: string) => {
      if (!known(frames, id)) return;
      setFrameId(id);
      writeStoredFrame(id);
    },
    [frames]
  );

  useEffect(
    () =>
      subscribeCommands((command) => {
        if (command.type === 'frame.set') setFrame(command.frame);
        if (command.type === 'frame.cycle') {
          setFrameId((current) => {
            const index = frames.findIndex((f) => f.id === current);
            const n = frames.length;
            const next = frames[(((index + command.delta) % n) + n) % n].id;
            writeStoredFrame(next);
            return next;
          });
        }
      }),
    [frames, setFrame]
  );

  const value = useMemo(() => ({ frame, frames, setFrame }), [frame, frames, setFrame]);
  return (
    <FrameContext.Provider value={value}>
      <ThemeProvider theme={frame}>{children}</ThemeProvider>
    </FrameContext.Provider>
  );
}

function known(frames: readonly ThemeConfig[], id: string | null | undefined): id is string {
  return !!id && frames.some((f) => f.id === id);
}
