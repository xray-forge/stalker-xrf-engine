import { GameObject } from "xray16/alias";
import { AnyObject, extern } from "xray16/lib";
import { $isNotNil } from "xray16/macros";

import { misc } from "@/engine/constants/items/misc";
import { registry } from "@/engine/core/database";
import { getNpcSpeaker, isObjectName } from "@/engine/core/utils/dialog";
import { giveMoneyToActor, transferItemsFromActor } from "@/engine/core/utils/reward";

/**
 * Check whether the dialog partner is a generic stalker rather than a known mechanic-related NPC.
 *
 * @param firstSpeaker - First participant of the dialog (actor).
 * @param secondSpeaker - Second participant of the dialog (NPC).
 * @returns Whether the second speaker is a plain stalker and not a mechanic, lost merc, tech or Zulus.
 */
extern("dialogs_zaton.check_npc_name_mechanics", (firstSpeaker: GameObject, secondSpeaker: GameObject): boolean => {
  return (
    !isObjectName(secondSpeaker, "mechanic") &&
    !isObjectName(secondSpeaker, "zat_b103_lost_merc") &&
    !isObjectName(secondSpeaker, "tech") &&
    !isObjectName(secondSpeaker, "zulus") &&
    isObjectName(secondSpeaker, "stalker")
  );
});

/**
 * Take the third toolkit from the actor, clear the remembered toolkit and reward money.
 *
 * @param firstSpeaker - First participant of the dialog (actor).
 * @param secondSpeaker - Second participant of the dialog (NPC).
 */
extern("dialogs_zaton.give_toolkit_3", (firstSpeaker: GameObject, secondSpeaker: GameObject): void => {
  transferItemsFromActor(getNpcSpeaker(firstSpeaker, secondSpeaker), misc.toolkit_3);
  (registry.actor as AnyObject).toolkit = null;
  giveMoneyToActor(1500);
});

/**
 * Take the first toolkit from the actor, clear the remembered toolkit and reward money.
 *
 * @param firstSpeaker - First participant of the dialog (actor).
 * @param secondSpeaker - Second participant of the dialog (NPC).
 */
extern("dialogs_zaton.give_toolkit_1", (firstSpeaker: GameObject, secondSpeaker: GameObject): void => {
  transferItemsFromActor(getNpcSpeaker(firstSpeaker, secondSpeaker), misc.toolkit_1);
  (registry.actor as AnyObject).toolkit = null;
  giveMoneyToActor(1000);
});

/**
 * Check whether the actor carries the first toolkit.
 *
 * @param firstSpeaker - First participant of the dialog (actor).
 * @param secondSpeaker - Second participant of the dialog (NPC).
 * @returns Whether the actor owns the first toolkit.
 */
extern("dialogs_zaton.if_actor_has_toolkit_1", (firstSpeaker: GameObject, secondSpeaker: GameObject): boolean => {
  return $isNotNil(registry.actor.object(misc.toolkit_1));
});

/**
 * Take the second toolkit from the actor, clear the remembered toolkit and reward money.
 *
 * @param firstSpeaker - First participant of the dialog (actor).
 * @param secondSpeaker - Second participant of the dialog (NPC).
 */
extern("dialogs_zaton.give_toolkit_2", (firstSpeaker: GameObject, secondSpeaker: GameObject): void => {
  transferItemsFromActor(getNpcSpeaker(firstSpeaker, secondSpeaker), misc.toolkit_2);
  (registry.actor as AnyObject).toolkit = null;
  giveMoneyToActor(1200);
});

/**
 * Check whether the actor carries the second toolkit.
 *
 * @param firstSpeaker - First participant of the dialog (actor).
 * @param secondSpeaker - Second participant of the dialog (NPC).
 * @returns Whether the actor owns the second toolkit.
 */
extern("dialogs_zaton.if_actor_has_toolkit_2", (firstSpeaker: GameObject, secondSpeaker: GameObject): boolean => {
  return $isNotNil(registry.actor.object(misc.toolkit_2));
});

/**
 * Check whether the actor carries the third toolkit.
 *
 * @param firstSpeaker - First participant of the dialog (actor).
 * @param secondSpeaker - Second participant of the dialog (NPC).
 * @returns Whether the actor owns the third toolkit.
 */
extern("dialogs_zaton.if_actor_has_toolkit_3", (firstSpeaker: GameObject, secondSpeaker: GameObject): boolean => {
  return $isNotNil(registry.actor.object(misc.toolkit_3));
});
