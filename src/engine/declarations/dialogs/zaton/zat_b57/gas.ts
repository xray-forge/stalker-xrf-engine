import { GameObject } from "xray16/alias";
import { AnyCallable, extern, getExtern } from "xray16/lib";
import { $isNotNil } from "xray16/macros";

import { detectors } from "@/engine/constants/items/detectors";
import { questItems } from "@/engine/constants/items/quest_items";
import { registry } from "@/engine/core/database";
import { TreasureManager } from "@/engine/core/managers/treasures";
import { getNpcSpeaker } from "@/engine/core/utils/dialog";
import { transferItemsToActor, transferMoneyFromActor } from "@/engine/core/utils/reward";

/**
 * Give an elite detector from the NPC to the actor and reveal treasure coordinates.
 *
 * @param firstSpeaker - First participant of the dialog (actor).
 * @param secondSpeaker - Second participant of the dialog (NPC).
 */
// --// --- b57 new // --// --
extern(
  "dialogs_zaton.zat_b57_stalker_reward_to_actor_detector",
  (firstSpeaker: GameObject, secondSpeaker: GameObject): void => {
    transferItemsToActor(getNpcSpeaker(firstSpeaker, secondSpeaker), detectors.detector_elite);
    TreasureManager.giveTreasureCoordinates("zat_hiding_place_54");
  }
);

/**
 * Check whether the actor carries the zat_b57 gas canister.
 *
 * @param firstSpeaker - First participant of the dialog (actor).
 * @param secondSpeaker - Second participant of the dialog (NPC).
 * @returns Whether the actor owns the zat_b57 gas quest item.
 */
extern("dialogs_zaton.actor_has_gas", (firstSpeaker: GameObject, secondSpeaker: GameObject): boolean => {
  return $isNotNil(registry.actor.object(questItems.zat_b57_gas));
});

/**
 * Check whether the actor does not carry the zat_b57 gas canister.
 *
 * @param firstSpeaker - First participant of the dialog (actor).
 * @param secondSpeaker - Second participant of the dialog (NPC).
 * @returns Whether the actor lacks the zat_b57 gas quest item.
 */
extern("dialogs_zaton.actor_has_not_gas", (firstSpeaker: GameObject, secondSpeaker: GameObject): boolean => {
  return !getExtern<AnyCallable>("actor_has_gas", getExtern("dialogs_zaton"))(firstSpeaker, secondSpeaker);
});

/**
 * Check whether the actor has enough money for the zat_b57 deal.
 *
 * @param firstSpeaker - First participant of the dialog (actor).
 * @param secondSpeaker - Second participant of the dialog (NPC).
 * @returns Whether the actor owns at least 2000 money.
 */
extern("dialogs_zaton.zat_b57_actor_has_money", (firstSpeaker: GameObject, secondSpeaker: GameObject): boolean => {
  return registry.actor.money() >= 2000;
});

/**
 * Check whether the actor lacks the money for the zat_b57 deal.
 *
 * @param firstSpeaker - First participant of the dialog (actor).
 * @param secondSpeaker - Second participant of the dialog (NPC).
 * @returns Whether the actor owns less than 2000 money.
 */
extern("dialogs_zaton.zat_b57_actor_hasnt_money", (firstSpeaker: GameObject, secondSpeaker: GameObject): boolean => {
  return !getExtern<AnyCallable>("zat_b57_actor_has_money", getExtern("dialogs_zaton"))(firstSpeaker, secondSpeaker);
});

/**
 * Transfer the 2000 money zat_b57 gas fee from the actor to the dialog NPC.
 *
 * @param firstSpeaker - First participant of the dialog (actor).
 * @param secondSpeaker - Second participant of the dialog (NPC).
 */
extern("dialogs_zaton.zat_b57_transfer_gas_money", (firstSpeaker: GameObject, secondSpeaker: GameObject): void => {
  transferMoneyFromActor(getNpcSpeaker(firstSpeaker, secondSpeaker), 2000);
});
