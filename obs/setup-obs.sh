#!/usr/bin/env bash
#
# Installs the "Vellum" OBS scene collection with the Vellum HUD browser
# source pre-configured (1920x1080, transparent) pointed at the hosted Vellum
# app. No build/dist needed — the browser source loads a constant hosted URL.
# Idempotent and non-destructive: it only writes a scene collection named
# "Vellum" and never touches your other collections.
#
# Supports macOS and Linux.
#
# Usage:  obs/setup-obs.sh
#
set -euo pipefail

# --- config -----------------------------------------------------------------
# The hosted Vellum HUD. Change this one line to point at a different deploy.
VELLUM_URL="https://alxjrvs.github.io/vellum/app/#/daggerheart/player"

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
TEMPLATE="$REPO_ROOT/obs/vellum.scene.json"

# --- OS detection -----------------------------------------------------------
case "$(uname -s)" in
  Darwin)
    OBS_SCENES="$HOME/Library/Application Support/obs-studio/basic/scenes"
    OBS_PROC="OBS"
    ;;
  Linux)
    OBS_SCENES="$HOME/.config/obs-studio/basic/scenes"
    OBS_PROC="obs"
    ;;
  *)
    echo "✗ Unsupported OS: $(uname -s). Use setup-obs.ps1 on Windows." >&2
    exit 1
    ;;
esac
DEST="$OBS_SCENES/Vellum.json"

# --- guards -----------------------------------------------------------------
if pgrep -x "$OBS_PROC" >/dev/null 2>&1; then
  echo "✗ OBS is running. Quit OBS first — it overwrites scene files on exit." >&2
  exit 1
fi

if [ ! -f "$TEMPLATE" ]; then
  echo "✗ Missing scene template: $TEMPLATE" >&2
  exit 1
fi

# --- install ----------------------------------------------------------------
mkdir -p "$OBS_SCENES"

# Regenerate fresh UUIDs so each install is unique. Fall back to the template's
# fixed pair if uuidgen is somehow absent.
BROWSER_UUID="$(uuidgen 2>/dev/null | tr '[:upper:]' '[:lower:]' || echo 'a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d')"
SCENE_UUID="$(uuidgen 2>/dev/null | tr '[:upper:]' '[:lower:]' || echo 'f9e8d7c6-b5a4-4938-8271-6a5b4c3d2e1f')"

# Swap the template's fixed UUIDs for the freshly generated pair so parallel
# installs never share source identifiers.
sed -e "s/a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d/$BROWSER_UUID/g" \
    -e "s/f9e8d7c6-b5a4-4938-8271-6a5b4c3d2e1f/$SCENE_UUID/g" \
    "$TEMPLATE" > "$DEST"

echo "✓ Installed OBS scene collection 'Vellum' -> $DEST"
echo "  Browser source points at: $VELLUM_URL"
echo
echo "Next, in OBS:"
echo "  1. Scene Collection menu → select 'Vellum' (if not already active)."
echo "  2. Sources → + → Video Capture Device → pick your webcam →"
echo "     drag it BELOW 'Vellum HUD' so the HUD composites on top."
echo "  3. Start Virtual Camera (approve the OS system-extension/permission"
echo "     prompt the first time), then select 'OBS Virtual Camera' in Discord."
