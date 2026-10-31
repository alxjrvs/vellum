import { daggerheartTheme } from '../themes/daggerheart.theme';
import type { ThemeConfig } from '../themes/types';
import type { SystemId } from '../systems/types';
import { daggerheartLedger } from './official/daggerheart-ledger';

/**
 * Every frame bundled with Vellum, official first. Frames are static data
 * shipped in the build: nothing is fetched, so a frame works offline in OBS.
 */
export const FRAME_LIBRARY: readonly ThemeConfig[] = [daggerheartTheme, daggerheartLedger];

export function framesForSystem(
  system: SystemId,
  library: readonly ThemeConfig[] = FRAME_LIBRARY
): readonly ThemeConfig[] {
  return library.filter((frame) => frame.system === system);
}
