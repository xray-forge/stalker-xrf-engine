import { GameObject } from "xray16/alias";
import { extern, TCount } from "xray16/lib";
import { $isNotNil } from "xray16/macros";

import { infoPortions } from "@/engine/constants/info_portions/info_portions";
import { questItems } from "@/engine/constants/items/quest_items";
import { registry } from "@/engine/core/database";
import { getNpcSpeaker, isObjectName } from "@/engine/core/utils/dialog";
import { giveInfoPortion } from "@/engine/core/utils/info_portion";
import { giveMoneyToActor, transferItemsFromActor, transferItemsToActor } from "@/engine/core/utils/reward";

/**
 * Check the precondition for the b207 decrypt dialog, requiring the actor to carry the b9 blackbox.
 *
 * @param _ - Actor participating in the dialog, unused.
 * @param secondSpeaker - NPC participating in the dialog.
 * @returns Whether the decrypt dialog is available.
 */
extern(
  "dialogs_jupiter.jup_b207_generic_decrypt_need_dialog_precond",
  (_: GameObject, secondSpeaker: GameObject): boolean => {
    const actor: GameObject = registry.actor;

    if ($isNotNil(actor.object(questItems.jup_b9_blackbox))) {
      return true;
    }

    if (isObjectName(secondSpeaker, "mechanic") || isObjectName(secondSpeaker, "tech")) {
      return false;
    }

    return false;
  }
);

/**
 * Check whether the actor has the b5 dealer PDA device.
 *
 * @param _ - Actor participating in the dialog, unused.
 * @param __ - NPC participating in the dialog, unused.
 * @returns Whether the actor has the dealer PDA.
 */
extern("dialogs_jupiter.jup_b207_actor_has_dealers_pda", (_: GameObject, __: GameObject): boolean => {
  return $isNotNil(registry.actor.object("device_pda_zat_b5_dealer"));
});

/**
 * Sell the dealer PDA from the actor for money and mark it as sold.
 *
 * @param firstSpeaker - Actor participating in the dialog.
 * @param secondSpeaker - NPC participating in the dialog.
 */
extern("dialogs_jupiter.jup_b207_sell_dealers_pda", (firstSpeaker: GameObject, secondSpeaker: GameObject): void => {
  transferItemsFromActor(getNpcSpeaker(firstSpeaker, secondSpeaker), "device_pda_zat_b5_dealer");
  giveMoneyToActor(4_000);
  giveInfoPortion(infoPortions.jup_b207_dealers_pda_sold);
});

/**
 * Transfer the dealer PDA from the actor to the NPC speaker.
 *
 * @param firstSpeaker - Actor participating in the dialog.
 * @param secondSpeaker - NPC participating in the dialog.
 */
extern("dialogs_jupiter.jup_b207_give_dealers_pda", (firstSpeaker: GameObject, secondSpeaker: GameObject): void => {
  transferItemsFromActor(getNpcSpeaker(firstSpeaker, secondSpeaker), "device_pda_zat_b5_dealer");
});

/**
 * Check whether the actor has the b207 mercenary PDA with contract.
 *
 * @param _ - Actor participating in the dialog, unused.
 * @param __ - NPC participating in the dialog, unused.
 * @returns Whether the actor has the mercenary PDA.
 */
extern("dialogs_jupiter.jup_b207_actor_has_merc_pda_with_contract", (_: GameObject, __: GameObject): boolean => {
  return $isNotNil(registry.actor.object("jup_b207_merc_pda_with_contract"));
});

/**
 * Sell the mercenary PDA with contract from the actor for money and mark it as sold.
 *
 * @param firstSpeaker - Actor participating in the dialog.
 * @param secondSpeaker - NPC participating in the dialog.
 */
extern(
  "dialogs_jupiter.jup_b207_sell_merc_pda_with_contract",
  (firstSpeaker: GameObject, secondSpeaker: GameObject): void => {
    const amount: TCount = 1000;

    transferItemsFromActor(getNpcSpeaker(firstSpeaker, secondSpeaker), "jup_b207_merc_pda_with_contract");
    giveMoneyToActor(amount);
    giveInfoPortion(infoPortions.jup_b207_merc_pda_with_contract_sold);
  }
);

/**
 * Transfer the mercenary PDA with contract from the actor to the NPC speaker.
 *
 * @param firstSpeaker - Actor participating in the dialog.
 * @param secondSpeaker - NPC participating in the dialog.
 */
extern(
  "dialogs_jupiter.jup_b207_transfer_blackmail_reward",
  (firstSpeaker: GameObject, secondSpeaker: GameObject): void => {
    transferItemsFromActor(getNpcSpeaker(firstSpeaker, secondSpeaker), "jup_b207_merc_pda_with_contract");
  }
);

/**
 * Take the mercenary PDA with contract from the actor and give an Abakan rifle in return.
 *
 * @param firstSpeaker - Actor participating in the dialog.
 * @param secondSpeaker - NPC participating in the dialog.
 */
extern(
  "dialogs_jupiter.jup_b207_transfer_blackmail_reward_for_pda",
  (firstSpeaker: GameObject, secondSpeaker: GameObject): void => {
    transferItemsFromActor(getNpcSpeaker(firstSpeaker, secondSpeaker), "jup_b207_merc_pda_with_contract");
    transferItemsToActor(getNpcSpeaker(firstSpeaker, secondSpeaker), "wpn_abakan");
  }
);
