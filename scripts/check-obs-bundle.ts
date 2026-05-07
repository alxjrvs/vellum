#!/usr/bin/env bun
import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const distDir = join(process.cwd(), 'dist');
const indexPath = join(distDir, 'index.html');

if (!existsSync(indexPath)) {
  console.error(`obs:check expected ${indexPath} — run \`bun run build\` first.`);
  process.exit(1);
}

const html = readFileSync(indexPath, 'utf8');
const failures: string[] = [];

const absoluteAssetMatches = html.match(/(?:src|href)="\/assets\//g);
if (absoluteAssetMatches) {
  failures.push(
    `dist/index.html references absolute asset paths: ${absoluteAssetMatches.join(', ')}. ` +
      `OBS loads via file:// — vite.config.ts must keep base: './'.`
  );
}

const referencedAssets = [...html.matchAll(/(?:src|href)="\.\/(assets\/[^"]+)"/g)].map((m) => m[1]);
for (const asset of referencedAssets) {
  if (!existsSync(join(distDir, asset))) {
    failures.push(`Referenced asset missing from dist: ${asset}`);
  }
}

const cssAssets = referencedAssets.filter((a) => a.endsWith('.css'));
if (cssAssets.length === 0) {
  failures.push(
    'No CSS asset referenced from dist/index.html — body transparency cannot be verified.'
  );
}
const transparentBody =
  /(?:^|\})\s*(?:html\s*,\s*body|body\s*,\s*html|body)\s*\{[^}]*background\s*:\s*(?:transparent|rgba?\([^)]*?,\s*0\s*\))/i;
const cssWithTransparentBody = cssAssets.some((asset) => {
  const css = readFileSync(join(distDir, asset), 'utf8');
  return transparentBody.test(css);
});
if (cssAssets.length > 0 && !cssWithTransparentBody) {
  failures.push(
    'No bundled CSS sets a transparent body background — OBS browser source needs alpha to composite the webcam through (architecture §8.2).'
  );
}

if (failures.length > 0) {
  console.error('obs:check failed:');
  for (const f of failures) console.error(`  - ${f}`);
  process.exit(1);
}

console.log(
  `obs:check ok — ${referencedAssets.length} relative asset(s), all resolved under dist/.`
);
