#!/usr/bin/env bash
# Assembles the deployable site into _pages/:
#
#   /                 the marketing site: apps/site/dist (Astro) when built,
#                     otherwise the legacy site/ (symlinks dereferenced)
#   /app/             the current build (latest)
#   /app/vX.Y.Z/      every released version, frozen
#
# Each deploy replaces the whole asset set, so a pinned URL only survives if
# every deploy re-publishes it. Released versions are rebuilt from their git
# tags (`vX.Y.Z`), and the current package.json version is published from the
# working tree, so a group mid-campaign keeps its pinned OBS URL across
# upgrades. Expects `bun run build` to have produced dist/ already.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
OUT="$ROOT/_pages"
VERSION="$(jq -r .version "$ROOT/package.json")"

rm -rf "$OUT"
mkdir -p "$OUT/app"
if [ -d "$ROOT/apps/site/dist" ]; then
  cp -R "$ROOT/apps/site/dist/." "$OUT/"
else
  cp -RL "$ROOT/site/." "$OUT/"
fi
# Platform files: response headers, and a fallback 404 if the site has none.
cp "$ROOT/deploy/_headers" "$OUT/_headers"
[ -f "$OUT/404.html" ] || cp "$ROOT/deploy/404.html" "$OUT/404.html"
cp -R "$ROOT/dist/." "$OUT/app/"
mkdir -p "$OUT/app/v$VERSION"
cp -R "$ROOT/dist/." "$OUT/app/v$VERSION/"

for tag in $(git -C "$ROOT" tag --list 'v*'); do
  [ "$tag" = "v$VERSION" ] && continue
  [ -d "$OUT/app/$tag" ] && continue
  echo "Rebuilding pinned $tag"
  tree="$(mktemp -d)"
  git -C "$ROOT" worktree add --detach "$tree" "$tag" >/dev/null
  (cd "$tree" && bun install --frozen-lockfile && bunx vite build --outDir "$OUT/app/$tag")
  git -C "$ROOT" worktree remove --force "$tree"
done

echo "Assembled $OUT (current v$VERSION)"
