#Requires -Version 5.1
#
# Installs the "Vellum" OBS scene collection with the Vellum HUD browser
# source pre-configured (1920x1080, transparent) pointed at the hosted Vellum
# app. No build/dist needed — the browser source loads a constant hosted URL.
# Idempotent and non-destructive: it only writes a scene collection named
# "Vellum" and never touches your other collections.
#
# Windows PowerShell equivalent of setup-obs.sh.
#
# Usage:  powershell -ExecutionPolicy Bypass -File obs\setup-obs.ps1
#
$ErrorActionPreference = 'Stop'
Set-StrictMode -Version Latest

# --- config -----------------------------------------------------------------
# The hosted Vellum HUD. Change this one line to point at a different deploy.
$VellumUrl = 'https://alxjrvs.github.io/vellum/app/'

$RepoRoot  = Split-Path -Parent $PSScriptRoot
$Template  = Join-Path $PSScriptRoot 'vellum.scene.json'
$ObsScenes = Join-Path $env:APPDATA 'obs-studio\basic\scenes'
$Dest      = Join-Path $ObsScenes 'Vellum.json'

# --- guards -----------------------------------------------------------------
if (Get-Process obs64 -ErrorAction SilentlyContinue) {
  Write-Error 'OBS is running. Quit OBS first — it overwrites scene files on exit.'
  exit 1
}

if (-not (Test-Path -LiteralPath $Template)) {
  Write-Error "Missing scene template: $Template"
  exit 1
}

# --- install ----------------------------------------------------------------
New-Item -ItemType Directory -Force -Path $ObsScenes | Out-Null

# Regenerate fresh UUIDs so each install is unique.
$BrowserUuid = [guid]::NewGuid().ToString()
$SceneUuid   = [guid]::NewGuid().ToString()

# Swap the template's fixed UUIDs for the freshly generated pair so parallel
# installs never share source identifiers.
$content = Get-Content -LiteralPath $Template -Raw
$content = $content -replace 'a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d', $BrowserUuid
$content = $content -replace 'f9e8d7c6-b5a4-4938-8271-6a5b4c3d2e1f', $SceneUuid
Set-Content -LiteralPath $Dest -Value $content -NoNewline -Encoding UTF8

Write-Host "OK Installed OBS scene collection 'Vellum' -> $Dest"
Write-Host "   Browser source points at: $VellumUrl"
Write-Host ''
Write-Host 'Next, in OBS:'
Write-Host "  1. Scene Collection menu -> select 'Vellum' (if not already active)."
Write-Host '  2. Sources -> + -> Video Capture Device -> pick your webcam ->'
Write-Host "     drag it BELOW 'Vellum HUD' so the HUD composites on top."
Write-Host '  3. Start Virtual Camera, then select the OBS virtual camera in Discord.'
