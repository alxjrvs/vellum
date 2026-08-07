# OBS control for AI agents (optional, development-only)

Vellum is an OBS overlay, so the highest-signal question during development is
one only OBS can answer: **what does the browser source actually render, at the
size it is actually configured?** A headless browser approximates it — but it
cannot tell you that the source is 1280 wide when the layout assumes 1920, which
is exactly the bug that shipped as [#64](https://github.com/alxjrvs/vellum/pull/64).

The repo therefore declares an optional MCP server in `.mcp.json` that lets an
AI coding agent talk to a running OBS over the **obs-websocket** protocol: read
a source's real width/height, save a screenshot of it, switch scenes, refresh a
browser source.

**Nothing about this ships to users.** It is a development convenience; the app
itself is unchanged, still local-only, and still makes no network calls.

## Trust posture — read before enabling

- The server is **third-party** ([`royshil/obs-mcp`](https://github.com/royshil/obs-mcp),
  GPL-2.0), not an official OBS or Anthropic component.
- It is **pinned to an exact version** (`obs-mcp@1.1.0`) rather than `@latest`.
  A floating tag would let a new upstream publish run as unattended code on
  every launch; pin bumps are a reviewed change instead.
- It talks only to `ws://localhost:4455`. Nothing leaves the machine — but an
  agent holding it **can start and stop your stream and recording, and capture
  images of your sources**, so enable it deliberately.
- A project-scoped MCP server is **not** enabled just because you cloned the
  repo: Claude Code asks you to approve `.mcp.json` servers before it will run
  them. Declining costs you nothing else.

## Setup

1. **Enable the OBS WebSocket server** — OBS → **Tools → WebSocket Server
   Settings** → enable, then **Show Connect Info** and copy the password.

2. **Store the password.** The checked-in config resolves it through 1Password
   rather than holding a literal, so `.mcp.json` stays committable:

   ```
   op item create --category "API Credential" --vault claude-agent \
     --title obs-websocket credential="$(pbpaste)"
   ```

   `pbpaste` keeps the password out of shell history. `op run` resolves the
   `op://` reference in-process at launch, so the secret never lands on disk.

3. **Approve the server** when your agent next starts in this repo.

## If the server won't start

- **It fails immediately with a 1Password error.** The item does not exist or
  the reference is wrong — check `op://claude-agent/obs-websocket/credential`
  resolves for you, and see the next section if that vault isn't yours.
- **It starts but never completes the MCP handshake.** `op run` conceals secrets
  in the subprocess's stdout/stderr by default, and an MCP stdio server speaks
  JSON-RPC over exactly those streams. Newline-delimited JSON should pass
  through untouched — and wrapping MCP servers in `op run` is 1Password's own
  published recommendation — but that combination is not something their docs
  address explicitly. If the handshake hangs, add `--no-masking` to the `op run`
  arguments to rule it out. Note that this trades the safety net: with masking
  off, anything the server prints is printed verbatim.
- **It fails offline.** `npx` fetches the pinned package on first use and caches
  it; the first launch needs network.

## If you don't have that 1Password vault

The `op://claude-agent/obs-websocket/credential` reference in `.mcp.json` is
maintainer-specific and will not resolve for you. Two ways round it:

- **Point it at your own secret.** Edit the `env` value to your own `op://`
  reference — a one-line local change.
- **Skip the secret manager.** Register your own copy at local scope, which
  keeps your credentials out of the tracked file:

  ```
  claude mcp add obs-local -e OBS_WEBSOCKET_PASSWORD='<password>' \
    -- npx -y obs-mcp@1.1.0
  ```

  If you have turned OBS's WebSocket authentication off entirely, drop the
  `-e` flag — the server connects unauthenticated.

Do **not** commit a literal password into `.mcp.json`.
