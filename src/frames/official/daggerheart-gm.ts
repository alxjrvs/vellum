import { daggerheartTheme } from '../../themes/daggerheart.theme';
import type { ThemeConfig } from '../../themes/types';

/**
 * The official Daggerheart GM frame: the same warm chassis, showing the
 * table's Fear and the Duality Dice instead of a character.
 */
export const daggerheartGm: ThemeConfig = {
  ...daggerheartTheme,
  id: 'daggerheart-gm',
  label: 'Daggerheart – GM',
  kind: 'gm',
  // The Fear track is wide: start it below the ticker band so the editor
  // never opens a copy of this frame with a problem to fix.
  regions: { vitals: { x: 450, y: 160 } },
};
