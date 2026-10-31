import streamDeck from '@elgato/streamdeck';
import { ConditionAction } from './actions/condition';
import { FrameAction } from './actions/frame';
import { TrackAction } from './actions/track';
import { DeckBridge } from './bridge';

/**
 * The Vellum Stream Deck plugin. It listens on 127.0.0.1 for the Vellum HUD
 * running in OBS on this same computer, sends it key presses, and draws its
 * live values on the keys. It makes no other connection.
 */
const bridge = new DeckBridge(undefined, (message) => streamDeck.logger.info(message));

streamDeck.actions.registerAction(new TrackAction(bridge));
streamDeck.actions.registerAction(new ConditionAction(bridge));
streamDeck.actions.registerAction(new FrameAction(bridge));

void bridge.start();
void streamDeck.connect();
