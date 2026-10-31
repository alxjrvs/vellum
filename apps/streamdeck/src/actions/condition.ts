import {
  SingletonAction,
  type DidReceiveSettingsEvent,
  type KeyAction,
  type KeyDownEvent,
  type WillAppearEvent,
} from '@elgato/streamdeck';
import { CORE_CONDITION_IDS, type CoreConditionId } from '../../../../src/systems/types';
import type { DeckBridge } from '../bridge';
import { conditionKey, toDataUrl } from '../keyImage';

type ConditionSettings = { condition?: string };

const LABELS: Record<CoreConditionId, string> = {
  hidden: 'Hidden',
  restrained: 'Restrained',
  vulnerable: 'Vulnerable',
};

function readCondition(settings: ConditionSettings): CoreConditionId {
  return (CORE_CONDITION_IDS as readonly string[]).includes(settings.condition ?? '')
    ? (settings.condition as CoreConditionId)
    : 'hidden';
}

/** Toggles a condition, and lights up while it is on. */
export class ConditionAction extends SingletonAction<ConditionSettings> {
  override readonly manifestId = 'com.vellumhud.vellum.condition';

  constructor(private readonly bridge: DeckBridge) {
    super();
    bridge.onChange(() =>
      this.actions.forEach((action) => {
        if (!action.isKey()) return;
        void action.getSettings().then((settings) => this.draw(action, settings));
      })
    );
  }

  override async onWillAppear(ev: WillAppearEvent<ConditionSettings>): Promise<void> {
    if (ev.action.isKey()) await this.draw(ev.action, ev.payload.settings);
  }

  override async onDidReceiveSettings(
    ev: DidReceiveSettingsEvent<ConditionSettings>
  ): Promise<void> {
    if (ev.action.isKey()) await this.draw(ev.action, ev.payload.settings);
  }

  override async onKeyDown(ev: KeyDownEvent<ConditionSettings>): Promise<void> {
    const condition = readCondition(ev.payload.settings);
    if (!this.bridge.send({ type: 'condition.toggle', condition })) await ev.action.showAlert();
  }

  private async draw(
    action: KeyAction<ConditionSettings>,
    settings: ConditionSettings
  ): Promise<void> {
    const condition = readCondition(settings);
    const on = this.bridge.state.conditions?.[condition];
    await action.setImage(toDataUrl(conditionKey(LABELS[condition], on)));
  }
}
