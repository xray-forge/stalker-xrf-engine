import { GameObject } from "xray16/alias";
import { AnyCallable, extern, getExtern, LuaArray, TName } from "xray16/lib";
import { $fromArray, $isNil, $isNotNil } from "xray16/macros";

import { communities } from "@/engine/constants/communities";
import { infoPortions } from "@/engine/constants/info_portions/info_portions";
import { drugs } from "@/engine/constants/items/drugs";
import { questItems } from "@/engine/constants/items/quest_items";
import { registry } from "@/engine/core/database";
import { getNpcSpeaker } from "@/engine/core/utils/dialog";
import { hasInfoPortion } from "@/engine/core/utils/info_portion";
import { isActorEnemyWithFaction } from "@/engine/core/utils/relation";
import { giveItemsToActor, giveMoneyToActor, transferItemsFromActor } from "@/engine/core/utils/reward";

/**
 * Check whether the Jupiter documents dialog should be enabled based on the a9 items and b47 info portions.
 *
 * @param _ - Actor participating in the dialog, unused.
 * @param __ - NPC participating in the dialog, unused.
 * @returns Whether the Jupiter docs dialog is enabled.
 */
extern("dialogs_jupiter.jup_b47_jupiter_docs_enabled", (_: GameObject, __: GameObject): boolean => {
  const actor: GameObject = registry.actor;
  const itemsTable: LuaArray<TName> = $fromArray([
    "jup_a9_conservation_info",
    "jup_a9_power_info",
    "jup_a9_way_info",
    "jup_a9_evacuation_info",
    "jup_a9_meeting_info",
    "jup_a9_losses_info",
    "jup_a9_delivery_info",
    // --						"jup_b47_jupiter_products_info"
  ]);

  let a: boolean = false;

  for (const [_k, v] of itemsTable) {
    if ($isNotNil(actor.object(v))) {
      a = true;
      break;
    }
  }

  const b: boolean =
    !hasInfoPortion(infoPortions.jup_b47_jupiter_products_start) &&
    $isNotNil(actor.object(infoPortions.jup_b47_jupiter_products_info));
  const c: boolean = hasInfoPortion(infoPortions.jup_b6_scientist_nuclear_physicist_jupiter_docs_talked);

  return (a || b) && !c;
});

/**
 * Check whether the actor has the b47 Jupiter products info item.
 *
 * @param _ - Actor participating in the dialog, unused.
 * @param __ - NPC participating in the dialog, unused.
 * @returns Whether the products info is present.
 */
extern("dialogs_jupiter.jup_b47_jupiter_products_info_enabled", (_: GameObject, __: GameObject): boolean => {
  return $isNotNil(registry.actor.object(questItems.jup_b47_jupiter_products_info));
});

/**
 * Check whether the actor does not have the b47 Jupiter products info item.
 *
 * @param _ - Actor participating in the dialog, unused.
 * @param __ - NPC participating in the dialog, unused.
 * @returns Whether the products info is absent.
 */
extern("dialogs_jupiter.jup_b47_jupiter_products_info_disabled", (_: GameObject, __: GameObject): boolean => {
  return $isNil(registry.actor.object(questItems.jup_b47_jupiter_products_info));
});

/**
 * Take the b47 Jupiter products info from the actor and reward money and medicine in return.
 *
 * @param firstSpeaker - Actor participating in the dialog.
 * @param secondSpeaker - NPC participating in the dialog.
 */
extern(
  "dialogs_jupiter.jup_b47_jupiter_products_info_revard",
  (firstSpeaker: GameObject, secondSpeaker: GameObject): void => {
    transferItemsFromActor(getNpcSpeaker(firstSpeaker, secondSpeaker), questItems.jup_b47_jupiter_products_info);

    giveMoneyToActor(7000);
    giveItemsToActor(drugs.medkit_scientic, 3);
    giveItemsToActor(drugs.antirad, 5);
    giveItemsToActor(drugs.drug_psy_blockade, 2);
    giveItemsToActor(drugs.drug_antidot, 2);
    giveItemsToActor(drugs.drug_radioprotector, 2);
  }
);

/**
 * Check whether the actor has the b47 mercenary PDA.
 *
 * @param _ - Actor participating in the dialog, unused.
 * @param __ - NPC participating in the dialog, unused.
 * @returns Whether the actor has the mercenary PDA.
 */
extern("dialogs_jupiter.jup_b47_actor_has_merc_pda", (_: GameObject, __: GameObject): boolean => {
  return $isNotNil(registry.actor.object("jup_b47_merc_pda"));
});

/**
 * Check whether the actor does not have the b47 mercenary PDA.
 *
 * @param firstSpeaker - Actor participating in the dialog.
 * @param secondSpeaker - NPC participating in the dialog.
 * @returns Whether the actor lacks the mercenary PDA.
 */
extern(
  "dialogs_jupiter.jup_b47_actor_has_not_merc_pda",
  (firstSpeaker: GameObject, secondSpeaker: GameObject): boolean => {
    return !getExtern<AnyCallable>("jup_b47_actor_has_merc_pda", getExtern("dialogs_jupiter"))(
      firstSpeaker,
      secondSpeaker
    );
  }
);

/**
 * Take the b47 mercenary PDA from the actor and reward money in return.
 *
 * @param firstSpeaker - Actor participating in the dialog.
 * @param secondSpeaker - NPC participating in the dialog.
 */
extern("dialogs_jupiter.jup_b47_merc_pda_revard", (firstSpeaker: GameObject, secondSpeaker: GameObject): void => {
  transferItemsFromActor(getNpcSpeaker(firstSpeaker, secondSpeaker), questItems.jup_b47_merc_pda);
  giveMoneyToActor(2500);
});

/**
 * Check whether the actor may take the b47 task based on the b6 task completion info portions.
 *
 * @param _ - Actor participating in the dialog, unused.
 * @param __ - NPC participating in the dialog, unused.
 * @returns Whether the b47 task can be taken.
 */
extern("dialogs_jupiter.jup_b47_actor_can_take_task", (_: GameObject, __: GameObject): boolean => {
  const a: boolean = hasInfoPortion(infoPortions.jup_b6_task_done) && !hasInfoPortion(infoPortions.jup_b6_task_fail);
  const b: boolean = hasInfoPortion(infoPortions.jup_b6_task_fail) && !hasInfoPortion(infoPortions.jup_b6_task_done);

  return a || b;
});

/**
 * Check whether a squad can be employed for the b47 quest based on the bunker guard and stalker info portions.
 *
 * @param _ - Actor participating in the dialog, unused.
 * @param __ - NPC participating in the dialog, unused.
 * @returns Whether a squad can be employed.
 */
extern("dialogs_jupiter.jup_b47_employ_squad", (_: GameObject, __: GameObject): boolean => {
  const a: boolean =
    hasInfoPortion(infoPortions.jup_b47_bunker_guards_started) &&
    !hasInfoPortion(infoPortions.jup_b47_bunker_guards_done);
  const b: boolean =
    hasInfoPortion(infoPortions.jup_b6_employ_stalker) && !hasInfoPortion(infoPortions.jup_b6_employed_stalker);

  return a || b;
});

/**
 * Reward the actor with money and medicine for the b47 bunker guard task.
 *
 * @param _ - Actor participating in the dialog, unused.
 * @param __ - NPC participating in the dialog, unused.
 */
extern("dialogs_jupiter.jup_b47_bunker_guard_revard", (_: GameObject, __: GameObject): void => {
  giveMoneyToActor(4000);
  giveItemsToActor(drugs.drug_psy_blockade, 2);
  giveItemsToActor(drugs.drug_antidot, 3);
  giveItemsToActor(drugs.drug_radioprotector, 3);
});

/**
 * Reward the actor with money for the b47 gauss rifle documents.
 *
 * @param _ - Actor participating in the dialog, unused.
 * @param __ - NPC participating in the dialog, unused.
 */
extern("dialogs_jupiter.jup_b47_gauss_rifle_revard", (_: GameObject, __: GameObject): void => {
  giveMoneyToActor(12000);
});

/**
 * Check whether the actor has the gauss rifle documents.
 *
 * @param _ - Actor participating in the dialog, unused.
 * @param __ - NPC participating in the dialog, unused.
 * @returns Whether the actor has the gauss rifle docs.
 */
extern("dialogs_jupiter.jup_b47_actor_has_hauss_rifle_docs", (_: GameObject, __: GameObject): boolean => {
  return $isNotNil(registry.actor.object(questItems.zat_a23_gauss_rifle_docs));
});

/**
 * Check whether the actor is not an enemy of the Freedom faction.
 *
 * @param _ - Actor participating in the dialog, unused.
 * @param __ - NPC participating in the dialog, unused.
 * @returns Whether the actor is not a Freedom enemy.
 */
extern("dialogs_jupiter.jup_b47_actor_not_enemy_to_freedom", (_: GameObject, __: GameObject): boolean => {
  return !isActorEnemyWithFaction(communities.freedom);
});

/**
 * Check whether the actor is not an enemy of the Duty faction.
 *
 * @param _ - Actor participating in the dialog, unused.
 * @param __ - NPC participating in the dialog, unused.
 * @returns Whether the actor is not a Duty enemy.
 */
extern("dialogs_jupiter.jup_b47_actor_not_enemy_to_dolg", (_: GameObject, __: GameObject): boolean => {
  return !isActorEnemyWithFaction(communities.dolg);
});
