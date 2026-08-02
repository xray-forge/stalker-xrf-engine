import { GameObject } from "xray16/alias";
import { ACTOR_ID, AnyCallable, AnyCallablesModule, extern, getExtern } from "xray16/lib";
import { $isNotNil } from "xray16/macros";

import { artefacts } from "@/engine/constants/items/artefacts";
import { drugs } from "@/engine/constants/items/drugs";
import { questItems } from "@/engine/constants/items/quest_items";
import { registry } from "@/engine/core/database";
import { getPortableStoreValue } from "@/engine/core/database/portable_store";
import { getNpcSpeaker } from "@/engine/core/utils/dialog";
import { giveItemsToActor, transferItemsFromActor, transferMoneyFromActor } from "@/engine/core/utils/reward";

/**
 * Set the zat_b33 items counter for the actor to ten via the shared effects module.
 *
 * @param firstSpeaker - First participant of the dialog (actor).
 * @param secondSpeaker - Second participant of the dialog (NPC).
 */
extern("dialogs_zaton.zat_b33_set_counter_10", (firstSpeaker: GameObject, secondSpeaker: GameObject): void => {
  const actor: GameObject = registry.actor;

  getExtern<AnyCallablesModule>("xr_effects").set_counter(actor, null, ["zat_b33_items", 10]);
});

/**
 * Check whether the zat_b33 items counter is at least two.
 *
 * @param firstSpeaker - First participant of the dialog (actor).
 * @param secondSpeaker - Second participant of the dialog (NPC).
 * @returns Whether the stored zat_b33 items counter is greater than or equal to two.
 */
extern("dialogs_zaton.zat_b33_counter_ge_2", (firstSpeaker: GameObject, secondSpeaker: GameObject): boolean => {
  return getPortableStoreValue(ACTOR_ID, "zat_b33_items", 0 as number) >= 2;
});

/**
 * Check whether the zat_b33 items counter is at least four.
 *
 * @param firstSpeaker - First participant of the dialog (actor).
 * @param secondSpeaker - Second participant of the dialog (NPC).
 * @returns Whether the stored zat_b33 items counter is greater than or equal to four.
 */
extern("dialogs_zaton.zat_b33_counter_ge_4", (firstSpeaker: GameObject, secondSpeaker: GameObject): boolean => {
  return getPortableStoreValue(ACTOR_ID, "zat_b33_items", 0 as number) >= 4;
});

/**
 * Check whether the zat_b33 items counter is at least eight.
 *
 * @param firstSpeaker - First participant of the dialog (actor).
 * @param secondSpeaker - Second participant of the dialog (NPC).
 * @returns Whether the stored zat_b33 items counter is greater than or equal to eight.
 */
extern("dialogs_zaton.zat_b33_counter_ge_8", (firstSpeaker: GameObject, secondSpeaker: GameObject): boolean => {
  return getPortableStoreValue(ACTOR_ID, "zat_b33_items", 0 as number) >= 8;
});

/**
 * Check whether the zat_b33 items counter is below two.
 *
 * @param firstSpeaker - First participant of the dialog (actor).
 * @param secondSpeaker - Second participant of the dialog (NPC).
 * @returns Whether the zat_b33 items counter is less than two.
 */
extern("dialogs_zaton.zat_b33_counter_le_2", (firstSpeaker: GameObject, secondSpeaker: GameObject): boolean => {
  return !getExtern<AnyCallable>("zat_b33_counter_ge_2", getExtern("dialogs_zaton"))(firstSpeaker, secondSpeaker);
});

/**
 * Check whether the zat_b33 items counter is below four.
 *
 * @param firstSpeaker - First participant of the dialog (actor).
 * @param secondSpeaker - Second participant of the dialog (NPC).
 * @returns Whether the zat_b33 items counter is less than four.
 */
extern("dialogs_zaton.zat_b33_counter_le_4", (firstSpeaker: GameObject, secondSpeaker: GameObject): boolean => {
  return !getExtern<AnyCallable>("zat_b33_counter_ge_4", getExtern("dialogs_zaton"))(firstSpeaker, secondSpeaker);
});

/**
 * Check whether the zat_b33 items counter is below eight.
 *
 * @param firstSpeaker - First participant of the dialog (actor).
 * @param secondSpeaker - Second participant of the dialog (NPC).
 * @returns Whether the zat_b33 items counter is less than eight.
 */
extern("dialogs_zaton.zat_b33_counter_le_8", (firstSpeaker: GameObject, secondSpeaker: GameObject): boolean => {
  return !getExtern<AnyCallable>("zat_b33_counter_ge_8", getExtern("dialogs_zaton"))(firstSpeaker, secondSpeaker);
});

/**
 * Decrease the zat_b33 items counter for the actor by two via the shared effects module.
 *
 * @param firstSpeaker - First participant of the dialog (actor).
 * @param secondSpeaker - Second participant of the dialog (NPC).
 * @returns Whether the underlying counter decrement effect reported success.
 */
extern("dialogs_zaton.zat_b33_counter_de_2", (firstSpeaker: GameObject, secondSpeaker: GameObject): boolean => {
  const actor: GameObject = registry.actor;

  return getExtern<AnyCallablesModule>("xr_effects").dec_counter(actor, null, ["zat_b33_items", 2]);
});

/**
 * Decrease the zat_b33 items counter for the actor by four via the shared effects module.
 *
 * @param firstSpeaker - First participant of the dialog (actor).
 * @param secondSpeaker - Second participant of the dialog (NPC).
 * @returns Whether the underlying counter decrement effect reported success.
 */
extern("dialogs_zaton.zat_b33_counter_de_4", (firstSpeaker: GameObject, secondSpeaker: GameObject): boolean => {
  const actor: GameObject = registry.actor;

  return getExtern<AnyCallablesModule>("xr_effects").dec_counter(actor, null, ["zat_b33_items", 4]);
});

/**
 * Decrease the zat_b33 items counter for the actor by eight via the shared effects module.
 *
 * @param firstSpeaker - First participant of the dialog (actor).
 * @param secondSpeaker - Second participant of the dialog (NPC).
 * @returns Whether the underlying counter decrement effect reported success.
 */
extern("dialogs_zaton.zat_b33_counter_de_8", (firstSpeaker: GameObject, secondSpeaker: GameObject): boolean => {
  const actor: GameObject = registry.actor;

  return getExtern<AnyCallablesModule>("xr_effects").dec_counter(actor, null, ["zat_b33_items", 8]);
});

/**
 * Check whether the zat_b33 items counter equals ten.
 *
 * @param firstSpeaker - First participant of the dialog (actor).
 * @param secondSpeaker - Second participant of the dialog (NPC).
 * @returns Whether the stored zat_b33 items counter is exactly ten.
 */
extern("dialogs_zaton.zat_b33_counter_eq_10", (firstSpeaker: GameObject, secondSpeaker: GameObject): boolean => {
  return getPortableStoreValue(ACTOR_ID, "zat_b33_items", 0 as number) === 10;
});

/**
 * Check whether the zat_b33 items counter differs from ten.
 *
 * @param firstSpeaker - First participant of the dialog (actor).
 * @param secondSpeaker - Second participant of the dialog (NPC).
 * @returns Whether the zat_b33 items counter is not equal to ten.
 */
extern("dialogs_zaton.zat_b33_counter_ne_10", (firstSpeaker: GameObject, secondSpeaker: GameObject): boolean => {
  return !getExtern<AnyCallable>("zat_b33_counter_eq_10", getExtern("dialogs_zaton"))(firstSpeaker, secondSpeaker);
});

/**
 * Give the snag Fort pistol reward to the actor.
 *
 * @param firstSpeaker - First participant of the dialog (actor).
 * @param secondSpeaker - Second participant of the dialog (NPC).
 */
extern("dialogs_zaton.zat_b33_transfer_first_item", (firstSpeaker: GameObject, secondSpeaker: GameObject): void => {
  giveItemsToActor(questItems.wpn_fort_snag);
});

/**
 * Give a pack of scientific medkits, antirads and bandages to the actor.
 *
 * @param firstSpeaker - First participant of the dialog (actor).
 * @param secondSpeaker - Second participant of the dialog (NPC).
 */
extern("dialogs_zaton.zat_b33_transfer_second_item", (firstSpeaker: GameObject, secondSpeaker: GameObject): void => {
  giveItemsToActor(drugs.medkit_scientic, 3);
  giveItemsToActor(drugs.antirad, 3);
  giveItemsToActor(drugs.bandage, 5);
});

/**
 * Give the snag AK-74u reward to the actor.
 *
 * @param firstSpeaker - First participant of the dialog (actor).
 * @param secondSpeaker - Second participant of the dialog (NPC).
 */
extern("dialogs_zaton.zat_b33_transfer_third_item", (firstSpeaker: GameObject, secondSpeaker: GameObject): void => {
  giveItemsToActor(questItems.wpn_ak74u_snag);
});

/**
 * Give the soul artefact reward to the actor.
 *
 * @param firstSpeaker - First participant of the dialog (actor).
 * @param secondSpeaker - Second participant of the dialog (NPC).
 */
extern("dialogs_zaton.zat_b33_transfer_fourth_item", (firstSpeaker: GameObject, secondSpeaker: GameObject): void => {
  giveItemsToActor(artefacts.af_soul);
});

/**
 * Give the snag hardhat helmet reward to the actor.
 *
 * @param firstSpeaker - First participant of the dialog (actor).
 * @param secondSpeaker - Second participant of the dialog (NPC).
 */
extern("dialogs_zaton.zat_b33_transfer_fifth_item", (firstSpeaker: GameObject, secondSpeaker: GameObject): void => {
  giveItemsToActor(questItems.helm_hardhat_snag);
});

/**
 * Transfer the zat_b33 safe container from the actor to the dialog NPC.
 *
 * @param firstSpeaker - First participant of the dialog (actor).
 * @param secondSpeaker - Second participant of the dialog (NPC).
 */
extern("dialogs_zaton.zat_b33_transfer_safe_container", (firstSpeaker: GameObject, secondSpeaker: GameObject): void => {
  transferItemsFromActor(getNpcSpeaker(firstSpeaker, secondSpeaker), questItems.zat_b33_safe_container);
});

/**
 * Check whether the actor carries the zat_b33 safe container loot.
 *
 * @param firstSpeaker - First participant of the dialog (actor).
 * @param secondSpeaker - Second participant of the dialog (NPC).
 * @returns Whether the actor owns the zat_b33 safe container.
 */
extern("dialogs_zaton.zat_b33_aractor_has_habar", (firstSpeaker: GameObject, secondSpeaker: GameObject): boolean => {
  return $isNotNil(registry.actor.object(questItems.zat_b33_safe_container));
});

/**
 * Check whether the actor does not carry the zat_b33 safe container loot.
 *
 * @param firstSpeaker - First participant of the dialog (actor).
 * @param secondSpeaker - Second participant of the dialog (NPC).
 * @returns Whether the actor lacks the zat_b33 safe container.
 */
extern("dialogs_zaton.zat_b33_actor_hasnt_habar", (firstSpeaker: GameObject, secondSpeaker: GameObject): boolean => {
  return !getExtern<AnyCallable>("zat_b33_aractor_has_habar", getExtern("dialogs_zaton"))(firstSpeaker, secondSpeaker);
});

/**
 * Check whether the actor has at least 500 money for the zat_b33 deal.
 *
 * @returns Whether the actor owns 500 money or more.
 */
extern("dialogs_zaton.zat_b33_actor_has_needed_money", (): boolean => {
  return registry.actor.money() >= 500;
});

/**
 * Check whether the actor lacks the 500 money required for the zat_b33 deal.
 *
 * @param firstSpeaker - First participant of the dialog (actor).
 * @param secondSpeaker - Second participant of the dialog (NPC).
 * @returns Whether the actor owns less than 500 money.
 */
extern(
  "dialogs_zaton.zat_b33_actor_hasnt_needed_money",
  (firstSpeaker: GameObject, secondSpeaker: GameObject): boolean => {
    return !getExtern<AnyCallable>("zat_b33_actor_has_needed_money", getExtern("dialogs_zaton"))(
      firstSpeaker,
      secondSpeaker
    );
  }
);

/**
 * Transfer 500 money from the actor to the dialog NPC when the actor can afford it.
 *
 * @param firstSpeaker - First participant of the dialog (actor).
 * @param secondSpeaker - Second participant of the dialog (NPC).
 */
extern("dialogs_zaton.zat_b33_relocate_money", (firstSpeaker: GameObject, secondSpeaker: GameObject): void => {
  if (
    getExtern<AnyCallable>("zat_b33_actor_has_needed_money", getExtern("dialogs_zaton"))(firstSpeaker, secondSpeaker)
  ) {
    transferMoneyFromActor(getNpcSpeaker(firstSpeaker, secondSpeaker), 500);
  }
});
