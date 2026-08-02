import { GameObject } from "xray16/alias";
import { extern } from "xray16/lib";

import { TreasureManager } from "@/engine/core/managers/treasures";
import { giveMoneyToActor } from "@/engine/core/utils/reward";

/**
 * Reward the actor with money and reveal treasure coordinates for the stalker outcome.
 *
 * @param firstSpeaker - First participant of the dialog (actor).
 * @param secondSpeaker - Second participant of the dialog (NPC).
 */
extern("dialogs_zaton.zat_b5_stalker_transfer_money", (firstSpeaker: GameObject, secondSpeaker: GameObject): void => {
  giveMoneyToActor(2500);
  TreasureManager.giveTreasureCoordinates("zat_hiding_place_7");
});

/**
 * Reward the actor with the full dealer payout.
 *
 * @param firstSpeaker - First participant of the dialog (actor).
 * @param secondSpeaker - Second participant of the dialog (NPC).
 */
extern("dialogs_zaton.zat_b5_dealer_full_revard", (firstSpeaker: GameObject, secondSpeaker: GameObject): void => {
  giveMoneyToActor(6_000);
});

/**
 * Reward the actor with the reduced dealer payout.
 *
 * @param firstSpeaker - First participant of the dialog (actor).
 * @param secondSpeaker - Second participant of the dialog (NPC).
 */
extern("dialogs_zaton.zat_b5_dealer_easy_revard", (firstSpeaker: GameObject, secondSpeaker: GameObject): void => {
  giveMoneyToActor(3_000);
});

/**
 * Reward the actor with money and reveal treasure coordinates for the bandit outcome.
 *
 * @param firstSpeaker - First participant of the dialog (actor).
 * @param secondSpeaker - Second participant of the dialog (NPC).
 */
extern("dialogs_zaton.zat_b5_bandits_revard", (firstSpeaker: GameObject, secondSpeaker: GameObject): void => {
  giveMoneyToActor(5_000);
  TreasureManager.giveTreasureCoordinates("zat_hiding_place_20");
});
