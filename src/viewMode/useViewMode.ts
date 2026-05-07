export type ViewMode = 'player' | 'gm';

export function useViewMode(): ViewMode {
  if (typeof window === 'undefined') return 'player';
  const mode = new URLSearchParams(window.location.search).get('mode');
  return mode === 'gm' ? 'gm' : 'player';
}
