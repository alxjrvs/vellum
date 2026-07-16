#!/usr/bin/env bash
#
# Installs the "Vellum" OBS scene collection with the Vellum HUD browser
# source pre-configured (1920x1080, transparent, pointed at your built
# dist/index.html). Idempotent and non-destructive: it only writes a scene
# collection named "Vellum" and never touches your other collections.
#
# Usage:  obs/setup-obs.sh [/absolute/path/to/dist/index.html]
# Default dist path: <this repo>/dist/index.html
#
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
TEMPLATE="$REPO_ROOT/obs/vellum.scene.json"
DIST="${1:-$REPO_ROOT/dist/index.html}"
OBS_SCENES="$HOME/Library/Application Support/obs-studio/basic/scenes"
DEST="$OBS_SCENES/Vellum.json"

# --- guards -----------------------------------------------------------------
if pgrep -x OBS >/dev/null 2>&1; then
  echo "✗ OBS is running. Quit OBS first — it overwrites scene files on exit." >&2
  exit 1
fi

if [ ! -f "$TEMPLATE" ]; then
  echo "✗ Missing scene template: $TEMPLATE" >&2
  exit 1
fi

if [ ! -f "$DIST" ]; then
  echo "⚠ dist not found at: $DIST"
  echo "  Build it first:  bun run build   (produces dist/index.html)"
  echo "  Installing the scene anyway — the browser source will render once the file exists."
fi

# --- install ----------------------------------------------------------------
mkdir -p "$OBS_SCENES"

# uuidgen is present on macOS; fall back to a fixed pair if somehow absent.
BROWSER_UUID="$(uuidgen 2>/dev/null || echo 'E6643B1A-D291-44B1-A382-B8350D199E12')"
SCENE_UUID="$(uuidgen 2>/dev/null || echo 'F3F43729-6509-4A4D-87FE-768E87A40F41')"

# Escape the dist path for safe sed substitution (handles spaces/slashes).
esc_dist="$(printf '%s' "$DIST" | sed 's/[&/\]/\\&/g')"

sed -e "s/__VELLUM_DIST__/$esc_dist/g" \
    -e "s/__BROWSER_UUID__/$BROWSER_UUID/g" \
    -e "s/__SCENE_UUID__/$SCENE_UUID/g" \
    "$TEMPLATE" > "$DEST"

echo "✓ Installed OBS scene collection 'Vellum' -> $DEST"
echo "  Browser source points at: $DIST"
echo
echo "Next, in OBS:"
echo "  1. Scene Collection menu → select 'Vellum' (if not already active)."
echo "  2. Sources → + → Video Capture Device → pick your webcam →"
echo "     drag it BELOW 'Vellum HUD' so the HUD composites on top."
echo "  3. Start Virtual Camera (approve the macOS system-extension prompt"
echo "     the first time), then select 'OBS Virtual Camera' in Discord."
