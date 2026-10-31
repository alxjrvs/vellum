# Vellum for OBS

`vellum.lua` is the whole OBS side of Vellum, in one script that OBS runs
itself on Windows, macOS and Linux (OBS 28 or newer; Lua ships with OBS, so
there is nothing else to install). The deploy publishes it at
`https://vellumhud.com/downloads/vellum.lua`. The user guide is `apps/site/src/content/docs/docs/index.mdx`
(vellumhud.com/docs/), with details in `docs/obs-script.mdx`.

## What it does

**Setup.** The script's panel (Tools → Scripts → vellum.lua) has three
controls: **Your Vellum link**, **Camera**, and **Set up Vellum**. Pressing the
button:

1. creates the **Vellum** scene if it doesn't exist (other scenes are never
   touched);
2. creates or updates **Vellum Camera**, a Video Capture Device for the chosen
   webcam, at the bottom of the scene;
3. creates or updates **Vellum HUD**, a 1920×1080 browser source on the link,
   at the top;
4. fits both to the canvas, switches to the scene, and starts the Virtual
   Camera.

It is idempotent: running it again updates the same three sources. A
same-named source of another kind is left alone and the panel says so. The
camera list comes from OBS's own webcam source (`macos-avcapture`,
`av_capture_input`, `dshow_input` or `v4l2_input`, whichever this OBS has).
Choosing **Vellum draws the camera (face tracking)** hides Vellum Camera so
the page can open the webcam itself (OBS needs `--enable-media-stream`).
Pasting a new link later updates Vellum HUD straight away.

**Hotkeys.** The script registers `Vellum: …` hotkeys (Settings → Hotkeys):
Hope, HP, Stress, Armor and Fear up and down, the three conditions, and next or
previous frame. A press calls the browser source's own `javascript_event` proc
with a `vellum:command` event whose detail is the command JSON (see
`packages/protocol/src/commands.ts`), so there is no websocket, password or network. Only
browser sources whose URL is on `vellumhud.com` (or `localhost`/`127.0.0.1`)
receive them. Keep the hotkey ids stable: OBS saves bindings by id.

**Announcement.** Every 3 seconds, and right after Set up, the script sends a
`vellum:obs-script` event with `{"version":1}` to the same Vellum browser
sources, so the page's setup checks can tell the script is loaded.

## Stream Deck plugin (live keys)

For keys that show your current values, install the Vellum plugin instead of
binding hotkeys: download `https://vellumhud.com/downloads/vellum.streamDeckPlugin`
and double-click it. It adds **Stat**, **Condition** and **Frame** actions (Stat
also works on Stream Deck + dials). The plugin listens on `127.0.0.1:28196`;
the Vellum page inside OBS connects to it on its own, so there is nothing to
configure in OBS. Source: `apps/streamdeck`.

## Tests

`src/commands/obsScript.test.ts` runs this file under
[fengari](https://fengari.io/) (Lua in JavaScript) against a fake `obslua`
(`src/commands/fakeObslua.lua`), checking the scene it builds, the camera
list, link updates, and that every hotkey sends a command the app accepts.
The fake only covers the calls the script makes; add to it when the script
calls something new.

## Why a script

OBS's extension points, and why this one:

| Mechanism               | Verdict                                                                                                 |
| ----------------------- | ------------------------------------------------------------------------------------------------------- |
| Lua script              | **Used.** Ships with OBS on every OS; can build scenes, start the Virtual Camera and register hotkeys.  |
| Python script           | Same API, but the user must install Python and point OBS at it.                                         |
| Native plugin (C/C++)   | Per-OS builds, an installer, and macOS signing, for nothing a script can't do.                          |
| Scene collection import | Can't know the user's webcam, and importing switches the whole collection. (Vellum shipped one before.) |
| Custom browser dock     | Keeps its own storage, separate from browser sources, so it can't carry the character into the HUD.     |
| obs-websocket           | Needs the user to enable it and set a password; the Stream Deck plugin uses a loopback socket instead.  |

## Frame addresses

There is one app. Every frame has its own address, and the frame decides the
screen: a player frame shows a character's HUD, a GM frame shows Fear.

| Frame                | URL                                                    |
| -------------------- | ------------------------------------------------------ |
| Daggerheart – Player | `https://vellumhud.com/app/frames/daggerheart-player/` |
| Daggerheart – GM     | `https://vellumhud.com/app/frames/daggerheart-gm/`     |
| Ledger               | `https://vellumhud.com/app/frames/daggerheart-ledger/` |

With no link pasted, the script uses the Daggerheart – Player address. Your own
frames get an address too (`/app/frames/custom-…/`); a copied link carries the
frame itself. Old addresses (`/app/daggerheart/player/`,
`/app/daggerheart/gm/`, `#/` links, `?mode=gm`) still load and move to the
matching frame.

## Manual setup

Without the script's Set up button: add a Browser source (the link,
1920×1080), add a Video Capture Device below it, start the Virtual Camera, and
choose OBS Virtual Camera in Discord. Hotkeys still need the script loaded.
