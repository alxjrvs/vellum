import { daggerheartTheme } from '../../themes/daggerheart.theme';
import type { ThemeConfig } from '../../themes/types';

/**
 * Ledger: the same chassis in cold steel, with every stat drawn as a bar.
 * Reads at a glance on a busy Discord grid.
 */
export const daggerheartLedger: ThemeConfig = {
  ...daggerheartTheme,
  id: 'daggerheart-ledger',
  label: 'Ledger',
  colors: {
    night: '#070b10',
    plate: '#0f1620',
    plateRaised: '#1a2431',
    rule: '#2e3d50',
    text: '#eef3f8',
    label: '#dbe4ee',
    muted: '#8796a8',
    signal: '#5cc8ff',
    signalInk: '#04121b',
    hit: '#ff5a4e',
    stress: '#ffa24a',
    armor: '#9fb8d6',
    fear: '#b598ff',
    nameplate: '#eef3f8',
    nameplateInk: '#0a1018',
    player: '#5cc8ff',
  },
  tracks: {
    hp: 'bar',
    stress: 'bar',
    hope: 'bar',
    armor: 'bar',
    fear: 'bar',
  },
};
