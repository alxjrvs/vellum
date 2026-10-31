#!/usr/bin/env bun
/**
 * Builds the Stream Deck plugin into a single installable file:
 *
 *   dist/com.vellumhud.vellum.streamDeckPlugin
 *
 * That file is a zip of the .sdPlugin folder; double-clicking it installs the
 * plugin into the Stream Deck app. The plugin's code is bundled into one
 * ES module so the folder needs no node_modules.
 */
import { $ } from 'bun';
import { cpSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const root = join(import.meta.dir, '..');
const pluginDir = 'com.vellumhud.vellum.sdPlugin';
const stage = join(root, 'dist', 'stage');
const out = join(stage, pluginDir);
const target = join(root, 'dist', 'com.vellumhud.vellum.streamDeckPlugin');

rmSync(join(root, 'dist'), { recursive: true, force: true });
mkdirSync(join(out, 'bin'), { recursive: true });
cpSync(join(root, pluginDir), out, { recursive: true });

const result = await Bun.build({
  entrypoints: [join(root, 'src', 'plugin.ts')],
  outdir: join(out, 'bin'),
  naming: 'plugin.js',
  target: 'node',
  format: 'esm',
  minify: false,
});
if (!result.success) {
  for (const log of result.logs) console.error(log);
  process.exit(1);
}
writeFileSync(join(out, 'bin', 'package.json'), JSON.stringify({ type: 'module' }) + '\n');

await $`zip -qr -X ${target} ${pluginDir}`.cwd(stage);
rmSync(stage, { recursive: true, force: true });
console.log(`built ${target}`);
