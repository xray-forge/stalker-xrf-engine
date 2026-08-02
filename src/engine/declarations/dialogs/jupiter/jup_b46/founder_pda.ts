import { GameObject } from "xray16/alias";
import { extern } from "xray16/lib";
import { $isNotNil } from "xray16/macros";

import { infoPortions } from "@/engine/constants/info_portions/info_portions";
import { ammo } from "@/engine/constants/items/ammo";
import { questItems } from "@/engine/constants/items/quest_items";
import { weapons } from "@/engine/constants/items/weapons";
import { registry } from "@/engine/core/database";
import { getNpcSpeaker } from "@/engine/core/utils/dialog";
import { giveInfoPortion, hasInfoPortion } from "@/engine/core/utils/info_portion";
import { giveItemsToActor, giveMoneyToActor, transferItemsFromActor } from "@/engine/core/utils/reward";

/**
 * Reward the actor with money and weapons for the b46 founder PDA, depending on the chosen faction.
 *
 * @param _ - Actor participating in the dialog, unused.
 * @param __ - NPC participating in the dialog, unused.
 */
extern("dialogs_jupiter.jup_b46_sell_duty_founder_pda", (_: GameObject, __: GameObject): void => {
  if (hasInfoPortion(infoPortions.jup_b46_duty_founder_pda_to_freedom)) {
    giveMoneyToActor(4000);
    giveItemsToActor(weapons.wpn_sig550, 1);
    giveItemsToActor(ammo["ammo_5.56x45_ss190"], 150);
  } else if (hasInfoPortion(infoPortions.jup_b46_duty_founder_pda_to_duty)) {
    giveMoneyToActor(4000);
    giveItemsToActor(weapons.wpn_groza, 1);
    giveItemsToActor(ammo.ammo_9x39_ap, 60);
    giveItemsToActor(ammo["ammo_vog-25"], 2);
  }
});

/**
 * Transfer the b46 Duty founder PDA from the actor to the NPC speaker if present.
 *
 * @param firstSpeaker - Actor participating in the dialog.
 * @param secondSpeaker - NPC participating in the dialog.
 */
extern(
  "dialogs_jupiter.jup_b46_transfer_duty_founder_pda",
  (firstSpeaker: GameObject, secondSpeaker: GameObject): void => {
    if ($isNotNil(registry.actor.object(questItems.jup_b46_duty_founder_pda))) {
      transferItemsFromActor(getNpcSpeaker(firstSpeaker, secondSpeaker), questItems.jup_b46_duty_founder_pda);
    }
  }
);

/**
 * Sell the b46 Duty founder PDA to the Owl trader for money and set the related info portions.
 *
 * @param firstSpeaker - Actor participating in the dialog.
 * @param secondSpeaker - NPC participating in the dialog.
 */
extern(
  "dialogs_jupiter.jup_b46_sell_duty_founder_pda_to_owl",
  (firstSpeaker: GameObject, secondSpeaker: GameObject): void => {
    transferItemsFromActor(getNpcSpeaker(firstSpeaker, secondSpeaker), questItems.jup_b46_duty_founder_pda);
    giveMoneyToActor(2500);
    giveInfoPortion(infoPortions.jup_b46_duty_founder_pda_sold);
    giveInfoPortion(infoPortions.jup_b46_duty_founder_pda_to_stalkers);
  }
);

/**
 * Check whether the actor has the b46 Duty founder PDA.
 *
 * @param _ - Actor participating in the dialog, unused.
 * @param __ - NPC participating in the dialog, unused.
 * @returns Whether the actor has the founder PDA.
 */
extern("dialogs_jupiter.jup_b46_actor_has_founder_pda", (_: GameObject, __: GameObject): boolean => {
  return $isNotNil(registry.actor.object(questItems.jup_b46_duty_founder_pda));
});
