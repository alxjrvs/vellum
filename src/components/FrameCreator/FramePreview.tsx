import type { CSSProperties } from 'react';
import { CharacterContext } from '../../character/CharacterContext';
import { makeCharacter } from '../../character/fixtures';
import { useCharacter } from '../../character/useCharacter';
import { themeToCssVars } from '../../themes/cssVars';
import { ThemeContext } from '../../themes/ThemeContext';
import type { ThemeConfig } from '../../themes/types';
import { DiceRoller } from '../DiceRoller';
import { HudRegion } from '../HudRegion';
import { ConditionsPanel, IdentityLabel, PlayerHud } from '../PlayerHud';
import './FramePreview.css';

const SAMPLE = makeCharacter({
  stats: { hope: 3, hp: [0, 1], stress: [0], armorSlots: [0] },
});

/**
 * The real HUD widgets wearing a draft frame, at Discord tile size (640×360,
 * a third of the 1920×1080 stage). The draft's tokens are scoped to the
 * preview, so the rest of the page keeps the active frame.
 */
export function FramePreview({ frame }: { frame: ThemeConfig }) {
  const { character } = useCharacter();
  const style = themeToCssVars(frame) as CSSProperties;
  return (
    <figure className="frame-preview">
      <div className="frame-preview__tile" aria-hidden="true" inert>
        <div className="frame-preview__stage" style={style}>
          <ThemeContext.Provider value={frame}>
            <CharacterContext.Provider
              value={{ character: character ?? SAMPLE, dispatch: () => undefined }}
            >
              <div className="hud">
                <HudRegion widget="vitals">
                  <PlayerHud />
                </HudRegion>
                <HudRegion widget="status">
                  <ConditionsPanel />
                </HudRegion>
                <HudRegion widget="dice">
                  <DiceRoller />
                </HudRegion>
                <HudRegion widget="name">
                  <IdentityLabel />
                </HudRegion>
              </div>
            </CharacterContext.Provider>
          </ThemeContext.Provider>
        </div>
      </div>
      <figcaption className="frame-preview__caption">Preview at Discord tile size</figcaption>
    </figure>
  );
}
