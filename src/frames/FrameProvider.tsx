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
import { FRAME_LIBRARY, framesForSystem, resolveFrameId } from './library';
import { frameIdFromPath, kindFromLegacyUrl, showFrameInUrl } from '../routes/frameRoute';

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
 * The frame to start on. The address wins (`/app/frames/<id>/`: an OBS source
 * pins its frame that way), then an old `?frame=`, then a frame carried in the
 * link (`?frameData=`), then the stored choice, then the first official frame.
 * An old screen address (`/app/daggerheart/gm/`) only takes a frame of the
 * kind it named, so it lands on the GM frame rather than a stored player one.
 */
function initialFrameId(frames: readonly ThemeConfig[]): string {
  const pathId = frameIdFromPath();
  const pinned = pathId ? findFrame(frames, pathId) : undefined;
  if (pinned) return pinned.id;
  const kind = kindFromLegacyUrl();
  const fits = (f: ThemeConfig | undefined): f is ThemeConfig => !!f && (!kind || f.kind === kind);
  const candidates = [readFrameFromUrl(), readFrameDataFromUrl()?.id, readStoredFrame()].map((id) =>
    findFrame(frames, id)
  );
  return (candidates.find(fits) ?? frames.find(fits) ?? frames[0]).id;
}

/**
 * Chooses the frame the HUD wears and applies it, and keeps its address in
 * the URL. The frame decides the screen: a player frame shows a character's
 * HUD, a GM frame the Fear pool. Hotkeys switch it with `frame.set` /
 * `frame.cycle` commands.
 */
export function FrameProvider({ children, library = FRAME_LIBRARY }: FrameProviderProps) {
  const system = useSystem();
  const [custom, setCustom] = useState<ThemeConfig[]>(initialCustomFrames);
  const frames = useMemo(
    () => framesForSystem(system.id, [...library, ...custom]),
    [system.id, library, custom]
  );
  const [frameId, setFrameId] = useState<string>(() => initialFrameId(frames));
  const frame = frames.find((f) => f.id === frameId) ?? frames[0];

  useEffect(() => showFrameInUrl(frame.id), [frame.id]);

  const choose = useCallback((id: string) => {
    setFrameId(id);
    writeStoredFrame(id);
  }, []);

  const setFrame = useCallback(
    (id: string) => {
      const found = findFrame(frames, id);
      if (found) choose(found.id);
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
      // Stay on the same screen: fall back to an official frame of the same kind.
      if (id === frameId) choose((frames.find((f) => f.kind === frame.kind) ?? frames[0]).id);
    },
    [frameId, frame.kind, frames, choose]
  );

  useEffect(
    () =>
      subscribeCommands((command) => {
        if (command.type === 'frame.set') setFrame(command.frame);
        if (command.type === 'frame.cycle') {
          // Cycling restyles the screen; it never swaps a player HUD for the GM's.
          const ring = frames.filter((f) => f.kind === frame.kind);
          const index = ring.findIndex((f) => f.id === frame.id);
          const n = ring.length;
          choose(ring[(((index + command.delta) % n) + n) % n].id);
        }
      }),
    [frames, frame.id, frame.kind, setFrame, choose]
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

function findFrame(
  frames: readonly ThemeConfig[],
  id: string | null | undefined
): ThemeConfig | undefined {
  if (!id) return undefined;
  const resolved = resolveFrameId(id);
  return frames.find((f) => f.id === resolved);
}
