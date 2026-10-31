import { useCharacter } from '../../character/useCharacter';
import { useResourceBinding } from '../../character/useResourceBinding';
import type { TrackId } from '@vellum/protocol';
import { useSystem } from '../../systems/useSystem';
import { useTrackDisplay } from '../../themes/useTrackDisplay';
import { HpThresholds } from './HpThresholds';
import { StatTrack } from '../StatTrack';
import './Track.css';

/**
 * One player resource, drawn entirely from data: the system's declaration
 * (label, shape, tone), the frame's bar-or-chits choice, and the character
 * record. Adding a resource to a system needs no new component.
 */
export function Track({ id }: { id: TrackId }) {
  const system = useSystem();
  const display = useTrackDisplay(id);
  const binding = useResourceBinding(id);
  const { character, dispatch } = useCharacter();
  const def = system.resources.find((r) => r.id === id);
  if (!def || !binding || !character) return null;

  const track = (
    <StatTrack
      label={def.label}
      shape={def.shape}
      interaction={def.interaction}
      tone={def.tone}
      display={display}
      {...binding}
    />
  );
  if (def.addon !== 'damage-thresholds' || !character.thresholds) return track;

  const total = character.slotCounts.hp;
  const damage = character.stats.hp.length;
  return (
    <div className="track track--with-addon">
      {track}
      <HpThresholds
        thresholds={character.thresholds}
        onTakeDamage={(amount) =>
          dispatch({ type: 'HP_SET', count: Math.min(damage + amount, total) })
        }
      />
    </div>
  );
}
