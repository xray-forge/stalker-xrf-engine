import { GameObject } from "xray16/alias";
import { AnyObject, extern, TSection } from "xray16/lib";
import { $isNotNil } from "xray16/macros";

import { infoPortions } from "@/engine/constants/info_portions";
import { ammo } from "@/engine/constants/items/ammo";
import { food } from "@/engine/constants/items/food";
import { misc } from "@/engine/constants/items/misc";
import { registry } from "@/engine/core/database";
import { getNpcSpeaker } from "@/engine/core/utils/dialog";
import { hasInfoPortion } from "@/engine/core/utils/info_portion";
import { transferItemsFromActor, transferItemsToActor, transferMoneyFromActor } from "@/engine/core/utils/reward";

/**
 * Detect a not yet delivered toolkit in the actor inventory and remember it on the actor.
 *
 * @param firstSpeaker - First participant of the dialog (actor).
 * @param secondSpeaker - Second participant of the dialog (NPC).
 * @returns Whether the actor carries a toolkit that has not been brought to the tech yet.
 */
extern("dialogs_zaton.zat_b3_actor_got_toolkit", (firstSpeaker: GameObject, secondSpeaker: GameObject): boolean => {
  const actor: GameObject = registry.actor;

  actor.iterate_inventory((owner: GameObject, item: GameObject) => {
    const section: TSection = item.section();

    if (
      (section === misc.toolkit_1 && !hasInfoPortion(infoPortions.zat_b3_tech_instrument_1_brought)) ||
      (section === misc.toolkit_2 && !hasInfoPortion(infoPortions.zat_b3_tech_instrument_2_brought)) ||
      (section === misc.toolkit_3 && !hasInfoPortion(infoPortions.zat_b3_tech_instrument_3_brought))
    ) {
      (actor as AnyObject).toolkit = section;

      return;
    }
  }, actor);

  return $isNotNil((actor as AnyObject).toolkit);
});

/**
 * Transfer a bottle of vodka from the actor to the dialog NPC.
 *
 * @param firstSpeaker - First participant of the dialog (actor).
 * @param secondSpeaker - Second participant of the dialog (NPC).
 */
extern("dialogs_zaton.give_vodka", (firstSpeaker: GameObject, secondSpeaker: GameObject): void => {
  transferItemsFromActor(getNpcSpeaker(firstSpeaker, secondSpeaker), food.vodka);
});

/**
 * Check whether the actor carries vodka.
 *
 * @param firstSpeaker - First participant of the dialog (actor).
 * @param secondSpeaker - Second participant of the dialog (NPC).
 * @returns Whether the actor owns a bottle of vodka.
 */
extern("dialogs_zaton.if_actor_has_vodka", (firstSpeaker: GameObject, secondSpeaker: GameObject): boolean => {
  return $isNotNil(registry.actor.object(food.vodka));
});

/**
 * Check whether the actor has enough money to buy the battery.
 *
 * @param firstSpeaker - First participant of the dialog (actor).
 * @param secondSpeaker - Second participant of the dialog (NPC).
 * @returns Whether the actor owns at least 2000 money.
 */
extern(
  "dialogs_zaton.actor_has_more_then_need_money_to_buy_battery",
  (firstSpeaker: GameObject, secondSpeaker: GameObject): boolean => {
    return registry.actor.money() >= 2000;
  }
);

/**
 * Check whether the actor lacks the money to buy the battery.
 *
 * @param firstSpeaker - First participant of the dialog (actor).
 * @param secondSpeaker - Second participant of the dialog (NPC).
 * @returns Whether the actor owns less than 2000 money.
 */
extern(
  "dialogs_zaton.actor_has_less_then_need_money_to_buy_battery",
  (firstSpeaker: GameObject, secondSpeaker: GameObject): boolean => {
    return registry.actor.money() < 2000;
  }
);

/**
 * Transfer the 2000 money battery price from the actor to the dialog NPC.
 *
 * @param firstSpeaker - First participant of the dialog (actor).
 * @param secondSpeaker - Second participant of the dialog (NPC).
 */
extern(
  "dialogs_zaton.relocate_need_money_to_buy_battery",
  (firstSpeaker: GameObject, secondSpeaker: GameObject): void => {
    transferMoneyFromActor(getNpcSpeaker(firstSpeaker, secondSpeaker), 2000);
  }
);

/**
 * Give the gauss battery ammo from the NPC to the actor.
 *
 * @param firstSpeaker - First participant of the dialog (actor).
 * @param secondSpeaker - Second participant of the dialog (NPC).
 */
extern("dialogs_zaton.give_actor_battery", (firstSpeaker: GameObject, secondSpeaker: GameObject): void => {
  transferItemsToActor(getNpcSpeaker(firstSpeaker, secondSpeaker), ammo.ammo_gauss_cardan);
});

/**
 * Check whether the tech is still willing to drink with the actor.
 *
 * @param firstSpeaker - First participant of the dialog (actor).
 * @param secondSpeaker - Second participant of the dialog (NPC).
 * @returns Whether the gauss is repaired without a no-more flag or the tech has not yet seen produce 62.
 */
extern("dialogs_zaton.zat_b3_tech_drinks_precond", (firstSpeaker: GameObject, secondSpeaker: GameObject): boolean => {
  if (hasInfoPortion(infoPortions.zat_b3_gauss_repaired) && !hasInfoPortion(infoPortions.zat_b3_tech_drink_no_more)) {
    return true;
  } else if (!hasInfoPortion(infoPortions.zat_b3_tech_see_produce_62)) {
    return true;
  }

  return false;
});
