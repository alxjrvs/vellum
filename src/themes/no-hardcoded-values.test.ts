import { describe, expect, it } from 'vitest';

/*
 * AC #3 of issue #21: no hardcoded color values may exist outside
 * src/themes/. Every component stylesheet must reference the theme via
 * var(--token-name). This test scans component CSS via import.meta.glob
 * and fails if any hex / rgb / rgba literal escapes the theme directory.
 */

const componentStyles = import.meta.glob('/src/**/*.css', {
  query: '?raw',
  import: 'default',
  eager: true,
}) as Record<string, string>;

const COLOR_LITERAL = /(#[0-9a-fA-F]{3,8}\b|\brgba?\s*\()/;

describe('no hardcoded color values outside src/themes/', () => {
  it('every .css file under src/ references colors only via var(--token)', () => {
    const offenders: string[] = [];
    for (const [path, body] of Object.entries(componentStyles)) {
      if (path.startsWith('/src/themes/')) continue;
      for (const [i, line] of body.split('\n').entries()) {
        if (COLOR_LITERAL.test(line)) {
          offenders.push(`${path}:${i + 1}: ${line.trim()}`);
        }
      }
    }
    expect(offenders).toEqual([]);
  });
});
