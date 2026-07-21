import './SceneSelector.css';
import { useSystem } from '../../systems/useSystem';
import { SCENES, sceneHash, type ViewMode } from '../../viewMode/useViewMode';

const SCENE_COPY: Record<ViewMode, { readonly title: string; readonly blurb: string }> = {
  player: {
    title: 'Player',
    blurb: 'Your character HUD — HP, Stress, Hope, Armor, conditions, and the duality dice.',
  },
  gm: {
    title: 'GM',
    blurb: 'The Fear pool and the duality dice. No character setup needed.',
  },
};

/**
 * The bare `/app/` route: pick a game and the screen you're running, then land
 * on that scene's own hash URL — which is the address to paste into OBS.
 */
export function SceneSelector() {
  const system = useSystem();

  return (
    <section className="scene-selector" aria-label="Choose a screen">
      <h1 className="scene-selector__title">Vellum</h1>
      <p className="scene-selector__lede">Pick a game and the screen you&rsquo;re running.</p>

      <h2 className="scene-selector__game">{system.label}</h2>
      <ul className="scene-selector__roles">
        {SCENES.map((scene) => (
          <li key={scene} className="scene-selector__role-item">
            <a className="scene-selector__role" href={sceneHash(scene)}>
              <span className="scene-selector__role-title">{SCENE_COPY[scene].title}</span>
              <span className="scene-selector__role-blurb">{SCENE_COPY[scene].blurb}</span>
            </a>
          </li>
        ))}
      </ul>

      <p className="scene-selector__note">
        Each screen has its own address — bookmark it, or paste it into your OBS browser source.
      </p>
    </section>
  );
}
