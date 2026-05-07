import type { ThemeConfig } from './types';

function kebab(key: string): string {
  return key.replace(/[A-Z]/g, (m) => `-${m.toLowerCase()}`);
}

export function themeToCssVars(theme: ThemeConfig): Record<string, string> {
  const vars: Record<string, string> = {};
  for (const [name, value] of Object.entries(theme.colors)) {
    vars[`--color-${kebab(name)}`] = value;
  }
  for (const [name, value] of Object.entries(theme.typography)) {
    vars[`--${kebab(name)}`] = value;
  }
  for (const [name, value] of Object.entries(theme.layout)) {
    vars[`--${kebab(name)}`] = value;
  }
  return vars;
}
