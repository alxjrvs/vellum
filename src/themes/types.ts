export interface ThemeColors {
  readonly parchment: string;
  readonly ink: string;
  readonly inkMuted: string;
  readonly gold: string;
  readonly accent: string;
  readonly danger: string;
  readonly cardSurface: string;
  readonly cardBorder: string;
  /** Heart-track health fill (video-game HP hearts). */
  readonly health: string;
  /** Cooler tone used to distinguish the Armor track. */
  readonly steel: string;
  /** Dark translucent backing for framed HUD widgets over a webcam feed. */
  readonly hudSurface: string;
  /** Stronger backing for the roll dock / nameplate. */
  readonly hudSurfaceStrong: string;
  /** Glowing frame border for HUD widgets. */
  readonly hudBorder: string;
}

export interface ThemeTypography {
  readonly fontFamilyDisplay: string;
  readonly fontFamilyBody: string;
  readonly fontSizeBase: string;
  readonly fontSizeHeading: string;
  readonly fontSizeLabel: string;
  /** Oversized nameplate / title lettering. */
  readonly fontSizeTitle: string;
}

export interface ThemeLayout {
  readonly spacingXs: string;
  readonly spacingSm: string;
  readonly spacingMd: string;
  readonly spacingLg: string;
  readonly spacingXl: string;
  readonly radiusSm: string;
  readonly radiusMd: string;
  readonly borderWidth: string;
  readonly pipSize: string;
  /** Edge length of an HP heart glyph. */
  readonly heartSize: string;
}

export interface DaggerheartThemeConfig {
  readonly id: 'daggerheart';
  readonly label: string;
  readonly colors: ThemeColors;
  readonly typography: ThemeTypography;
  readonly layout: ThemeLayout;
}

export type ThemeConfig = DaggerheartThemeConfig;

export type ThemeId = ThemeConfig['id'];
