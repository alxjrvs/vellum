declare global {
  interface Window {
    /**
     * The OBS Browser Source injects this object into every page it renders,
     * so its presence is how a page tells "I'm the OBS source itself" apart
     * from "a normal browser tab". The shape carries the plugin version and a
     * handful of control methods; we only care that it exists, so the members
     * stay loosely typed rather than `any`.
     * See https://obsproject.com/kb/browser-source-controls.
     */
    obsstudio?: {
      readonly pluginVersion?: string;
      readonly [key: string]: unknown;
    };
  }
}

/** True when the page is rendering inside the OBS Browser Source (not a tab). */
export function isInsideObs(): boolean {
  return typeof window !== 'undefined' && typeof window.obsstudio !== 'undefined';
}
