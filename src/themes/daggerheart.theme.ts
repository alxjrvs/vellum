import type { ThemeConfig } from './types';

/**
 * The official Daggerheart frame: the Vellum broadcast chassis in warm plates,
 * a parchment nameplate and a gilt player edge.
 */
export const daggerheartTheme: ThemeConfig = {
  id: 'daggerheart',
  label: 'Daggerheart',
  colors: {
    night: '#0f0a05',
    plate: '#1b140b',
    plateRaised: '#2a2013',
    rule: '#4a3a22',
    text: '#f3e6c4',
    label: '#e2d3ad',
    muted: '#a8977a',
    signal: '#e8b04a',
    signalInk: '#1a1208',
    hit: '#e4443a',
    stress: '#e07b3c',
    armor: '#7fa0c4',
    fear: '#a98bff',
    nameplate: '#f3e6c4',
    nameplateInk: '#1a1208',
    player: '#c9a14a',
  },
  typography: {
    fontFamilyDisplay: '"Barlow Condensed", "Arial Narrow", sans-serif',
    fontFamilyBody: '"Barlow", system-ui, sans-serif',
    fontSizeBase: '26px',
    fontSizeHeading: '52px',
    fontSizeLabel: '40px',
    fontSizeValue: '64px',
    fontSizeTitle: '76px',
  },
  layout: {
    spacingXs: '6px',
    spacingSm: '10px',
    spacingMd: '18px',
    spacingLg: '28px',
    spacingXl: '48px',
    radiusSm: '0px',
    radiusMd: '0px',
    borderWidth: '2px',
    trackHeight: '24px',
    chitWidth: '30px',
    barWidth: '240px',
    edgeWidth: '14px',
  },
  tracks: {
    hp: 'chits',
    stress: 'bar',
    hope: 'chits',
    armor: 'chits',
    fear: 'chits',
  },
};
