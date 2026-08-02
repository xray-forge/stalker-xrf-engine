import { GameObject } from "xray16/alias";
import { AnyCallable, extern, getExtern } from "xray16/lib";
import { $isNil, $isNotNil } from "xray16/macros";

import { infoPortions } from "@/engine/constants/info_portions/info_portions";
import { questItems } from "@/engine/constants/items/quest_items";
import { registry } from "@/engine/core/database";
import { getNpcSpeaker } from "@/engine/core/utils/dialog";
import { giveInfoPortion } from "@/engine/core/utils/info_portion";
import { giveMoneyToActor, transferItemsFromActor } from "@/engine/core/utils/reward";

/**
 * Check whether the actor is missing at least one of the a9 mail quest items.
 *
 * @param firstSpeaker - Actor participating in the dialog.
 * @param secondSpeaker - NPC participating in the dialog.
 * @returns Whether the actor does not have all a9 mail items.
 */
extern(
  "dialogs_jupiter.jupiter_a9_actor_hasnt_all_mail_items",
  (firstSpeaker: GameObject, secondSpeaker: GameObject): boolean => {
    return !getExtern<AnyCallable>("jupiter_a9_actor_has_all_mail_items", getExtern("dialogs_jupiter"))(
      firstSpeaker,
      secondSpeaker
    );
  }
);

/**
 * Check whether the actor has all three a9 mail quest items.
 *
 * @param _ - Actor participating in the dialog, unused.
 * @param __ - NPC participating in the dialog, unused.
 * @returns Whether the actor has all a9 mail items.
 */
extern("dialogs_jupiter.jupiter_a9_actor_has_all_mail_items", (_: GameObject, __: GameObject): boolean => {
  const actor: GameObject = registry.actor;

  return (
    $isNotNil(actor.object(questItems.jup_a9_conservation_info)) &&
    $isNotNil(actor.object(questItems.jup_a9_power_info)) &&
    $isNotNil(actor.object(questItems.jup_a9_way_info))
  );
});

/**
 * Check whether the actor has any of the a9 mail quest items.
 *
 * @param _ - Actor participating in the dialog, unused.
 * @param __ - NPC participating in the dialog, unused.
 * @returns Whether the actor has any a9 mail item.
 */
extern("dialogs_jupiter.jupiter_a9_actor_has_any_mail_items", (_: GameObject, __: GameObject): boolean => {
  const actor: GameObject = registry.actor;

  return (
    $isNotNil(actor.object(questItems.jup_a9_conservation_info)) ||
    $isNotNil(actor.object(questItems.jup_a9_power_info)) ||
    $isNotNil(actor.object(questItems.jup_a9_way_info))
  );
});

/**
 * Check whether the actor is missing any of the a9 mail quest items.
 *
 * @param _ - Actor participating in the dialog, unused.
 * @param __ - NPC participating in the dialog, unused.
 * @returns Whether the actor lacks at least one a9 mail item.
 */
extern("dialogs_jupiter.jupiter_a9_actor_hasnt_any_mail_items", (_: GameObject, __: GameObject): boolean => {
  const actor: GameObject = registry.actor;

  return (
    $isNil(actor.object(questItems.jup_a9_conservation_info)) ||
    $isNil(actor.object(questItems.jup_a9_power_info)) ||
    $isNil(actor.object(questItems.jup_a9_way_info))
  );
});

/**
 * Sell the a9 evacuation info to the Owl trader for money and mark it as sold.
 *
 * @param firstSpeaker - Actor participating in the dialog.
 * @param secondSpeaker - NPC participating in the dialog.
 */
extern(
  "dialogs_jupiter.jup_a9_owl_stalker_trader_sell_jup_a9_evacuation_info",
  (firstSpeaker: GameObject, secondSpeaker: GameObject): void => {
    transferItemsFromActor(getNpcSpeaker(firstSpeaker, secondSpeaker), questItems.jup_a9_evacuation_info);
    giveMoneyToActor(750);
    giveInfoPortion(infoPortions.jup_a9_evacuation_info_sold);
  }
);

/**
 * Sell the a9 meeting info to the Owl trader for money and mark it as sold.
 *
 * @param firstSpeaker - Actor participating in the dialog.
 * @param secondSpeaker - NPC participating in the dialog.
 */
extern(
  "dialogs_jupiter.jup_a9_owl_stalker_trader_sell_jup_a9_meeting_info",
  (firstSpeaker: GameObject, secondSpeaker: GameObject): void => {
    transferItemsFromActor(getNpcSpeaker(firstSpeaker, secondSpeaker), questItems.jup_a9_meeting_info);
    giveMoneyToActor(750);
    giveInfoPortion(infoPortions.jup_a9_meeting_info_sold);
  }
);

/**
 * Sell the a9 losses info to the Owl trader for money and mark it as sold.
 *
 * @param firstSpeaker - Actor participating in the dialog.
 * @param secondSpeaker - NPC participating in the dialog.
 */
extern(
  "dialogs_jupiter.jup_a9_owl_stalker_trader_sell_jup_a9_losses_info",
  (firstSpeaker: GameObject, secondSpeaker: GameObject): void => {
    transferItemsFromActor(getNpcSpeaker(firstSpeaker, secondSpeaker), questItems.jup_a9_losses_info);
    giveMoneyToActor(750);
    giveInfoPortion(infoPortions.jup_a9_losses_info_sold);
  }
);

/**
 * Sell the a9 delivery info to the Owl trader for money and mark it as sold.
 *
 * @param firstSpeaker - Actor participating in the dialog.
 * @param secondSpeaker - NPC participating in the dialog.
 */
extern(
  "dialogs_jupiter.jup_a9_owl_stalker_trader_sell_jup_a9_delivery_info",
  (firstSpeaker: GameObject, secondSpeaker: GameObject): void => {
    transferItemsFromActor(getNpcSpeaker(firstSpeaker, secondSpeaker), questItems.jup_a9_delivery_info);
    giveMoneyToActor(750);
    giveInfoPortion(infoPortions.jup_a9_delivery_info_sold);
  }
);
