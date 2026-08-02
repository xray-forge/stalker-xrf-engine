import { GameObject } from "xray16/alias";
import { AnyCallable, extern, getExtern } from "xray16/lib";
import { $isNotNil } from "xray16/macros";

import { infoPortions } from "@/engine/constants/info_portions/info_portions";
import { questItems } from "@/engine/constants/items/quest_items";
import { weapons } from "@/engine/constants/items/weapons";
import { registry } from "@/engine/core/database";
import { getNpcSpeaker } from "@/engine/core/utils/dialog";
import { giveInfoPortion, hasInfoPortion } from "@/engine/core/utils/info_portion";
import { giveMoneyToActor, transferItemsFromActor, transferMoneyFromActor } from "@/engine/core/utils/reward";

/**
 * Check whether the actor has the b206 plant quest item.
 *
 * @param _ - Actor participating in the dialog, unused.
 * @param __ - NPC participating in the dialog, unused.
 * @returns Whether the actor has the plant item.
 */
extern("dialogs_jupiter.actor_has_plant", (_: GameObject, __: GameObject): boolean => {
  return $isNotNil(registry.actor.object(questItems.jup_b206_plant));
});

/**
 * Transfer the b206 plant quest item from the actor to the NPC speaker.
 *
 * @param firstSpeaker - Actor participating in the dialog.
 * @param secondSpeaker - NPC participating in the dialog.
 */
extern("dialogs_jupiter.actor_relocate_plant", (firstSpeaker: GameObject, secondSpeaker: GameObject): void => {
  transferItemsFromActor(getNpcSpeaker(firstSpeaker, secondSpeaker), questItems.jup_b206_plant);
});

/**
 * Check whether the actor carries one of the accepted high-tier weapons in a weapon slot.
 *
 * @param _ - Actor participating in the dialog, unused.
 * @param __ - NPC participating in the dialog, unused.
 * @returns Whether a matching weapon is equipped.
 */
extern("dialogs_jupiter.jup_a10_proverka_wpn", (_: GameObject, __: GameObject): boolean => {
  const table = [
    weapons.wpn_desert_eagle,
    weapons.wpn_desert_eagle_nimble,
    weapons.wpn_sig550,
    weapons.wpn_g36,
    weapons.wpn_g36_nimble,
    weapons.wpn_fn2000,
    weapons.wpn_fn2000_nimble,
    weapons.wpn_groza,
    weapons.wpn_groza_nimble,
    weapons.wpn_val,
    weapons.wpn_vintorez,
    weapons.wpn_vintorez_nimble,
    weapons.wpn_svd,
    weapons.wpn_svu,
    weapons.wpn_pkm,
    weapons.wpn_spas12,
    weapons.wpn_spas12_nimble,
    weapons.wpn_protecta,
    weapons.wpn_protecta_nimble,
    weapons.wpn_gauss,
    weapons.wpn_rpg7,
    weapons["wpn_rg-6"],
    weapons.wpn_pkm_zulus,
  ];

  const actor: GameObject = registry.actor;

  for (const v of table) {
    if (actor.item_in_slot(2)?.section() === v || actor.item_in_slot(3)?.section() === v) {
      return true;
    }
  }

  return false;
});

/**
 * Check whether the actor does not carry any of the accepted high-tier weapons.
 *
 * @param firstSpeaker - Actor participating in the dialog.
 * @param secondSpeaker - NPC participating in the dialog.
 * @returns Whether no matching weapon is equipped.
 */
extern("dialogs_jupiter.jup_a10_proverka_wpn_false", (firstSpeaker: GameObject, secondSpeaker: GameObject): boolean => {
  return !getExtern<AnyCallable>("jup_a10_proverka_wpn", getExtern("dialogs_jupiter"))(firstSpeaker, secondSpeaker);
});

/**
 * Check whether the actor has enough money for the a10 debt, reduced when the percent-free info is set.
 *
 * @param _ - Actor participating in the dialog, unused.
 * @param __ - NPC participating in the dialog, unused.
 * @returns Whether the actor can pay the debt.
 */
extern("dialogs_jupiter.jup_a10_actor_has_money", (_: GameObject, __: GameObject): boolean => {
  const actor: GameObject = registry.actor;

  if (hasInfoPortion(infoPortions.jup_a10_debt_wo_percent)) {
    return actor.money() >= 5000;
  } else {
    return actor.money() >= 7000;
  }
});

/**
 * Check whether the actor cannot afford the a10 debt payment.
 *
 * @param firstSpeaker - Actor participating in the dialog.
 * @param secondSpeaker - NPC participating in the dialog.
 * @returns Whether the actor lacks the required money.
 */
extern(
  "dialogs_jupiter.jup_a10_actor_has_not_money",
  (firstSpeaker: GameObject, secondSpeaker: GameObject): boolean => {
    return !getExtern<AnyCallable>("jup_a10_actor_has_money", getExtern("dialogs_jupiter"))(
      firstSpeaker,
      secondSpeaker
    );
  }
);

/**
 * Take the a10 debt payment from the actor and set the matching paid-debt info portion.
 *
 * @param firstSpeaker - Actor participating in the dialog.
 * @param secondSpeaker - NPC participating in the dialog.
 */
extern("dialogs_jupiter.jup_a10_actor_give_money", (firstSpeaker: GameObject, secondSpeaker: GameObject): void => {
  if (hasInfoPortion(infoPortions.jup_a10_debt_wo_percent)) {
    transferMoneyFromActor(getNpcSpeaker(firstSpeaker, secondSpeaker), 5000);
    giveInfoPortion(infoPortions.jup_a10_bandit_take_money);
  } else {
    transferMoneyFromActor(getNpcSpeaker(firstSpeaker, secondSpeaker), 7000);
    giveInfoPortion(infoPortions.jup_a10_bandit_take_all_money);
  }
});

/**
 * Give the actor money from Vano during the a10 quest.
 *
 * @param _ - Actor participating in the dialog, unused.
 * @param __ - NPC participating in the dialog, unused.
 */
extern("dialogs_jupiter.jup_a10_vano_give_money", (_: GameObject, __: GameObject): void => {
  giveMoneyToActor(5000);
});

/**
 * Take the outfit payment money from the actor for the a10 quest.
 *
 * @param firstSpeaker - Actor participating in the dialog.
 * @param secondSpeaker - NPC participating in the dialog.
 */
extern(
  "dialogs_jupiter.jup_a10_actor_give_outfit_money",
  (firstSpeaker: GameObject, secondSpeaker: GameObject): void => {
    transferMoneyFromActor(getNpcSpeaker(firstSpeaker, secondSpeaker), 5000);
  }
);

/**
 * Check whether the actor has enough money to pay for the a10 outfit.
 *
 * @param _ - Actor participating in the dialog, unused.
 * @param __ - NPC participating in the dialog, unused.
 * @returns Whether the actor can afford the outfit.
 */
extern("dialogs_jupiter.jup_a10_actor_has_outfit_money", (_: GameObject, __: GameObject): boolean => {
  return registry.actor.money() >= 5000;
});

/**
 * Check whether the actor cannot afford the a10 outfit.
 *
 * @param firstSpeaker - Actor participating in the dialog.
 * @param secondSpeaker - NPC participating in the dialog.
 * @returns Whether the actor lacks the outfit money.
 */
extern(
  "dialogs_jupiter.jup_a10_actor_has_not_outfit_money",
  (firstSpeaker: GameObject, secondSpeaker: GameObject): boolean => {
    return !getExtern<AnyCallable>("jup_a10_actor_has_outfit_money", getExtern("dialogs_jupiter"))(
      firstSpeaker,
      secondSpeaker
    );
  }
);
