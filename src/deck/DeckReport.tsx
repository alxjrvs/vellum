import { useCharacter } from '../character/useCharacter';
import { useFrame } from '../frames/useFrame';
import { useSystem } from '../systems/useSystem';
import { playerDeckState } from './playerDeckState';
import { useDeckReport } from './useDeckReport';

/** Reports the frame being worn. Rendered on every live scene. */
export function FrameDeckReport() {
  const { frame } = useFrame();
  useDeckReport({ frame: { id: frame.id, label: frame.label } });
  return null;
}

/** Reports the player's tracks and conditions. Rendered on the live player HUD. */
export function PlayerDeckReport() {
  const { character } = useCharacter();
  const system = useSystem();
  useDeckReport(character ? playerDeckState(character, system) : {});
  return null;
}
