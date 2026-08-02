import { GameObject } from "xray16/alias";
import { extern } from "xray16/lib";
import { $isNotNil } from "xray16/macros";

import { drugs } from "@/engine/constants/items/drugs";
import { questItems } from "@/engine/constants/items/quest_items";
import { weapons } from "@/engine/constants/items/weapons";
import { registry } from "@/engine/core/database";
import { getNpcSpeaker } from "@/engine/core/utils/dialog";
import { transferItemsFromActor, transferItemsToActor } from "@/engine/core/utils/reward";

/**
 * Give the zat_a23 access card from the NPC to the actor.
 *
 * @param firstSpeaker - First participant of the dialog (actor).
 * @param secondSpeaker - Second participant of the dialog (NPC).
 */
extern("dialogs_zaton.give_actor_zat_a23_access_card", (firstSpeaker: GameObject, secondSpeaker: GameObject): void => {
  transferItemsToActor(getNpcSpeaker(firstSpeaker, secondSpeaker), questItems.zat_a23_access_card);
});

/**
 * Take the zat_a23 gauss rifle documents from the actor.
 *
 * @param firstSpeaker - First participant of the dialog (actor).
 * @param secondSpeaker - Second participant of the dialog (NPC).
 */
extern("dialogs_zaton.give_zat_a23_gauss_rifle_docs", (firstSpeaker: GameObject, secondSpeaker: GameObject): void => {
  transferItemsFromActor(getNpcSpeaker(firstSpeaker, secondSpeaker), questItems.zat_a23_gauss_rifle_docs);
});

/**
 * Return the zat_a23 gauss rifle documents from the NPC to the actor.
 *
 * @param firstSpeaker - First participant of the dialog (actor).
 * @param secondSpeaker - Second participant of the dialog (NPC).
 */
extern("dialogs_zaton.return_zat_a23_gauss_rifle_docs", (firstSpeaker: GameObject, secondSpeaker: GameObject): void => {
  transferItemsToActor(getNpcSpeaker(firstSpeaker, secondSpeaker), questItems.zat_a23_gauss_rifle_docs);
});

/**
 * Check whether the speaker carries the zat_a23 gauss rifle documents.
 *
 * @param firstSpeaker - First participant of the dialog (actor).
 * @param secondSpeaker - Second participant of the dialog (NPC).
 * @returns Whether the first speaker owns the zat_a23 gauss rifle documents.
 */
extern(
  "dialogs_zaton.if_actor_has_zat_a23_gauss_rifle_docs",
  (firstSpeaker: GameObject, secondSpeaker: GameObject): boolean => {
    return $isNotNil(firstSpeaker.object(questItems.zat_a23_gauss_rifle_docs));
  }
);

/**
 * Check whether the speaker carries the gauss rifle.
 *
 * @param firstSpeaker - First participant of the dialog (actor).
 * @param secondSpeaker - Second participant of the dialog (NPC).
 * @returns Whether the first speaker owns the gauss rifle quest item.
 */
extern("dialogs_zaton.if_actor_has_gauss_rifle", (firstSpeaker: GameObject, secondSpeaker: GameObject): boolean => {
  return $isNotNil(firstSpeaker.object(questItems.pri_a17_gauss_rifle));
});

/**
 * Take the gauss rifle from the actor for the tech to repair.
 *
 * @param firstSpeaker - First participant of the dialog (actor).
 * @param secondSpeaker - Second participant of the dialog (NPC).
 */
extern("dialogs_zaton.give_tech_gauss_rifle", (firstSpeaker: GameObject, secondSpeaker: GameObject): void => {
  transferItemsFromActor(getNpcSpeaker(firstSpeaker, secondSpeaker), questItems.pri_a17_gauss_rifle);
});

/**
 * Give the repaired gauss rifle from the NPC to the actor.
 *
 * @param firstSpeaker - First participant of the dialog (actor).
 * @param secondSpeaker - Second participant of the dialog (NPC).
 */
extern("dialogs_zaton.give_actor_repaired_gauss_rifle", (firstSpeaker: GameObject, secondSpeaker: GameObject): void => {
  transferItemsToActor(getNpcSpeaker(firstSpeaker, secondSpeaker), weapons.wpn_gauss);
});

/**
 * Check whether the actor carries the zat_a23 access card.
 *
 * @param firstSpeaker - First participant of the dialog (actor).
 * @param secondSpeaker - Second participant of the dialog (NPC).
 * @returns Whether the actor owns the zat_a23 access card.
 */
extern(
  "dialogs_zaton.zat_a23_actor_has_access_card",
  (firstSpeaker: GameObject, secondSpeaker: GameObject): boolean => {
    return $isNotNil(registry.actor.object(questItems.zat_a23_access_card));
  }
);

/**
 * Take the zat_a23 access card from the actor and reward scientific medkits.
 *
 * @param firstSpeaker - First participant of the dialog (actor).
 * @param secondSpeaker - Second participant of the dialog (NPC).
 */
extern(
  "dialogs_zaton.zat_a23_transfer_access_card_to_tech",
  (firstSpeaker: GameObject, secondSpeaker: GameObject): void => {
    transferItemsFromActor(getNpcSpeaker(firstSpeaker, secondSpeaker), questItems.zat_a23_access_card);
    transferItemsToActor(getNpcSpeaker(firstSpeaker, secondSpeaker), drugs.medkit_scientic, 3);
  }
);
