import type { ThemeConfig } from './types';

export const daggerheartTheme: ThemeConfig = {
  id: 'daggerheart',
  label: 'Daggerheart',
  colors: {
    parchment: '#f3e6c4',
    ink: '#1a1208',
    inkMuted: '#5a4a32',
    gold: '#c9a14a',
    accent: '#8a3a2a',
    danger: '#a62828',
    cardSurface: 'rgba(243, 230, 196, 0.96)',
    cardBorder: '#5a4a32',
  },
  typography: {
    fontFamilyDisplay: '"Cinzel", "Trajan Pro", "Times New Roman", serif',
    fontFamilyBody: '"Inter", "Helvetica Neue", system-ui, sans-serif',
    fontSizeBase: '16px',
    fontSizeHeading: '28px',
    fontSizeLabel: '12px',
  },
  layout: {
    spacingXs: '4px',
    spacingSm: '8px',
    spacingMd: '16px',
    spacingLg: '24px',
    radiusSm: '4px',
    radiusMd: '8px',
    borderWidth: '2px',
  },
};
