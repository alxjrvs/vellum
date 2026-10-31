// @vitest-environment node
import { afterEach, describe, expect, it } from 'vitest';
import { WebSocket } from 'ws';
import { DeckBridge } from './bridge';
import { conditionKey, frameKey, trackKey } from './keyImage';

const PORT = 28197;

function open(origin: string): Promise<WebSocket> {
  return new Promise((resolve, reject) => {
    const socket = new WebSocket(`ws://127.0.0.1:${PORT}`, { origin });
    socket.once('open', () => resolve(socket));
    socket.once('error', reject);
  });
}

function nextMessage(socket: WebSocket): Promise<unknown> {
  return new Promise((resolve) =>
    socket.once('message', (data) => resolve(JSON.parse(String(data))))
  );
}

function settle(): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, 30));
}

describe('DeckBridge', () => {
  let bridge: DeckBridge;
  afterEach(() => bridge.stop());

  it('refuses pages that are not Vellum', async () => {
    bridge = new DeckBridge(PORT);
    await bridge.start();
    await expect(open('https://example.com')).rejects.toThrow();
    expect(bridge.connected).toBe(false);
  });

  it('merges page reports and sends commands to every page', async () => {
    bridge = new DeckBridge(PORT);
    await bridge.start();
    expect(bridge.send({ type: 'frame.cycle', delta: 1 })).toBe(false);

    const player = await open('https://vellumhud.com');
    const gm = await open('http://localhost:5173');
    player.send(
      JSON.stringify({
        type: 'state',
        state: {
          tracks: { hope: { label: 'Hope', value: 2, max: 6 } },
          conditions: { hidden: true },
        },
      })
    );
    gm.send(
      JSON.stringify({
        type: 'state',
        state: { tracks: { fear: { label: 'Fear', value: 3, max: 12 } } },
      })
    );
    gm.send('garbage');
    await settle();
    expect(bridge.state.tracks?.hope?.value).toBe(2);
    expect(bridge.state.tracks?.fear?.value).toBe(3);
    expect(bridge.state.conditions?.hidden).toBe(true);

    const toPlayer = nextMessage(player);
    const toGm = nextMessage(gm);
    expect(bridge.send({ type: 'track.adjust', track: 'fear', delta: 1 })).toBe(true);
    const expected = {
      type: 'command',
      command: { type: 'track.adjust', track: 'fear', delta: 1 },
    };
    expect(await toPlayer).toEqual(expected);
    expect(await toGm).toEqual(expected);

    // A page that closes takes its report with it.
    gm.close();
    await settle();
    expect(bridge.state.tracks?.fear).toBeUndefined();
    player.close();
  });
});

describe('key faces', () => {
  it('draws the live value, or a dash while no HUD is connected', () => {
    expect(trackKey('hope', 'Hope', { label: 'Hope', value: 3, max: 6 }, 1)).toContain('>3/6<');
    expect(trackKey('hope', 'Hope', undefined, 1)).toContain('>–<');
    expect(conditionKey('Hidden', true)).toContain('>ON<');
    expect(conditionKey('Hidden', false)).toContain('>OFF<');
  });

  it('escapes frame names, which players write themselves', () => {
    const svg = frameKey('<script>&', 1);
    expect(svg).toContain('&lt;script&gt;&amp;');
    expect(svg).not.toContain('<script>');
  });
});
