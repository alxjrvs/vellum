/**
 * What Vellum does, and how far along each piece is. The site never claims
 * something ships before it does: every feature carries a status, and the
 * home page rundown and the roadmap page both read from this list.
 *
 * live  = in the current release
 * next  = being built now
 * later = planned, not started
 */
export type Status = 'live' | 'next' | 'later';

export const statusLabel: Record<Status, string> = {
  live: 'Live',
  next: 'Next',
  later: 'Later',
};

export interface Feature {
  id: string;
  title: string;
  blurb: string;
  status: Status;
  href?: string;
}

export const features: Feature[] = [
  {
    id: 'camera-hud',
    title: 'Your HUD is your camera',
    blurb:
      'OBS draws the HUD over your webcam and its Virtual Camera carries it into Discord. The table sees your stats on your own tile.',
    status: 'live',
    href: '/docs/',
  },
  {
    id: 'paste-and-play',
    title: 'One link, set once',
    blurb:
      'Your character packs into a single URL. Paste it into OBS once and it stays put for the whole campaign.',
    status: 'live',
    href: '/docs/',
  },
  {
    id: 'daggerheart',
    title: 'Daggerheart, player and GM',
    blurb:
      'Hope, HP, Stress, Armor, conditions and damage thresholds for players. A Fear track for the GM.',
    status: 'live',
  },
  {
    id: 'bars-chits',
    title: 'Bars or chits, per frame',
    blurb:
      'Each frame decides how every stat draws. The same HP can be a bar in one frame and chits in another.',
    status: 'live',
    href: '/frames/',
  },
  {
    id: 'frame-picker',
    title: 'Pick a frame per game',
    blurb:
      'Choose an official or community frame for each game. Your choice rides in the same link, so OBS picks it up.',
    status: 'live',
    href: '/frames/',
  },
  {
    id: 'library',
    title: 'The Frame Library',
    blurb:
      'Official frames from us, community frames by pull request. Every frame ships inside the app, so picking one contacts no server.',
    status: 'live',
    href: '/library/',
  },
  {
    id: 'hotkeys',
    title: 'Hotkeys',
    blurb:
      'Load one script in OBS and bind keys to +1 Hope, mark HP, toggle a condition. Your hands stay on the game.',
    status: 'live',
    href: '/control/',
  },
  {
    id: 'streamdeck-basic',
    title: 'Stream Deck, day one',
    blurb:
      "Point Stream Deck's built-in Hotkey action at the Vellum hotkeys. No plugin, no extra setup.",
    status: 'live',
    href: '/control/',
  },
  {
    id: 'face-anchors',
    title: 'Light face tracking',
    blurb:
      'Widgets can follow your face: a crown over your head, a nameplate under your chin. Off by default, and the camera never leaves your machine.',
    status: 'live',
    href: '/tracking/',
  },
  {
    id: 'frame-creator',
    title: 'The frame creator',
    blurb:
      'Place widgets, choose bars or chits and colors, and preview the real HUD at Discord tile size. Your frames stay yours; export one to share it.',
    status: 'live',
    href: '/frames/',
  },
  {
    id: 'streamdeck-plugin',
    title: 'Stream Deck plugin',
    blurb:
      'Keys that show your live Hope, HP and conditions, and dials on Stream Deck +. It talks only to the HUD in OBS on your own machine.',
    status: 'live',
    href: '/control/',
  },
  {
    id: 'more-systems',
    title: 'More games',
    blurb:
      'Systems become config: resources, conditions and a character sheet. Daggerheart is the reference; yours is next.',
    status: 'later',
  },
];
