export interface ThemeColors {
  readonly parchment: string;
  readonly ink: string;
  readonly inkMuted: string;
  readonly gold: string;
  readonly accent: string;
  readonly danger: string;
  readonly cardSurface: string;
  readonly cardBorder: string;
}

export interface ThemeTypography {
  readonly fontFamilyDisplay: string;
  readonly fontFamilyBody: string;
  readonly fontSizeBase: string;
  readonly fontSizeHeading: string;
  readonly fontSizeLabel: string;
}

export interface ThemeLayout {
  readonly spacingXs: string;
  readonly spacingSm: string;
  readonly spacingMd: string;
  readonly spacingLg: string;
  readonly radiusSm: string;
  readonly radiusMd: string;
  readonly borderWidth: string;
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
