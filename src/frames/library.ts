import { daggerheartTheme } from '../themes/daggerheart.theme';
import type { ThemeConfig } from '../themes/types';
import type { SystemId } from '../systems/types';
import { daggerheartGm } from './official/daggerheart-gm';
import { daggerheartLedger } from './official/daggerheart-ledger';

/**
 * Every frame bundled with Vellum, official first. Frames are static data
 * shipped in the build: nothing is fetched, so a frame works offline in OBS.
 */
export const FRAME_LIBRARY: readonly ThemeConfig[] = [
  daggerheartTheme,
  daggerheartGm,
  daggerheartLedger,
];

/** Ids frames used to go by, so old links and stored choices still find them. */
const FRAME_ALIASES: Readonly<Record<string, string>> = {
  daggerheart: daggerheartTheme.id,
};

export function resolveFrameId(id: string): string {
  return FRAME_ALIASES[id] ?? id;
}

export function framesForSystem(
  system: SystemId,
  library: readonly ThemeConfig[] = FRAME_LIBRARY
): readonly ThemeConfig[] {
  return library.filter((frame) => frame.system === system);
}
