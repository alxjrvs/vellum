import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import { subscribeCommands } from '../commands/commandBus';
import { useSystem } from '../systems/useSystem';
import { ThemeProvider } from '../themes/ThemeProvider';
import type { ThemeConfig } from '../themes/types';
import { FrameContext } from './FrameContext';
import {
  readCustomFrames,
  readFrameDataFromUrl,
  upsertFrame,
  writeCustomFrames,
} from './customFrames';
import { readFrameFromUrl, readStoredFrame, writeStoredFrame } from './frameStorage';
import { FRAME_LIBRARY, framesForSystem } from './library';

interface FrameProviderProps {
  children: ReactNode;
  /** Defaults to the bundled library; tests pass their own. */
  library?: readonly ThemeConfig[];
}

/** My frames from storage, plus one carried in by a link (saved on arrival). */
function initialCustomFrames(): ThemeConfig[] {
  const stored = readCustomFrames();
  const linked = readFrameDataFromUrl();
  if (!linked) return stored;
  const next = upsertFrame(stored, linked);
  writeCustomFrames(next);
  return next;
}

/**
 * Chooses the frame the HUD wears and applies it. A `?frame=` in the URL wins
 * (an OBS source pins its frame that way), then a frame carried in the link
 * (`?frameData=`), then the stored choice, then the system's first official
 * frame. Hotkeys switch it with `frame.set` / `frame.cycle` commands.
 */
export function FrameProvider({ children, library = FRAME_LIBRARY }: FrameProviderProps) {
  const system = useSystem();
  const [custom, setCustom] = useState<ThemeConfig[]>(initialCustomFrames);
  const frames = useMemo(
    () => framesForSystem(system.id, [...library, ...custom]),
    [system.id, library, custom]
  );
  const [frameId, setFrameId] = useState<string>(
    () =>
      [readFrameFromUrl(), readFrameDataFromUrl()?.id, readStoredFrame()].find((id) =>
        known(frames, id)
      ) ?? frames[0].id
  );
  const frame = frames.find((f) => f.id === frameId) ?? frames[0];

  const choose = useCallback((id: string) => {
    setFrameId(id);
    writeStoredFrame(id);
  }, []);

  const setFrame = useCallback(
    (id: string) => {
      if (known(frames, id)) choose(id);
    },
    [frames, choose]
  );

  const saveFrame = useCallback(
    (next: ThemeConfig) => {
      setCustom((current) => {
        const updated = upsertFrame(current, { ...next, origin: 'custom' });
        writeCustomFrames(updated);
        return updated;
      });
      choose(next.id);
    },
    [choose]
  );

  const deleteFrame = useCallback(
    (id: string) => {
      setCustom((current) => {
        const updated = current.filter((f) => f.id !== id);
        writeCustomFrames(updated);
        return updated;
      });
      if (id === frameId) choose(frames[0].id);
    },
    [frameId, frames, choose]
  );

  useEffect(
    () =>
      subscribeCommands((command) => {
        if (command.type === 'frame.set') setFrame(command.frame);
        if (command.type === 'frame.cycle') {
          const index = frames.findIndex((f) => f.id === frame.id);
          const n = frames.length;
          choose(frames[(((index + command.delta) % n) + n) % n].id);
        }
      }),
    [frames, frame.id, setFrame, choose]
  );

  const value = useMemo(
    () => ({ frame, frames, setFrame, saveFrame, deleteFrame }),
    [frame, frames, setFrame, saveFrame, deleteFrame]
  );
  return (
    <FrameContext.Provider value={value}>
      <ThemeProvider theme={frame}>{children}</ThemeProvider>
    </FrameContext.Provider>
  );
}

function known(frames: readonly ThemeConfig[], id: string | null | undefined): id is string {
  return !!id && frames.some((f) => f.id === id);
}
