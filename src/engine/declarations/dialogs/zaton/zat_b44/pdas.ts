import { GameObject } from "xray16/alias";
import { AnyCallable, extern, getExtern } from "xray16/lib";
import { $isNil, $isNotNil } from "xray16/macros";

import { infoPortions } from "@/engine/constants/info_portions";
import { questItems } from "@/engine/constants/items/quest_items";
import { registry } from "@/engine/core/database";
import { getNpcSpeaker } from "@/engine/core/utils/dialog";
import { hasInfoPortion } from "@/engine/core/utils/info_portion";
import { transferItemsFromActor } from "@/engine/core/utils/reward";

/**
 * Check whether the actor carries either the Joker or the barge PDA.
 *
 * @param firstSpeaker - First participant of the dialog (actor).
 * @param secondSpeaker - Second participant of the dialog (NPC).
 * @returns Whether the actor owns the Joker PDA or the barge PDA.
 */
extern("dialogs_zaton.zat_b44_actor_has_pda_global", (firstSpeaker: GameObject, secondSpeaker: GameObject): boolean => {
  return (
    $isNotNil(registry.actor.object(questItems.zat_b39_joker_pda)) ||
    $isNotNil(registry.actor.object(questItems.zat_b44_barge_pda))
  );
});

/**
 * Check whether the actor is missing at least one of the Joker and barge PDAs.
 *
 * @param firstSpeaker - First participant of the dialog (actor).
 * @param secondSpeaker - Second participant of the dialog (NPC).
 * @returns Whether the actor lacks the Joker PDA or the barge PDA.
 */
extern(
  "dialogs_zaton.zat_b44_actor_has_not_pda_global",
  (firstSpeaker: GameObject, secondSpeaker: GameObject): boolean => {
    return (
      $isNil(registry.actor.object(questItems.zat_b39_joker_pda)) ||
      $isNil(registry.actor.object(questItems.zat_b44_barge_pda))
    );
  }
);

/**
 * Check whether the actor carries the barge PDA.
 *
 * @param firstSpeaker - First participant of the dialog (actor).
 * @param secondSpeaker - Second participant of the dialog (NPC).
 * @returns Whether the actor owns the barge PDA quest item.
 */
extern("dialogs_zaton.zat_b44_actor_has_pda_barge", (firstSpeaker: GameObject, secondSpeaker: GameObject): boolean => {
  return $isNotNil(registry.actor.object(questItems.zat_b44_barge_pda));
});

/**
 * Check whether the actor carries the Joker PDA.
 *
 * @param firstSpeaker - First participant of the dialog (actor).
 * @param secondSpeaker - Second participant of the dialog (NPC).
 * @returns Whether the actor owns the Joker PDA quest item.
 */
extern("dialogs_zaton.zat_b44_actor_has_pda_joker", (firstSpeaker: GameObject, secondSpeaker: GameObject): boolean => {
  return $isNotNil(registry.actor.object(questItems.zat_b39_joker_pda));
});

/**
 * Check whether the actor carries both the Joker and barge PDAs.
 *
 * @param firstSpeaker - First participant of the dialog (actor).
 * @param secondSpeaker - Second participant of the dialog (NPC).
 * @returns Whether the actor owns the Joker PDA and the barge PDA.
 */
extern("dialogs_zaton.zat_b44_actor_has_pda_both", (firstSpeaker: GameObject, secondSpeaker: GameObject): boolean => {
  return (
    $isNotNil(registry.actor.object(questItems.zat_b39_joker_pda)) &&
    $isNotNil(registry.actor.object(questItems.zat_b44_barge_pda))
  );
});

/**
 * Take the barge PDA from the actor.
 *
 * @param firstSpeaker - First participant of the dialog (actor).
 * @param secondSpeaker - Second participant of the dialog (NPC).
 */
extern("dialogs_zaton.zat_b44_transfer_pda_barge", (firstSpeaker: GameObject, secondSpeaker: GameObject): void => {
  transferItemsFromActor(getNpcSpeaker(firstSpeaker, secondSpeaker), questItems.zat_b44_barge_pda);
});

/**
 * Take the Joker PDA from the actor.
 *
 * @param firstSpeaker - First participant of the dialog (actor).
 * @param secondSpeaker - Second participant of the dialog (NPC).
 */
extern("dialogs_zaton.zat_b44_transfer_pda_joker", (firstSpeaker: GameObject, secondSpeaker: GameObject): void => {
  transferItemsFromActor(getNpcSpeaker(firstSpeaker, secondSpeaker), questItems.zat_b39_joker_pda);
});

/**
 * Take both the barge PDA and the Joker PDA from the actor.
 *
 * @param firstSpeaker - First participant of the dialog (actor).
 * @param secondSpeaker - Second participant of the dialog (NPC).
 */
extern("dialogs_zaton.zat_b44_transfer_pda_both", (firstSpeaker: GameObject, secondSpeaker: GameObject): void => {
  transferItemsFromActor(getNpcSpeaker(firstSpeaker, secondSpeaker), questItems.zat_b44_barge_pda);
  transferItemsFromActor(getNpcSpeaker(firstSpeaker, secondSpeaker), questItems.zat_b39_joker_pda);
});

/**
 * Check whether the friendly tech dialog branch is enabled.
 *
 * @param firstSpeaker - First participant of the dialog (actor).
 * @param secondSpeaker - Second participant of the dialog (NPC).
 * @returns Whether the tech discount info portions are set or the actor has none of the PDAs.
 */
extern(
  "dialogs_zaton.zat_b44_frends_dialog_enabled",
  (firstSpeaker: GameObject, secondSpeaker: GameObject): boolean => {
    const a: boolean =
      hasInfoPortion(infoPortions.zat_b3_tech_have_couple_dose) && hasInfoPortion(infoPortions.zat_b3_tech_discount_1);
    const b: boolean = !getExtern<AnyCallable>("zat_b44_actor_has_pda_global", getExtern("dialogs_zaton"))(
      firstSpeaker,
      secondSpeaker
    );

    return a || b;
  }
);
