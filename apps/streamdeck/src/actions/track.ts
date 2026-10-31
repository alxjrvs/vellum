import {
  SingletonAction,
  type DialAction,
  type DialRotateEvent,
  type DidReceiveSettingsEvent,
  type KeyAction,
  type KeyDownEvent,
  type TouchTapEvent,
  type WillAppearEvent,
} from '@elgato/streamdeck';
import { TRACK_IDS, type TrackId } from '@vellum/protocol';
import type { DeckBridge } from '../bridge';
import { TONES, toDataUrl, trackKey } from '../keyImage';

type TrackSettings = { track?: string; step?: number };

const LABELS: Record<TrackId, string> = {
  hope: 'Hope',
  hp: 'HP',
  stress: 'Stress',
  armor: 'Armor',
  fear: 'Fear',
};

function readSettings(settings: TrackSettings): { track: TrackId; step: number } {
  const track = (TRACK_IDS as readonly string[]).includes(settings.track ?? '')
    ? (settings.track as TrackId)
    : 'hope';
  const step = Number.isInteger(settings.step) ? (settings.step as number) : 1;
  return { track, step };
}

/**
 * A stat on a key or a Stream Deck + dial. A key adds its step (+1, -1, or 0
 * to only show the value); a dial turns the stat up and down and draws it on
 * the touch strip. Either way the value shown is the HUD's own, live.
 */
export class TrackAction extends SingletonAction<TrackSettings> {
  override readonly manifestId = 'com.vellumhud.vellum.track';

  constructor(private readonly bridge: DeckBridge) {
    super();
    bridge.onChange(() => this.redrawAll());
  }

  override async onWillAppear(ev: WillAppearEvent<TrackSettings>): Promise<void> {
    await this.draw(ev.action, ev.payload.settings);
  }

  override async onDidReceiveSettings(ev: DidReceiveSettingsEvent<TrackSettings>): Promise<void> {
    await this.draw(ev.action, ev.payload.settings);
  }

  override async onKeyDown(ev: KeyDownEvent<TrackSettings>): Promise<void> {
    const { track, step } = readSettings(ev.payload.settings);
    if (step === 0) return;
    if (!this.bridge.send({ type: 'track.adjust', track, delta: step }))
      await ev.action.showAlert();
  }

  override async onDialRotate(ev: DialRotateEvent<TrackSettings>): Promise<void> {
    const { track } = readSettings(ev.payload.settings);
    if (!this.bridge.send({ type: 'track.adjust', track, delta: ev.payload.ticks })) {
      await ev.action.showAlert();
    }
  }

  override async onTouchTap(ev: TouchTapEvent<TrackSettings>): Promise<void> {
    await this.draw(ev.action, ev.payload.settings);
  }

  private redrawAll(): void {
    this.actions.forEach((action) => {
      void action.getSettings().then((settings) => this.draw(action, settings));
    });
  }

  private async draw(
    action: KeyAction<TrackSettings> | DialAction<TrackSettings>,
    settings: TrackSettings
  ): Promise<void> {
    const { track, step } = readSettings(settings);
    const live = this.bridge.state.tracks?.[track];
    if (action.isDial()) {
      await action.setFeedback({
        title: live?.label ?? LABELS[track],
        value: live ? `${live.value}/${live.max}` : 'Open OBS',
        indicator: {
          value: live && live.max > 0 ? Math.round((100 * live.value) / live.max) : 0,
          bar_fill_c: TONES[track],
        },
      });
      return;
    }
    await action.setImage(toDataUrl(trackKey(track, LABELS[track], live, step)));
  }
}
