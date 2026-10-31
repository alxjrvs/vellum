import {
  SingletonAction,
  type DidReceiveSettingsEvent,
  type KeyAction,
  type KeyDownEvent,
  type WillAppearEvent,
} from '@elgato/streamdeck';
import type { DeckBridge } from '../bridge';
import { frameKey, toDataUrl } from '../keyImage';

type FrameSettings = { direction?: string };

function readDelta(settings: FrameSettings): number {
  return settings.direction === 'prev' ? -1 : 1;
}

/** Steps to the next or previous frame, and shows the one being worn. */
export class FrameAction extends SingletonAction<FrameSettings> {
  override readonly manifestId = 'com.vellumhud.vellum.frame';

  constructor(private readonly bridge: DeckBridge) {
    super();
    bridge.onChange(() =>
      this.actions.forEach((action) => {
        if (!action.isKey()) return;
        void action.getSettings().then((settings) => this.draw(action, settings));
      })
    );
  }

  override async onWillAppear(ev: WillAppearEvent<FrameSettings>): Promise<void> {
    if (ev.action.isKey()) await this.draw(ev.action, ev.payload.settings);
  }

  override async onDidReceiveSettings(ev: DidReceiveSettingsEvent<FrameSettings>): Promise<void> {
    if (ev.action.isKey()) await this.draw(ev.action, ev.payload.settings);
  }

  override async onKeyDown(ev: KeyDownEvent<FrameSettings>): Promise<void> {
    const delta = readDelta(ev.payload.settings);
    if (!this.bridge.send({ type: 'frame.cycle', delta })) await ev.action.showAlert();
  }

  private async draw(action: KeyAction<FrameSettings>, settings: FrameSettings): Promise<void> {
    const frame = this.bridge.state.frame;
    await action.setImage(toDataUrl(frameKey(frame?.label, readDelta(settings))));
  }
}
