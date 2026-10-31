export type ViewMode = 'player' | 'gm';

/**
 * The system id this build is mounted with. Scene URLs are namespaced by it so
 * the address generalizes to other systems later: `/app/daggerheart/gm/`.
 */
export const SYSTEM_ID = 'daggerheart';

/** The scenes Daggerheart ships. `player` is the default when nothing is addressed. */
export const SCENES: readonly ViewMode[] = ['player', 'gm'];
