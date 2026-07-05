import { game, level } from "xray16";
import { GameObject } from "xray16/alias";
import { $filename, $fromArray, $fromObject } from "xray16/macros";

import { getManager, isStoryObjectExisting, registry } from "@/engine/core/database";
import { getPortableStoreValue, setPortableStoreValue } from "@/engine/core/database/portable_store";
import { ENotificationDirection, NotificationManager } from "@/engine/core/managers/notifications";
import { TreasureManager } from "@/engine/core/managers/treasures";
import { extern, getExtern } from "@/engine/core/utils/binding";
import { getNpcSpeaker, isObjectName } from "@/engine/core/utils/dialog";
import { disableInfoPortion, giveInfoPortion, hasInfoPortion } from "@/engine/core/utils/info_portion";
import { actorHasAtLeastOneItem, actorHasItem, objectHasItem } from "@/engine/core/utils/item";
import { LuaLogger } from "@/engine/core/utils/logging";
import {
  giveItemsToActor,
  giveMoneyToActor,
  transferItemsFromActor,
  transferItemsToActor,
  transferMoneyFromActor,
} from "@/engine/core/utils/reward";
import { ACTOR_ID } from "@/engine/lib/constants/ids";
import { infoPortions, TInfoPortion } from "@/engine/lib/constants/info_portions";
import { TInventoryItem } from "@/engine/lib/constants/items";
import { ammo } from "@/engine/lib/constants/items/ammo";
import { artefacts } from "@/engine/lib/constants/items/artefacts";
import { detectors } from "@/engine/lib/constants/items/detectors";
import { drugs, TDrugItem } from "@/engine/lib/constants/items/drugs";
import { food, TFoodItem } from "@/engine/lib/constants/items/food";
import { helmets } from "@/engine/lib/constants/items/helmets";
import { misc } from "@/engine/lib/constants/items/misc";
import { outfits } from "@/engine/lib/constants/items/outfits";
import { questItems } from "@/engine/lib/constants/items/quest_items";
import { TWeapon, weapons } from "@/engine/lib/constants/items/weapons";
import {
  AnyCallable,
  AnyCallablesModule,
  AnyObject,
  LuaArray,
  Nillable,
  TCount,
  TIndex,
  TName,
  TSection,
  TStringId,
} from "@/engine/lib/types";

const logger: LuaLogger = new LuaLogger($filename);

logger.info("Resolve and bind dialogs zaton");

/**
 * Declare globals object.
 */
extern("dialogs_zaton", {});

/**
 * Check whether the actor carries any quest item that the Owl trader is willing to buy.
 *
 * @param firstSpeaker - First participant of the dialog (actor).
 * @param secondSpeaker - Second participant of the dialog (NPC).
 * @returns Whether the actor has at least one sellable quest item not yet discussed with the trader.
 */
extern(
  "dialogs_zaton.zat_b30_owl_stalker_trader_actor_has_item_to_sell",
  (firstSpeaker: GameObject, secondSpeaker: GameObject): boolean => {
    const itemsTable: LuaArray<TInventoryItem> = $fromArray<TInventoryItem>([
      questItems.zat_b20_noah_pda,
      questItems.zat_b40_notebook,
      questItems.zat_b40_pda_1,
      questItems.zat_b40_pda_2,
      questItems.pri_b36_monolith_hiding_place_pda,
      questItems.pri_b306_envoy_pda,
      questItems.jup_b46_duty_founder_pda,
      questItems.jup_b207_merc_pda_with_contract,
      questItems.device_pda_zat_b5_dealer,
      questItems.jup_b10_notes_01,
      questItems.jup_b10_notes_02,
      questItems.jup_b10_notes_03,
      questItems.jup_a9_evacuation_info,
      questItems.jup_a9_meeting_info,
      questItems.jup_a9_losses_info,
      questItems.jup_a9_delivery_info,
      questItems.zat_b12_documents_1,
      questItems.zat_b12_documents_2,
      questItems.device_flash_snag,
      questItems.jup_b202_bandit_pda,
      questItems.device_pda_port_bandit_leader,
      questItems.jup_b10_ufo_memory_2,
      // -- no sell
      questItems.jup_b1_half_artifact,
      artefacts.af_quest_b14_twisted,
      artefacts.af_oasis_heart,
      detectors.detector_scientific,
    ]);

    const infoPortionsTable: LuaTable<TInventoryItem, TInfoPortion> = $fromObject({
      [questItems.jup_b1_half_artifact]: infoPortions.zat_b30_owl_stalker_about_halfart_jup_b6_asked,
      [artefacts.af_quest_b14_twisted]: infoPortions.zat_b30_owl_stalker_about_halfart_zat_b14_asked,
      [artefacts.af_oasis_heart]: infoPortions.zat_b30_owl_stalker_trader_about_osis_art,
      [detectors.detector_scientific]: infoPortions.zat_b30_owl_detectors_approached,
    } as Record<TInventoryItem, TInfoPortion>);

    const actor: GameObject = registry.actor;

    for (const [k, v] of itemsTable) {
      if (actor.object(v) !== null) {
        if (v === detectors.detector_scientific && !hasInfoPortion(infoPortions.zat_b30_second_detector)) {
          // --
        } else {
          if (infoPortionsTable.get(v) !== null) {
            if (!hasInfoPortion(infoPortionsTable.get(v))) {
              return true;
            }
          } else {
            return true;
          }
        }
      }
    }

    return false;
  }
);

/**
 * Check whether Owl still has undiscussed information about searched helicopters.
 *
 * @param firstSpeaker - First participant of the dialog (actor).
 * @param secondSpeaker - Second participant of the dialog (NPC).
 * @returns Whether at least one of the tracked helicopters is searched and not yet reported by Owl.
 */
extern(
  "dialogs_zaton.zat_b30_owl_can_say_about_heli",
  (firstSpeaker: GameObject, secondSpeaker: GameObject): boolean => {
    const table: LuaArray<TInfoPortion> = $fromArray<TInfoPortion>([
      infoPortions.zat_b28_heli_3_searched,
      infoPortions.zat_b100_heli_2_searched,
      infoPortions.zat_b101_heli_5_searched,
    ]);

    const table2: LuaArray<TInfoPortion> = $fromArray<TInfoPortion>([
      infoPortions.zat_b30_owl_scat_1,
      infoPortions.zat_b30_owl_scat_2,
      infoPortions.zat_b30_owl_scat_3,
    ]);

    let count: TCount = 3;

    for (const k of $range(1, table.length())) {
      if (hasInfoPortion(table.get(k)) || hasInfoPortion(table2.get(k))) {
        count -= 1;
      }
    }

    return count > 0;
  }
);

/**
 * Check whether the actor has at least 1000 money.
 *
 * @param firstSpeaker - First participant of the dialog (actor).
 * @param secondSpeaker - Second participant of the dialog (NPC).
 * @returns Whether the actor owns 1000 money or more.
 */
extern("dialogs_zaton.zat_b30_actor_has_1000", (firstSpeaker: GameObject, secondSpeaker: GameObject): boolean => {
  return registry.actor.money() >= 1000;
});

/**
 * Check whether the actor has at least 200 money.
 *
 * @param firstSpeaker - First participant of the dialog (actor).
 * @param secondSpeaker - Second participant of the dialog (NPC).
 * @returns Whether the actor owns 200 money or more.
 */
extern("dialogs_zaton.zat_b30_actor_has_200", (firstSpeaker: GameObject, secondSpeaker: GameObject): boolean => {
  return registry.actor.money() >= 200;
});

/**
 * Check whether the actor carries the Pripyat monolith hiding place PDA.
 *
 * @param firstSpeaker - First participant of the dialog (actor).
 * @param secondSpeaker - Second participant of the dialog (NPC).
 * @returns Whether the actor owns the monolith hiding place PDA quest item.
 */
extern(
  "dialogs_zaton.zat_b30_actor_has_pri_b36_monolith_hiding_place_pda",
  (firstSpeaker: GameObject, secondSpeaker: GameObject): boolean => {
    return registry.actor.object(questItems.pri_b36_monolith_hiding_place_pda) !== null;
  }
);

/**
 * Check whether the actor carries the envoy PDA.
 *
 * @param firstSpeaker - First participant of the dialog (actor).
 * @param secondSpeaker - Second participant of the dialog (NPC).
 * @returns Whether the actor owns the envoy PDA quest item.
 */
extern(
  "dialogs_zaton.zat_b30_actor_has_pri_b306_envoy_pda",
  (firstSpeaker: GameObject, secondSpeaker: GameObject): boolean => {
    return registry.actor.object(questItems.pri_b306_envoy_pda) !== null;
  }
);

/**
 * Check whether the actor carries the first part of Strelok notes.
 *
 * @param firstSpeaker - First participant of the dialog (actor).
 * @param secondSpeaker - Second participant of the dialog (NPC).
 * @returns Whether the actor owns the first Strelok notes quest item.
 */
extern(
  "dialogs_zaton.zat_b30_actor_has_jup_b10_strelok_notes_1",
  (firstSpeaker: GameObject, secondSpeaker: GameObject): boolean => {
    return registry.actor.object(questItems.jup_b10_notes_01) !== null;
  }
);

/**
 * Check whether the actor carries the second part of Strelok notes.
 *
 * @param firstSpeaker - First participant of the dialog (actor).
 * @param secondSpeaker - Second participant of the dialog (NPC).
 * @returns Whether the actor owns the second Strelok notes quest item.
 */
extern(
  "dialogs_zaton.zat_b30_actor_has_jup_b10_strelok_notes_2",
  (firstSpeaker: GameObject, secondSpeaker: GameObject): boolean => {
    return registry.actor.object(questItems.jup_b10_notes_02) !== null;
  }
);

/**
 * Check whether the actor carries the third part of Strelok notes.
 *
 * @param firstSpeaker - First participant of the dialog (actor).
 * @param secondSpeaker - Second participant of the dialog (NPC).
 * @returns Whether the actor owns the third Strelok notes quest item.
 */
extern(
  "dialogs_zaton.zat_b30_actor_has_jup_b10_strelok_notes_3",
  (firstSpeaker: GameObject, secondSpeaker: GameObject): boolean => {
    return registry.actor.object(questItems.jup_b10_notes_03) !== null;
  }
);

/**
 * Check whether the actor carries a scientific detector.
 *
 * @param firstSpeaker - First participant of the dialog (actor).
 * @param secondSpeaker - Second participant of the dialog (NPC).
 * @returns Whether the actor owns the scientific detector.
 */
extern(
  "dialogs_zaton.zat_b30_actor_has_detector_scientific",
  (firstSpeaker: GameObject, secondSpeaker: GameObject): boolean => {
    return registry.actor.object(detectors.detector_scientific) !== null;
  }
);

/**
 * Check whether the actor carries the flash drive quest item.
 *
 * @param firstSpeaker - First participant of the dialog (actor).
 * @param secondSpeaker - Second participant of the dialog (NPC).
 * @returns Whether the actor owns the flash drive quest item.
 */
extern(
  "dialogs_zaton.zat_b30_actor_has_device_flash_snag",
  (firstSpeaker: GameObject, secondSpeaker: GameObject): boolean => {
    return registry.actor.object(questItems.device_flash_snag) !== null;
  }
);

/**
 * Check whether the actor carries the port bandit leader PDA.
 *
 * @param firstSpeaker - First participant of the dialog (actor).
 * @param secondSpeaker - Second participant of the dialog (NPC).
 * @returns Whether the actor owns the port bandit leader PDA quest item.
 */
extern(
  "dialogs_zaton.zat_b30_actor_has_device_pda_port_bandit_leader",
  (firstSpeaker: GameObject, secondSpeaker: GameObject): boolean => {
    return registry.actor.object(questItems.device_pda_port_bandit_leader) !== null;
  }
);

/**
 * Check whether the actor carries the UFO memory device.
 *
 * @param firstSpeaker - First participant of the dialog (actor).
 * @param secondSpeaker - Second participant of the dialog (NPC).
 * @returns Whether the actor owns the UFO memory quest item.
 */
extern(
  "dialogs_zaton.zat_b30_actor_has_jup_b10_ufo_memory",
  (firstSpeaker: GameObject, secondSpeaker: GameObject): boolean => {
    return registry.actor.object(questItems.jup_b10_ufo_memory_2) !== null;
  }
);

/**
 * Check whether the actor carries the bandit PDA from Jupiter.
 *
 * @param firstSpeaker - First participant of the dialog (actor).
 * @param secondSpeaker - Second participant of the dialog (NPC).
 * @returns Whether the actor owns the bandit PDA quest item.
 */
extern(
  "dialogs_zaton.zat_b30_actor_has_jup_b202_bandit_pda",
  (firstSpeaker: GameObject, secondSpeaker: GameObject): boolean => {
    return registry.actor.object(questItems.jup_b202_bandit_pda) !== null;
  }
);

/**
 * Transfer 1000 money from the actor to the dialog NPC.
 *
 * @param firstSpeaker - First participant of the dialog (actor).
 * @param secondSpeaker - Second participant of the dialog (NPC).
 */
extern("dialogs_zaton.zat_b30_transfer_1000", (firstSpeaker: GameObject, secondSpeaker: GameObject): void => {
  transferMoneyFromActor(getNpcSpeaker(firstSpeaker, secondSpeaker), 1000);
});

/**
 * Transfer 200 money from the actor to the dialog NPC.
 *
 * @param firstSpeaker - First participant of the dialog (actor).
 * @param secondSpeaker - Second participant of the dialog (NPC).
 */
extern("dialogs_zaton.zat_b30_transfer_200", (firstSpeaker: GameObject, secondSpeaker: GameObject): void => {
  transferMoneyFromActor(getNpcSpeaker(firstSpeaker, secondSpeaker), 200);
});

/**
 * Sell the monolith hiding place PDA to the NPC and reward the actor with money.
 *
 * @param firstSpeaker - First participant of the dialog (actor).
 * @param secondSpeaker - Second participant of the dialog (NPC).
 */
extern(
  "dialogs_zaton.zat_b30_sell_pri_b36_monolith_hiding_place_pda",
  (firstSpeaker: GameObject, secondSpeaker: GameObject): void => {
    transferItemsFromActor(getNpcSpeaker(firstSpeaker, secondSpeaker), questItems.pri_b36_monolith_hiding_place_pda);
    giveMoneyToActor(5000);
  }
);

/**
 * Sell the envoy PDA to the NPC and reward the actor with money.
 *
 * @param firstSpeaker - First participant of the dialog (actor).
 * @param secondSpeaker - Second participant of the dialog (NPC).
 */
extern("dialogs_zaton.zat_b30_sell_pri_b306_envoy_pda", (firstSpeaker: GameObject, secondSpeaker: GameObject): void => {
  transferItemsFromActor(getNpcSpeaker(firstSpeaker, secondSpeaker), questItems.pri_b306_envoy_pda);
  giveMoneyToActor(4000);
});

/**
 * Sell the mercenary contract PDA to the NPC, reward money and mark the sale info portion.
 *
 * @param firstSpeaker - First participant of the dialog (actor).
 * @param secondSpeaker - Second participant of the dialog (NPC).
 */
extern(
  "dialogs_zaton.zat_b30_sell_jup_b207_merc_pda_with_contract",
  (firstSpeaker: GameObject, secondSpeaker: GameObject): void => {
    transferItemsFromActor(getNpcSpeaker(firstSpeaker, secondSpeaker), questItems.jup_b207_merc_pda_with_contract);
    giveMoneyToActor(1000);
    giveInfoPortion(infoPortions.jup_b207_merc_pda_with_contract_sold);
  }
);

/**
 * Sell the first Strelok notes to the NPC and reward the actor with money.
 *
 * @param firstSpeaker - First participant of the dialog (actor).
 * @param secondSpeaker - Second participant of the dialog (NPC).
 */
extern(
  "dialogs_zaton.zat_b30_sell_jup_b10_strelok_notes_1",
  (firstSpeaker: GameObject, secondSpeaker: GameObject): void => {
    transferItemsFromActor(getNpcSpeaker(firstSpeaker, secondSpeaker), questItems.jup_b10_notes_01);
    giveMoneyToActor(500);
  }
);

/**
 * Sell the second Strelok notes to the NPC and reward the actor with money.
 *
 * @param firstSpeaker - First participant of the dialog (actor).
 * @param secondSpeaker - Second participant of the dialog (NPC).
 */
extern(
  "dialogs_zaton.zat_b30_sell_jup_b10_strelok_notes_2",
  (firstSpeaker: GameObject, secondSpeaker: GameObject): void => {
    transferItemsFromActor(getNpcSpeaker(firstSpeaker, secondSpeaker), questItems.jup_b10_notes_02);
    giveMoneyToActor(500);
  }
);

/**
 * Sell the third Strelok notes to the NPC and reward the actor with money.
 *
 * @param firstSpeaker - First participant of the dialog (actor).
 * @param secondSpeaker - Second participant of the dialog (NPC).
 */
extern(
  "dialogs_zaton.zat_b30_sell_jup_b10_strelok_notes_3",
  (firstSpeaker: GameObject, secondSpeaker: GameObject): void => {
    transferItemsFromActor(getNpcSpeaker(firstSpeaker, secondSpeaker), questItems.jup_b10_notes_03);
    giveMoneyToActor(500);
  }
);

/**
 * Sell the evacuation info to Owl, reward money and mark the sale info portion.
 *
 * @param firstSpeaker - First participant of the dialog (actor).
 * @param secondSpeaker - Second participant of the dialog (NPC).
 */
extern(
  "dialogs_zaton.jup_a9_owl_stalker_trader_sell_jup_a9_evacuation_info",
  (firstSpeaker: GameObject, secondSpeaker: GameObject): void => {
    transferItemsFromActor(getNpcSpeaker(firstSpeaker, secondSpeaker), questItems.jup_a9_evacuation_info);
    giveMoneyToActor(750);
    giveInfoPortion(infoPortions.jup_a9_evacuation_info_sold);
  }
);

/**
 * Sell the meeting info to Owl, reward money and mark the sale info portion.
 *
 * @param firstSpeaker - First participant of the dialog (actor).
 * @param secondSpeaker - Second participant of the dialog (NPC).
 */
extern(
  "dialogs_zaton.jup_a9_owl_stalker_trader_sell_jup_a9_meeting_info",
  (firstSpeaker: GameObject, secondSpeaker: GameObject): void => {
    transferItemsFromActor(getNpcSpeaker(firstSpeaker, secondSpeaker), questItems.jup_a9_meeting_info);
    giveMoneyToActor(750);
    giveInfoPortion(infoPortions.jup_a9_meeting_info_sold);
  }
);

/**
 * Sell the losses info to Owl, reward money and mark the sale info portion.
 *
 * @param firstSpeaker - First participant of the dialog (actor).
 * @param secondSpeaker - Second participant of the dialog (NPC).
 */
extern(
  "dialogs_zaton.jup_a9_owl_stalker_trader_sell_jup_a9_losses_info",
  (firstSpeaker: GameObject, secondSpeaker: GameObject): void => {
    transferItemsFromActor(getNpcSpeaker(firstSpeaker, secondSpeaker), questItems.jup_a9_losses_info);
    giveMoneyToActor(750);
    giveInfoPortion(infoPortions.jup_a9_losses_info_sold);
  }
);

/**
 * Sell the delivery info to Owl, reward money and mark the sale info portion.
 *
 * @param firstSpeaker - First participant of the dialog (actor).
 * @param secondSpeaker - Second participant of the dialog (NPC).
 */
extern(
  "dialogs_zaton.jup_a9_owl_stalker_trader_sell_jup_a9_delivery_info",
  (firstSpeaker: GameObject, secondSpeaker: GameObject): void => {
    transferItemsFromActor(getNpcSpeaker(firstSpeaker, secondSpeaker), questItems.jup_a9_delivery_info);
    giveMoneyToActor(750);
    giveInfoPortion(infoPortions.jup_a9_delivery_info_sold);
  }
);

/**
 * Sell the flash drive to Owl, reward money and mark the sale info portion.
 *
 * @param firstSpeaker - First participant of the dialog (actor).
 * @param secondSpeaker - Second participant of the dialog (NPC).
 */
extern(
  "dialogs_zaton.zat_b30_owl_stalker_trader_sell_device_flash_snag",
  (firstSpeaker: GameObject, secondSpeaker: GameObject): void => {
    transferItemsFromActor(getNpcSpeaker(firstSpeaker, secondSpeaker), questItems.device_flash_snag);
    giveMoneyToActor(200);
    registry.actor.give_info_portion(infoPortions.device_flash_snag_sold);
  }
);

/**
 * Sell the port bandit leader PDA to Owl, reward money and mark the sale info portion.
 *
 * @param firstSpeaker - First participant of the dialog (actor).
 * @param secondSpeaker - Second participant of the dialog (NPC).
 */
extern(
  "dialogs_zaton.zat_b30_owl_stalker_trader_sell_device_pda_port_bandit_leader",
  (firstSpeaker: GameObject, secondSpeaker: GameObject): void => {
    transferItemsFromActor(getNpcSpeaker(firstSpeaker, secondSpeaker), questItems.device_pda_port_bandit_leader);
    giveMoneyToActor(1000);
    giveInfoPortion(infoPortions.device_pda_port_bandit_leader_sold);
  }
);

/**
 * Sell the UFO memory device to Owl, reward money and mark the sale info portion.
 *
 * @param firstSpeaker - First participant of the dialog (actor).
 * @param secondSpeaker - Second participant of the dialog (NPC).
 */
extern(
  "dialogs_zaton.zat_b30_owl_stalker_trader_sell_jup_b10_ufo_memory",
  (firstSpeaker: GameObject, secondSpeaker: GameObject): void => {
    transferItemsFromActor(getNpcSpeaker(firstSpeaker, secondSpeaker), questItems.jup_b10_ufo_memory_2);
    giveMoneyToActor(500);
    giveInfoPortion(infoPortions.jup_b10_ufo_memory_2_sold);
  }
);

/**
 * Sell the bandit PDA to Owl and reward the actor with money.
 *
 * @param firstSpeaker - First participant of the dialog (actor).
 * @param secondSpeaker - Second participant of the dialog (NPC).
 */
extern(
  "dialogs_zaton.zat_b30_owl_stalker_trader_sell_jup_b202_bandit_pda",
  (firstSpeaker: GameObject, secondSpeaker: GameObject): void => {
    transferItemsFromActor(getNpcSpeaker(firstSpeaker, secondSpeaker), questItems.jup_b202_bandit_pda);
    giveMoneyToActor(500);
  }
);

/**
 * Reward the actor with money for the bar quest line.
 *
 * @param firstSpeaker - First participant of the dialog (actor).
 * @param secondSpeaker - Second participant of the dialog (NPC).
 */
extern("dialogs_zaton.zat_b14_bar_transfer_money", (firstSpeaker: GameObject, secondSpeaker: GameObject): void => {
  giveMoneyToActor(1000);
});

/**
 * Transfer the twisted quest artefact from the actor to the dialog NPC.
 *
 * @param firstSpeaker - First participant of the dialog (actor).
 * @param secondSpeaker - Second participant of the dialog (NPC).
 */
extern("dialogs_zaton.zat_b14_transfer_artefact", (firstSpeaker: GameObject, secondSpeaker: GameObject): void => {
  transferItemsFromActor(getNpcSpeaker(firstSpeaker, secondSpeaker), artefacts.af_quest_b14_twisted);
});

/**
 * Check whether the speaker carries the twisted quest artefact.
 *
 * @param firstSpeaker - First participant of the dialog (actor).
 * @param secondSpeaker - Second participant of the dialog (NPC).
 * @returns Whether the first speaker owns the twisted quest artefact.
 */
extern("dialogs_zaton.actor_has_artefact", (firstSpeaker: GameObject, secondSpeaker: GameObject): boolean => {
  return firstSpeaker.object(artefacts.af_quest_b14_twisted) !== null;
});

/**
 * Check whether the speaker does not carry the twisted quest artefact.
 *
 * @param firstSpeaker - First participant of the dialog (actor).
 * @param secondSpeaker - Second participant of the dialog (NPC).
 * @returns Whether the first speaker lacks the twisted quest artefact.
 */
extern("dialogs_zaton.actor_hasnt_artefact", (firstSpeaker: GameObject, secondSpeaker: GameObject): boolean => {
  return !getExtern<AnyCallable>("actor_has_artefact", getExtern("dialogs_zaton"))(firstSpeaker, secondSpeaker)(
    firstSpeaker,
    secondSpeaker
  );
});

/**
 * Reward the actor with random money and treasure coordinates for the bandit outcome.
 *
 */
extern("dialogs_zaton.zat_b7_give_bandit_reward_to_actor", (): void => {
  giveMoneyToActor(math.random(15, 30) * 100);
  getManager(TreasureManager).giveActorTreasureCoordinates("zat_hiding_place_30");
});

/**
 * Reward the actor with a randomly chosen drug pack and treasure coordinates for the stalker outcome.
 *
 * @param firstSpeaker - First participant of the dialog (actor).
 * @param secondSpeaker - Second participant of the dialog (NPC).
 */
extern(
  "dialogs_zaton.zat_b7_give_stalker_reward_to_actor",
  (firstSpeaker: GameObject, secondSpeaker: GameObject): void => {
    const reward: TIndex = math.random(1, 3);

    if (reward === 1) {
      transferItemsToActor(getNpcSpeaker(firstSpeaker, secondSpeaker), drugs.bandage, 6);
      transferItemsToActor(getNpcSpeaker(firstSpeaker, secondSpeaker), food.vodka, 4);
    }

    if (reward === 2) {
      transferItemsToActor(getNpcSpeaker(firstSpeaker, secondSpeaker), drugs.medkit, 2);
      transferItemsToActor(getNpcSpeaker(firstSpeaker, secondSpeaker), food.vodka, 4);
    }

    if (reward === 3) {
      transferItemsToActor(getNpcSpeaker(firstSpeaker, secondSpeaker), drugs.antirad, 3);
      transferItemsToActor(getNpcSpeaker(firstSpeaker, secondSpeaker), food.vodka, 4);
    }

    TreasureManager.giveTreasureCoordinates("zat_hiding_place_29");
  }
);

/**
 * Reward the actor with a fixed drug pack for the second stalker outcome.
 *
 * @param firstSpeaker - First participant of the dialog (actor).
 * @param secondSpeaker - Second participant of the dialog (NPC).
 */
extern(
  "dialogs_zaton.zat_b7_give_stalker_reward_2_to_actor",
  (firstSpeaker: GameObject, secondSpeaker: GameObject): void => {
    transferItemsToActor(getNpcSpeaker(firstSpeaker, secondSpeaker), drugs.bandage, 4);
    transferItemsToActor(getNpcSpeaker(firstSpeaker, secondSpeaker), drugs.medkit, 2);
    transferItemsToActor(getNpcSpeaker(firstSpeaker, secondSpeaker), drugs.antirad, 2);
  }
);

/**
 * Rob the actor of a random share of their money in favor of the dialog NPC.
 *
 * @param firstSpeaker - First participant of the dialog (actor).
 * @param secondSpeaker - Second participant of the dialog (NPC).
 */
extern("dialogs_zaton.zat_b7_rob_actor", (firstSpeaker: GameObject, secondSpeaker: GameObject): void => {
  let amount: TCount = math.floor((registry.actor.money() * math.random(75, 100)) / 100);

  if (registry.actor.money() < amount) {
    amount = registry.actor.money();
  }

  transferMoneyFromActor(getNpcSpeaker(firstSpeaker, secondSpeaker), amount);
});

/**
 * Check whether the self-kill dialog branch is still available for the stalkers victims squad.
 *
 * @param firstSpeaker - First participant of the dialog (actor).
 * @param secondSpeaker - Second participant of the dialog (NPC).
 * @returns Whether the related info portions are unset and the victims squad story object no longer exists.
 */
extern("dialogs_zaton.zat_b7_killed_self_precond", (firstSpeaker: GameObject, secondSpeaker: GameObject): boolean => {
  if (
    hasInfoPortion(infoPortions.zat_b7_stalkers_raiders_meet) ||
    hasInfoPortion(infoPortions.zat_b7_victims_disappeared)
  ) {
    return false;
  }

  return !isStoryObjectExisting("zat_b7_stalkers_victims_1");
});

/**
 * Check whether the stalkers victims squad is still alive.
 *
 * @param firstSpeaker - First participant of the dialog (actor).
 * @param secondSpeaker - Second participant of the dialog (NPC).
 * @returns Whether the victims squad story object still exists.
 */
extern("dialogs_zaton.zat_b7_squad_alive", (firstSpeaker: GameObject, secondSpeaker: GameObject): boolean => {
  return isStoryObjectExisting("zat_b7_stalkers_victims_1");
});

/**
 * Transfer up to six food items from the actor to the NPC and notify about each relocation.
 *
 * @param firstSpeaker - First participant of the dialog (actor).
 * @param secondSpeaker - Second participant of the dialog (NPC).
 */
extern("dialogs_zaton.zat_b103_transfer_merc_supplies", (firstSpeaker: GameObject, secondSpeaker: GameObject): void => {
  const object: GameObject = getNpcSpeaker(firstSpeaker, secondSpeaker);
  const actor: GameObject = registry.actor;
  let it: TCount = 6;

  const newsManager: NotificationManager = getManager(NotificationManager);
  const itemSections: LuaArray<TFoodItem> = $fromArray<TFoodItem>([food.conserva, food.kolbasa, food.bread]);

  for (const [k, section] of itemSections) {
    const j: TCount = it;

    actor.iterate_inventory((temp, item) => {
      if (item.section() === section && it !== 0) {
        actor.transfer_item(item, object);
        it = it - 1;
      }
    }, actor);

    if (j - it !== 0) {
      newsManager.sendItemRelocatedNotification(ENotificationDirection.OUT, section, j - it);
    }
  }
});

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
  return !getExtern<AnyCallable>("zat_b33_counter_ge_2", getExtern("dialogs_zaton"))(firstSpeaker, secondSpeaker)(
    firstSpeaker,
    secondSpeaker
  );
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
 * Transfer the second mechanic toolkit from the actor to the dialog NPC.
 *
 * @param firstSpeaker - First participant of the dialog (actor).
 * @param secondSpeaker - Second participant of the dialog (NPC).
 */
extern(
  "dialogs_zaton.zat_b103_transfer_mechanic_toolkit_2",
  (firstSpeaker: GameObject, secondSpeaker: GameObject): void => {
    transferItemsFromActor(getNpcSpeaker(firstSpeaker, secondSpeaker), misc.toolkit_2);
  }
);

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
  return registry.actor.object(questItems.zat_b33_safe_container) !== null;
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

/**
 * Mapping of zat_b29 advanced task indices to their artefact sections.
 */
export const zatB29AfTable: LuaTable<TIndex, string> = $fromObject<TIndex, TSection>({
  [16]: artefacts.af_gravi,
  [17]: artefacts.af_eye,
  [18]: artefacts.af_baloon,
  [19]: artefacts.af_dummy_dummy,
  [20]: artefacts.af_gold_fish,
  [21]: artefacts.af_fire,
  [22]: artefacts.af_glass,
  [23]: artefacts.af_ice,
});

/**
 * Mapping of zat_b29 advanced task indices to their localized artefact name keys.
 */
export const zatB29AfNamesTable: LuaTable<TIndex, TName> = $fromObject<TIndex, TName>({
  [16]: "st_af_gravi_name",
  [17]: "st_af_eye_name",
  [18]: "st_af_baloon_name",
  [19]: "st_af_dummy_dummy_name",
  [20]: "st_af_gold_fish_name",
  [21]: "st_af_fire_name",
  [22]: "st_af_glass_name",
  [23]: "st_af_ice_name",
});

/**
 * Mapping of zat_b29 advanced task indices to their requested-artefact info portions.
 */
export const zatB29InfopTable: LuaTable<TIndex, TName> = $fromObject<TIndex, TName>({
  [16]: infoPortions.zat_b29_af_16,
  [17]: infoPortions.zat_b29_af_17,
  [18]: infoPortions.zat_b29_af_18,
  [19]: infoPortions.zat_b29_af_19,
  [20]: infoPortions.zat_b29_af_20,
  [21]: infoPortions.zat_b29_af_21,
  [22]: infoPortions.zat_b29_af_22,
  [23]: infoPortions.zat_b29_af_23,
});

/**
 * Mapping of zat_b29 advanced task indices to their bring-artefact info portion ids.
 */
export const zatB29InfopBringTable: LuaTable<TIndex, TStringId> = $fromObject<TIndex, TStringId>({
  [16]: "zat_b29_bring_af_16",
  [17]: "zat_b29_bring_af_17",
  [18]: "zat_b29_bring_af_18",
  [19]: "zat_b29_bring_af_19",
  [20]: "zat_b29_bring_af_20",
  [21]: "zat_b29_bring_af_21",
  [22]: "zat_b29_bring_af_22",
  [23]: "zat_b29_bring_af_23",
});

/**
 * Force-spawn the requested zat_b29 artefact in a randomly chosen anomaly zone of the matching type.
 *
 */
extern("dialogs_zaton.zat_b29_create_af_in_anomaly", (): void => {
  const anomTbl: LuaArray<string> = {
    [16]: "gravi",
    [17]: "thermal",
    [18]: "acid",
    [19]: "electra",
    [20]: "gravi",
    [21]: "thermal",
    [22]: "acid",
    [23]: "electra",
  } as unknown as LuaArray<string>;

  const anomaliesNamesTbl = {
    ["gravi"]: {
      [1]: "zat_b14_anomal_zone",
      [2]: "zat_b55_anomal_zone",
      [3]: "zat_b44_anomal_zone_gravi",
    },
    ["thermal"]: {
      [1]: "zat_b20_anomal_zone",
      [2]: "zat_b53_anomal_zone",
      [3]: "zaton_b56_anomal_zone",
    },
    ["acid"]: {
      [1]: "zat_b39_anomal_zone",
      [2]: "zat_b101_anomal_zone",
      [3]: "zat_b44_anomal_zone_acid",
    },
    ["electra"]: {
      [1]: "zat_b54_anomal_zone",
      [2]: "zat_b100_anomal_zone",
    },
  } as unknown as LuaTable<string, LuaArray<string>>;

  let zone: TSection = "";
  let key;

  for (const [k, v] of zatB29InfopBringTable) {
    if (hasInfoPortion(v)) {
      key = k;
      zone = anomTbl.get(key);
      break;
    }
  }

  const zoneName: TName = anomaliesNamesTbl.get(zone).get(math.random(1, anomaliesNamesTbl.get(zone).length()));

  registry.anomalyZones.get(zoneName).setForcedSpawnOverride(zatB29AfTable.get(key as number));
});

/**
 * Build the comma-separated list of advanced zat_b29 artefacts the actor is asked to bring.
 *
 * @param firstSpeaker - First participant of the dialog (actor).
 * @param secondSpeaker - Second participant of the dialog (NPC).
 * @returns Translated, comma-separated list of requested artefact names ending with a period.
 */
extern("dialogs_zaton.zat_b29_linker_give_adv_task", (firstSpeaker: GameObject, secondSpeaker: GameObject): string => {
  let result: string = "";
  let isFirst: boolean = true;

  for (const i of $range(16, 23)) {
    disableInfoPortion(zatB29InfopBringTable.get(i));
    if (hasInfoPortion(zatB29InfopTable.get(i))) {
      if (isFirst) {
        result = game.translate_string(zatB29AfNamesTable.get(i));
        isFirst = false;
      } else {
        result = result + ", " + game.translate_string(zatB29AfNamesTable.get(i));
      }
    }
  }

  return result + ".";
});

/**
 * Check whether the actor is missing every requested advanced zat_b29 artefact.
 *
 * @param firstSpeaker - First participant of the dialog (actor).
 * @param secondSpeaker - Second participant of the dialog (NPC).
 * @returns Whether the actor does not carry any of the currently requested advanced artefacts.
 */
extern(
  "dialogs_zaton.zat_b29_actor_do_not_has_adv_task_af",
  (firstSpeaker: GameObject, secondSpeaker: GameObject): boolean => {
    for (const i of $range(16, 23)) {
      if (hasInfoPortion(zatB29InfopBringTable.get(i)) && registry.actor.object(zatB29AfTable.get(i))) {
        return false;
      }
    }

    return true;
  }
);

/**
 * Check whether the actor carries any requested advanced zat_b29 artefact.
 *
 * @param firstSpeaker - First participant of the dialog (actor).
 * @param secondSpeaker - Second participant of the dialog (NPC).
 * @returns Whether the actor owns at least one of the currently requested advanced artefacts.
 */
extern(
  "dialogs_zaton.zat_b29_actor_has_adv_task_af",
  (firstSpeaker: GameObject, secondSpeaker: GameObject): boolean => {
    for (const i of $range(16, 23)) {
      if (hasInfoPortion(zatB29InfopBringTable.get(i)) && registry.actor.object(zatB29AfTable.get(i))) {
        return true;
      }
    }

    return false;
  }
);

/**
 * Take the requested advanced zat_b29 artefact from the actor and pay the matching reward.
 *
 * @param firstSpeaker - First participant of the dialog (actor).
 * @param secondSpeaker - Second participant of the dialog (NPC).
 */
extern("dialogs_zaton.zat_b29_linker_get_adv_task_af", (firstSpeaker: GameObject, secondSpeaker: GameObject): void => {
  for (const i of $range(16, 23)) {
    if (hasInfoPortion(zatB29InfopBringTable.get(i))) {
      disableInfoPortion("zat_b29_adv_task_given");
      transferItemsFromActor(getNpcSpeaker(firstSpeaker, secondSpeaker), zatB29AfTable.get(i));
      if (i < 20) {
        if (hasInfoPortion("zat_b29_linker_take_af_from_rival")) {
          giveMoneyToActor(12000);
        } else {
          giveMoneyToActor(18000);
        }
      } else if (i > 19) {
        if (hasInfoPortion("zat_b29_linker_take_af_from_rival")) {
          giveMoneyToActor(18000);
        } else {
          giveMoneyToActor(24000);
        }
      }

      break;
    }
  }
});

/**
 * Collect the sections of valuable weapons present in the given object inventory.
 *
 * @param object - Game object whose inventory is scanned for valuable weapons.
 * @returns Array of valuable weapon sections found in the inventory.
 */
export function getGoodGunsInInventory(object: GameObject): LuaArray<TWeapon> {
  const actorWpnTable: LuaArray<TWeapon> = new LuaTable();
  const wpnTable = [
    weapons.wpn_sig550,
    weapons.wpn_g36,
    weapons.wpn_val,
    weapons.wpn_groza,
    weapons.wpn_vintorez,
    weapons.wpn_fn2000,
  ] as unknown as LuaArray<TWeapon>;

  object.iterate_inventory((owner: GameObject, item: GameObject): void => {
    const section: TSection = item.section();

    for (const [k, v] of wpnTable) {
      if (section === v) {
        table.insert(actorWpnTable, v);
        break;
      }
    }
  }, object);

  return actorWpnTable;
}

/**
 * Pick a good gun from the actor inventory for the zat_b29 exchange and remember it on the actor.
 *
 * @returns Whether a suitable weapon for exchange was found on the actor.
 */
extern("dialogs_zaton.zat_b29_actor_has_exchange_item", (): boolean => {
  const actor: GameObject = registry.actor;
  const actorWeaponsTable: LuaArray<TWeapon> = getGoodGunsInInventory(actor);

  if (actorWeaponsTable.length() > 0) {
    (actor as AnyObject).goodGun = table.random(actorWeaponsTable)[1];
  }

  return (actor as AnyObject).goodGun !== null;
});

/**
 * Exchange the actor remembered good gun for the requested advanced zat_b29 artefact.
 *
 * @param firstSpeaker - First participant of the dialog (actor).
 * @param secondSpeaker - Second participant of the dialog (NPC).
 */
extern("dialogs_zaton.zat_b29_actor_exchange", (firstSpeaker: GameObject, secondSpeaker: GameObject): void => {
  const actor: GameObject = registry.actor;

  for (const i of $range(16, 23)) {
    if (hasInfoPortion(zatB29InfopBringTable.get(i))) {
      if ((actor as AnyObject).goodGun !== null) {
        transferItemsFromActor(getNpcSpeaker(firstSpeaker, secondSpeaker), (actor as AnyObject).goodGun);
        transferItemsToActor(getNpcSpeaker(firstSpeaker, secondSpeaker), zatB29AfTable.get(i));

        (actor as AnyObject).goodGun = null;
        break;
      }
    }
  }
});

/**
 * Reward the actor with accumulated daily percent money and reset the day counter.
 *
 * @param firstSpeaker - First participant of the dialog (actor).
 * @param secondSpeaker - Second participant of the dialog (NPC).
 */
extern("dialogs_zaton.zat_b30_transfer_percent", (firstSpeaker: GameObject, secondSpeaker: GameObject): void => {
  const amount: TCount = math.random(5, 25) * 100;
  const days: TCount = getPortableStoreValue(ACTOR_ID, "zat_b30_days_cnt", 0);

  giveMoneyToActor(amount * days);
  setPortableStoreValue(ACTOR_ID, "zat_b30_days_cnt", 0);
});

/**
 * Check whether the dialog NPC carries a scientific detector.
 *
 * @param firstSpeaker - First participant of the dialog (actor).
 * @param secondSpeaker - Second participant of the dialog (NPC).
 * @returns Whether the NPC speaker owns the scientific detector.
 */
extern("dialogs_zaton.zat_b30_npc_has_detector", (firstSpeaker: GameObject, secondSpeaker: GameObject): boolean => {
  return objectHasItem(getNpcSpeaker(firstSpeaker, secondSpeaker), detectors.detector_scientific);
});

/**
 * Give a scientific detector from the NPC to the actor as the second exchange step.
 *
 * @param firstSpeaker - First participant of the dialog (actor).
 * @param secondSpeaker - Second participant of the dialog (NPC).
 */
extern("dialogs_zaton.zat_b30_actor_second_exchange", (firstSpeaker: GameObject, secondSpeaker: GameObject): void => {
  transferItemsToActor(getNpcSpeaker(firstSpeaker, secondSpeaker), detectors.detector_scientific);
});

/**
 * Exchange the actor good gun for a scientific detector and mark the matching rival info portion.
 *
 * @param firstSpeaker - First participant of the dialog (actor).
 * @param secondSpeaker - Second participant of the dialog (NPC).
 */
extern("dialogs_zaton.zat_b30_actor_exchange", (firstSpeaker: GameObject, secondSpeaker: GameObject): void => {
  const actor: GameObject = registry.actor;

  if ((actor as AnyObject).goodGun !== null) {
    transferItemsFromActor(getNpcSpeaker(firstSpeaker, secondSpeaker), (actor as AnyObject).goodGun);
    transferItemsToActor(getNpcSpeaker(firstSpeaker, secondSpeaker), detectors.detector_scientific);
    (actor as AnyObject).goodGun = null;
  }

  if (isObjectName(secondSpeaker, "zat_b29_stalker_rival_1")) {
    giveInfoPortion(infoPortions.zat_b30_rival_1_wo_detector);
  } else if (isObjectName(secondSpeaker, "zat_b29_stalker_rival_2")) {
    giveInfoPortion(infoPortions.zat_b30_rival_2_wo_detector);
  }
});

/**
 * Check whether the actor carries more than one scientific detector.
 *
 * @param firstSpeaker - First participant of the dialog (actor).
 * @param secondSpeaker - Second participant of the dialog (NPC).
 * @returns Whether the actor owns at least two scientific detectors.
 */
extern(
  "dialogs_zaton.zat_b30_actor_has_two_detectors",
  (firstSpeaker: GameObject, secondSpeaker: GameObject): boolean => {
    const actor: GameObject = registry.actor;
    let cnt: number = 0;

    actor.iterate_inventory((object, item) => {
      if (item.section() === detectors.detector_scientific) {
        cnt = cnt + 1;
      }
    }, actor);

    return cnt > 1;
  }
);

/**
 * Check whether the actor owns at least one nimble weapon variant.
 *
 * @param firstSpeaker - First participant of the dialog (actor).
 * @param secondSpeaker - Second participant of the dialog (NPC).
 * @returns Whether the actor carries any of the known nimble weapons.
 */
extern("dialogs_zaton.actor_has_nimble_weapon", (firstSpeaker: GameObject, secondSpeaker: GameObject): boolean => {
  return actorHasAtLeastOneItem([
    weapons.wpn_groza_nimble,
    weapons.wpn_vintorez_nimble,
    weapons.wpn_desert_eagle_nimble,
    weapons.wpn_fn2000_nimble,
    weapons.wpn_g36_nimble,
    weapons.wpn_protecta_nimble,
    weapons.wpn_mp5_nimble,
    weapons.wpn_sig220_nimble,
    weapons.wpn_spas12_nimble,
    weapons.wpn_svu_nimble,
    weapons.wpn_svd_nimble,
  ]);
});

/**
 * Rob the actor of a random money share and all listed weapons in favor of the dialog NPC.
 *
 * @param firstSpeaker - First participant of the dialog (actor).
 * @param secondSpeaker - Second participant of the dialog (NPC).
 */
extern("dialogs_zaton.zat_b51_robbery", (firstSpeaker: GameObject, secondSpeaker: GameObject): void => {
  const actor: GameObject = registry.actor;
  let amount: number = math.floor((actor.money() * math.random(35, 50)) / 100);

  if (amount > actor.money()) {
    amount = actor.money();
  }

  const needItem = {
    [weapons.wpn_usp]: true,
    [weapons.wpn_desert_eagle]: true,
    [weapons.wpn_protecta]: true,
    [weapons.wpn_sig550]: true,
    [weapons.wpn_fn2000]: true,
    [weapons.wpn_g36]: true,
    [weapons.wpn_val]: true,
    [weapons.wpn_vintorez]: true,
    [weapons.wpn_groza]: true,
    [weapons.wpn_svd]: true,
    [weapons.wpn_svu]: true,
    [weapons.wpn_pkm]: true,
    [weapons.wpn_sig550_luckygun]: true,
    [weapons.wpn_pkm_zulus]: true,
    [weapons.wpn_wincheaster1300_trapper]: true,
    [weapons.wpn_gauss]: true,
    [weapons.wpn_groza_nimble]: true,
    [weapons.wpn_desert_eagle_nimble]: true,
    [weapons.wpn_fn2000_nimble]: true,
    [weapons.wpn_g36_nimble]: true,
    [weapons.wpn_protecta_nimble]: true,
    [weapons.wpn_mp5_nimble]: true,
    [weapons.wpn_sig220_nimble]: true,
    [weapons.wpn_spas12_nimble]: true,
    [weapons.wpn_usp_nimble]: true,
    [weapons.wpn_vintorez_nimble]: true,
    [weapons.wpn_svu_nimble]: true,
    [weapons.wpn_svd_nimble]: true,
  } as unknown as LuaSet<TWeapon>;

  for (const k of needItem) {
    if (actor.object(k) !== null) {
      transferItemsFromActor(getNpcSpeaker(firstSpeaker, secondSpeaker), k, "all");
    }
  }

  transferMoneyFromActor(getNpcSpeaker(firstSpeaker, secondSpeaker), amount);
});

/**
 * Take a nimble weapon from the actor, preferring an equipped slot then a random owned one.
 *
 * @param firstSpeaker - First participant of the dialog (actor).
 * @param secondSpeaker - Second participant of the dialog (NPC).
 */
extern("dialogs_zaton.zat_b51_rob_nimble_weapon", (firstSpeaker: GameObject, secondSpeaker: GameObject): void => {
  const actor: GameObject = registry.actor;
  const actorHasItem: LuaArray<TWeapon> = new LuaTable();
  const needItem = {
    [weapons.wpn_groza_nimble]: true,
    [weapons.wpn_desert_eagle_nimble]: true,
    [weapons.wpn_fn2000_nimble]: true,
    [weapons.wpn_g36_nimble]: true,
    [weapons.wpn_protecta_nimble]: true,
    [weapons.wpn_mp5_nimble]: true,
    [weapons.wpn_sig220_nimble]: true,
    [weapons.wpn_spas12_nimble]: true,
    [weapons.wpn_usp_nimble]: true,
    [weapons.wpn_vintorez_nimble]: true,
    [weapons.wpn_svu_nimble]: true,
    [weapons.wpn_svd_nimble]: true,
  } as unknown as LuaSet<TWeapon>;

  for (const k of needItem) {
    if (actor.object(k) !== null) {
      table.insert(actorHasItem, k);
    }

    if (actor.item_in_slot(2) !== null && actor.item_in_slot(2)!.section() === k) {
      transferItemsFromActor(getNpcSpeaker(firstSpeaker, secondSpeaker), k);

      return;
    } else if (actor.item_in_slot(3) !== null && actor.item_in_slot(3)!.section() === k) {
      transferItemsFromActor(getNpcSpeaker(firstSpeaker, secondSpeaker), k);

      return;
    }
  }

  if (actorHasItem.length() > 0) {
    transferItemsFromActor(getNpcSpeaker(firstSpeaker, secondSpeaker), table.random(actorHasItem)[1]);
  }
});

/**
 * Give the compass artefact from the NPC to the actor.
 *
 * @param firstSpeaker - First participant of the dialog (actor).
 * @param secondSpeaker - Second participant of the dialog (NPC).
 */
extern("dialogs_zaton.give_compass_to_actor", (firstSpeaker: GameObject, secondSpeaker: GameObject): void => {
  transferItemsToActor(getNpcSpeaker(firstSpeaker, secondSpeaker), artefacts.af_compass);
});

const itemCountByCategory: LuaArray<TCount> = $fromArray([3, 3, 3, 3, 1, 1, 1]);

const zatB51CostsTable: LuaArray<{ prepayAgreed: number; prepayRefused: number; cost: number }> = $fromArray([
  { prepayAgreed: 700, prepayRefused: 1400, cost: 2800 },
  { prepayAgreed: 2000, prepayRefused: 4000, cost: 8000 },
  { prepayAgreed: 4000, prepayRefused: 8000, cost: 16000 },
  { prepayAgreed: 4000, prepayRefused: 8000, cost: 16000 },
  { prepayAgreed: 8000, prepayRefused: 16000, cost: 32000 },
  { prepayAgreed: 6000, prepayRefused: 12000, cost: 24000 },
  { prepayAgreed: 12000, prepayRefused: 24000, cost: 48000 },
]);

const zatB51BuyItemTable = [
  [
    { item: [weapons.wpn_desert_eagle_nimble] },
    { item: [weapons.wpn_sig220_nimble] },
    { item: [weapons.wpn_usp_nimble] },
  ],
  [{ item: [weapons.wpn_mp5_nimble] }, { item: [weapons.wpn_spas12_nimble] }, { item: [weapons.wpn_protecta_nimble] }],
  [{ item: [weapons.wpn_groza_nimble] }, { item: [weapons.wpn_g36_nimble] }, { item: [weapons.wpn_fn2000_nimble] }],
  [{ item: [weapons.wpn_vintorez_nimble] }, { item: [weapons.wpn_svu_nimble] }, { item: [weapons.wpn_svd_nimble] }],
  [{ item: [helmets.helm_tactic, outfits.cs_heavy_outfit] }],
  [{ item: [outfits.scientific_outfit] }],
  [{ item: [outfits.exo_outfit] }],
] as unknown as LuaArray<LuaArray<{ item: LuaArray<TWeapon> }>>;

/**
 * For each processing category, randomly select one not yet ordered item and mark it as ordered.
 *
 * @param firstSpeaker - First participant of the dialog (actor).
 * @param secondSpeaker - Second participant of the dialog (NPC).
 */
extern("dialogs_zaton.zat_b51_randomize_item", (firstSpeaker: GameObject, secondSpeaker: GameObject): void => {
  for (const it of $range(1, 7)) {
    if (hasInfoPortion(("zat_b51_processing_category_" + tostring(it)) as TInfoPortion)) {
      const zatB51AvailableItemsTable: LuaArray<TCount> = new LuaTable();

      for (const j of $range(1, itemCountByCategory.get(it))) {
        if (!hasInfoPortion(("zat_b51_done_item_" + tostring(it) + "_" + tostring(j)) as TInfoPortion)) {
          table.insert(zatB51AvailableItemsTable, j);
        }
      }

      giveInfoPortion(
        ("zat_b51_ordered_item_" +
          tostring(it) +
          "_" +
          tostring(zatB51AvailableItemsTable.get(math.random(1, zatB51AvailableItemsTable.length())))) as TInfoPortion
      );
    }
  }
});

/**
 * Transfer the prepay amount for the active order category from the actor to the NPC.
 *
 * @param firstSpeaker - First participant of the dialog (actor).
 * @param secondSpeaker - Second participant of the dialog (NPC).
 */
extern("dialogs_zaton.zat_b51_give_prepay", (firstSpeaker: GameObject, secondSpeaker: GameObject): void => {
  for (const it of $range(1, 7)) {
    if (hasInfoPortion(("zat_b51_processing_category_" + tostring(it)) as TInfoPortion)) {
      if (!hasInfoPortion(infoPortions.zat_b51_order_refused)) {
        return transferMoneyFromActor(
          getNpcSpeaker(firstSpeaker, secondSpeaker),
          zatB51CostsTable.get(it).prepayAgreed
        );
      }

      return transferMoneyFromActor(getNpcSpeaker(firstSpeaker, secondSpeaker), zatB51CostsTable.get(it).prepayRefused);
    }
  }
});

/**
 * Check whether the actor can afford the prepay for the active order category.
 *
 * @param firstSpeaker - First participant of the dialog (actor).
 * @param secondSpeaker - Second participant of the dialog (NPC).
 * @returns Whether the actor money is enough for the agreed or refused prepay of the active category.
 */
extern("dialogs_zaton.zat_b51_has_prepay", (firstSpeaker: GameObject, secondSpeaker: GameObject): boolean => {
  const actor: GameObject = registry.actor;

  for (const it of $range(1, 7)) {
    if (hasInfoPortion(("zat_b51_processing_category_" + tostring(it)) as TInfoPortion)) {
      if (!hasInfoPortion(infoPortions.zat_b51_order_refused)) {
        return actor.money() >= zatB51CostsTable.get(it).prepayAgreed;
      }

      return actor.money() >= zatB51CostsTable.get(it).prepayRefused;
    }
  }

  return false;
});

/**
 * Check whether the actor cannot afford the prepay for the active order category.
 *
 * @param firstSpeaker - First participant of the dialog (actor).
 * @param secondSpeaker - Second participant of the dialog (NPC).
 * @returns Whether the actor money is below the required prepay for the active category.
 */
extern("dialogs_zaton.zat_b51_hasnt_prepay", (firstSpeaker: GameObject, secondSpeaker: GameObject): boolean => {
  return !getExtern<AnyCallable>("zat_b51_has_prepay", getExtern("dialogs_zaton"))(firstSpeaker, secondSpeaker);
});

/**
 * Complete the active order: give the ordered item, take its cost and update order info portions.
 *
 * @param firstSpeaker - First participant of the dialog (actor).
 * @param secondSpeaker - Second participant of the dialog (NPC).
 */
extern("dialogs_zaton.zat_b51_buy_item", (firstSpeaker: GameObject, secondSpeaker: GameObject): void => {
  for (const it of $range(1, 7)) {
    if (hasInfoPortion(("zat_b51_processing_category_" + tostring(it)) as TInfoPortion)) {
      for (const j of $range(1, zatB51BuyItemTable.get(it).length())) {
        if (hasInfoPortion(("zat_b51_ordered_item_" + tostring(it) + "_" + tostring(j)) as TInfoPortion)) {
          for (const [k, v] of zatB51BuyItemTable.get(it).get(j).item) {
            transferItemsToActor(getNpcSpeaker(firstSpeaker, secondSpeaker), v);
          }

          transferMoneyFromActor(getNpcSpeaker(firstSpeaker, secondSpeaker), zatB51CostsTable.get(it).cost);
          disableInfoPortion(("zat_b51_processing_category_" + tostring(it)) as TInfoPortion);
          disableInfoPortion(("zat_b51_ordered_item_" + tostring(it) + "_" + tostring(j)) as TInfoPortion);
          giveInfoPortion(("zat_b51_done_item_" + tostring(it) + "_" + tostring(j)) as TInfoPortion);
          break;
        }
      }

      let categoryFinishing: boolean = true;

      for (const j of $range(1, zatB51BuyItemTable.get(it).length())) {
        if (!hasInfoPortion(("zat_b51_done_item_" + tostring(it) + "_" + tostring(j)) as TInfoPortion)) {
          categoryFinishing = false;
          break;
        }
      }

      if (categoryFinishing) {
        giveInfoPortion(("zat_b51_finishing_category_" + tostring(it)) as TInfoPortion);
      }

      return;
    }
  }
});

/**
 * Refuse the active ordered item and update the related order info portions.
 *
 * @param firstSpeaker - First participant of the dialog (actor).
 * @param secondSpeaker - Second participant of the dialog (NPC).
 */
extern("dialogs_zaton.zat_b51_refuse_item", (firstSpeaker: GameObject, secondSpeaker: GameObject): void => {
  for (const i of $range(1, 7)) {
    if (hasInfoPortion(("zat_b51_processing_category_" + tostring(i)) as TInfoPortion)) {
      for (const j of $range(1, zatB51BuyItemTable.get(i).length())) {
        if (hasInfoPortion(("zat_b51_ordered_item_" + tostring(i) + "_" + tostring(j)) as TInfoPortion)) {
          disableInfoPortion(("zat_b51_processing_category_" + tostring(i)) as TInfoPortion);
          disableInfoPortion(("zat_b51_ordered_item_" + tostring(i) + "_" + tostring(j)) as TInfoPortion);
          giveInfoPortion(("zat_b51_done_item_" + tostring(i) + "_" + tostring(j)) as TInfoPortion);
          break;
        }
      }

      let categoryFinishing: boolean = true;

      for (const j of $range(1, zatB51BuyItemTable.get(i).length())) {
        if (!hasInfoPortion(("zat_b51_done_item_" + tostring(i) + "_" + tostring(j)) as TInfoPortion)) {
          categoryFinishing = false;
          break;
        }
      }

      if (categoryFinishing === true) {
        giveInfoPortion(("zat_b51_finishing_category_" + tostring(i)) as TInfoPortion);
      }

      return;
    }
  }
});

/**
 * Check whether the actor can afford the full cost of the active order category.
 *
 * @param firstSpeaker - First participant of the dialog (actor).
 * @param secondSpeaker - Second participant of the dialog (NPC).
 * @returns Whether the actor money is enough to pay the cost of the active category.
 */
extern("dialogs_zaton.zat_b51_has_item_cost", (firstSpeaker: GameObject, secondSpeaker: GameObject): boolean => {
  const actor: GameObject = registry.actor;

  for (const i of $range(1, 7)) {
    if (hasInfoPortion(("zat_b51_processing_category_" + tostring(i)) as TInfoPortion)) {
      return actor.money() >= zatB51CostsTable.get(i).cost;
    }
  }

  return false;
});

/**
 * Check whether the actor cannot afford the full cost of the active order category.
 *
 * @param firstSpeaker - First participant of the dialog (actor).
 * @param secondSpeaker - Second participant of the dialog (NPC).
 * @returns Whether the actor money is below the cost of the active category.
 */
extern("dialogs_zaton.zat_b51_hasnt_item_cost", (firstSpeaker: GameObject, secondSpeaker: GameObject): boolean => {
  return !getExtern<AnyCallable>("zat_b51_has_item_cost", getExtern("dialogs_zaton"))(firstSpeaker, secondSpeaker);
});

/**
 * Check whether the actor carries any of the zat_b12 documents.
 *
 * @param firstSpeaker - First participant of the dialog (actor).
 * @param secondSpeaker - Second participant of the dialog (NPC).
 * @returns Whether the actor owns at least one of the zat_b12 documents.
 */
extern("dialogs_zaton.zat_b12_actor_have_documents", (firstSpeaker: GameObject, secondSpeaker: GameObject): boolean => {
  return actorHasAtLeastOneItem([questItems.zat_b12_documents_1, questItems.zat_b12_documents_2]);
});

/**
 * Take the zat_b12 documents from the actor and pay a price based on the document types and count.
 *
 * @param firstSpeaker - First participant of the dialog (actor).
 * @param secondSpeaker - Second participant of the dialog (NPC).
 * @returns Always false so that the dialog phrase is not auto-closed by the condition.
 */
extern(
  "dialogs_zaton.zat_b12_actor_transfer_documents",
  (firstSpeaker: GameObject, secondSpeaker: GameObject): boolean => {
    const object: GameObject = getNpcSpeaker(firstSpeaker, secondSpeaker);
    const actor: GameObject = registry.actor;

    const amountDoc1: TCount = 1000;
    const amountDoc2: TCount = 600;
    const amountDoc3: TCount = 400;

    let amountTotal: TCount = 0;
    let cnt: TCount = 0;
    let cnt2: TCount = 0;

    if (actor.object(questItems.zat_b12_documents_1) !== null) {
      transferItemsFromActor(getNpcSpeaker(firstSpeaker, secondSpeaker), questItems.zat_b12_documents_1);
      giveInfoPortion(infoPortions.zat_b12_documents_sold_1);
      amountTotal = amountTotal + amountDoc1;
    }

    object.iterate_inventory((temp, item) => {
      if (item.section() === questItems.zat_b12_documents_2) {
        cnt = cnt + 1;
      }
    }, object);

    actor.iterate_inventory((temp, item) => {
      if (item.section() === questItems.zat_b12_documents_2) {
        cnt2 = cnt2 + 1;
      }
    }, actor);

    if (actor.object(questItems.zat_b12_documents_2) !== null) {
      if (cnt < 1) {
        amountTotal = amountTotal + amountDoc2;

        if (cnt2 > 1) {
          amountTotal = amountTotal + amountDoc3 * (cnt2 - 1);
          giveInfoPortion(infoPortions.zat_b12_documents_sold_2);
        }
      } else {
        amountTotal = amountTotal + amountDoc3 * cnt2;
        giveInfoPortion(infoPortions.zat_b12_documents_sold_3);
      }

      transferItemsFromActor(getNpcSpeaker(firstSpeaker, secondSpeaker), questItems.zat_b12_documents_2, cnt2);
    }

    giveMoneyToActor(amountTotal);

    return false;
  }
);

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

  return (actor as AnyObject).toolkit !== null;
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
  return registry.actor.object(misc.toolkit_1) !== null;
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
  return registry.actor.object(misc.toolkit_2) !== null;
});

/**
 * Check whether the way-to-Pripyat counter exceeds three.
 *
 * @param firstSpeaker - First participant of the dialog (actor).
 * @param secondSpeaker - Second participant of the dialog (NPC).
 * @returns Whether the stored way-to-Pripyat counter is greater than three.
 */
extern("dialogs_zaton.zat_b215_counter_greater_3", (firstSpeaker: GameObject, secondSpeaker: GameObject): boolean => {
  return getPortableStoreValue(ACTOR_ID, "zat_a9_way_to_pripyat_counter", 0 as number) > 3;
});

/**
 * Sell the zat_b40 notebook to the NPC, reward money and mark the sale info portion.
 *
 * @param firstSpeaker - First participant of the dialog (actor).
 * @param secondSpeaker - Second participant of the dialog (NPC).
 */
extern("dialogs_zaton.zat_b40_transfer_notebook", (firstSpeaker: GameObject, secondSpeaker: GameObject): void => {
  transferItemsFromActor(getNpcSpeaker(firstSpeaker, secondSpeaker), questItems.zat_b40_notebook);
  giveInfoPortion(infoPortions.zat_b40_notebook_saled);
  giveMoneyToActor(2000);
});

/**
 * Sell the first zat_b40 mercenary PDA, reward money and mark completion if all items are sold.
 *
 * @param firstSpeaker - First participant of the dialog (actor).
 * @param secondSpeaker - Second participant of the dialog (NPC).
 */
extern("dialogs_zaton.zat_b40_transfer_merc_pda_1", (firstSpeaker: GameObject, secondSpeaker: GameObject): void => {
  transferItemsFromActor(getNpcSpeaker(firstSpeaker, secondSpeaker), questItems.zat_b40_pda_1);
  giveInfoPortion(infoPortions.zat_b40_pda_1_saled);
  giveMoneyToActor(1000);

  if (
    hasInfoPortion(infoPortions.zat_b40_notebook_saled) &&
    hasInfoPortion(infoPortions.zat_b40_pda_1_saled) &&
    hasInfoPortion(infoPortions.zat_b40_pda_2_saled)
  ) {
    giveInfoPortion(infoPortions.zat_b40_all_item_saled);
  }
});

/**
 * Sell the second zat_b40 mercenary PDA, reward money and mark completion if all items are sold.
 *
 * @param firstSpeaker - First participant of the dialog (actor).
 * @param secondSpeaker - Second participant of the dialog (NPC).
 */
extern("dialogs_zaton.zat_b40_transfer_merc_pda_2", (firstSpeaker: GameObject, secondSpeaker: GameObject): void => {
  transferItemsFromActor(getNpcSpeaker(firstSpeaker, secondSpeaker), questItems.zat_b40_pda_2);
  giveInfoPortion(infoPortions.zat_b40_pda_2_saled);
  giveMoneyToActor(1_000);

  if (
    hasInfoPortion(infoPortions.zat_b40_notebook_saled) &&
    hasInfoPortion(infoPortions.zat_b40_pda_1_saled) &&
    hasInfoPortion(infoPortions.zat_b40_pda_2_saled)
  ) {
    giveInfoPortion(infoPortions.zat_b40_all_item_saled);
  }
});

/**
 * Check whether the first advanced artefact is requested but missing from the actor.
 *
 * @param firstSpeaker - First participant of the dialog (actor).
 * @param secondSpeaker - Second participant of the dialog (NPC).
 * @returns Whether the corresponding info portion is set and the actor lacks the first artefact.
 */
extern(
  "dialogs_zaton.zat_b29_actor_do_not_has_adv_task_af_1",
  (firstSpeaker: GameObject, secondSpeaker: GameObject): boolean => {
    return hasInfoPortion(zatB29InfopTable.get(16)) && !registry.actor.object(zatB29AfTable.get(16));
  }
);

/**
 * Check whether the second advanced artefact is requested but missing from the actor.
 *
 * @param firstSpeaker - First participant of the dialog (actor).
 * @param secondSpeaker - Second participant of the dialog (NPC).
 * @returns Whether the corresponding info portion is set and the actor lacks the second artefact.
 */
extern(
  "dialogs_zaton.zat_b29_actor_do_not_has_adv_task_af_2",
  (firstSpeaker: GameObject, secondSpeaker: GameObject): boolean => {
    return hasInfoPortion(zatB29InfopTable.get(17)) && !registry.actor.object(zatB29AfTable.get(17));
  }
);

/**
 * Check whether the third advanced artefact is requested but missing from the actor.
 *
 * @param firstSpeaker - First participant of the dialog (actor).
 * @param secondSpeaker - Second participant of the dialog (NPC).
 * @returns Whether the corresponding info portion is set and the actor lacks the third artefact.
 */
extern(
  "dialogs_zaton.zat_b29_actor_do_not_has_adv_task_af_3",
  (firstSpeaker: GameObject, secondSpeaker: GameObject): boolean => {
    return hasInfoPortion(zatB29InfopTable.get(18)) && !registry.actor.object(zatB29AfTable.get(18));
  }
);

/**
 * Check whether the fourth advanced artefact is requested but missing from the actor.
 *
 * @param firstSpeaker - First participant of the dialog (actor).
 * @param secondSpeaker - Second participant of the dialog (NPC).
 * @returns Whether the corresponding info portion is set and the actor lacks the fourth artefact.
 */
extern(
  "dialogs_zaton.zat_b29_actor_do_not_has_adv_task_af_4",
  (firstSpeaker: GameObject, secondSpeaker: GameObject): boolean => {
    return hasInfoPortion(zatB29InfopTable.get(19)) && !registry.actor.object(zatB29AfTable.get(19));
  }
);

/**
 * Check whether the fifth advanced artefact is requested but missing from the actor.
 *
 * @param firstSpeaker - First participant of the dialog (actor).
 * @param secondSpeaker - Second participant of the dialog (NPC).
 * @returns Whether the corresponding info portion is set and the actor lacks the fifth artefact.
 */
extern(
  "dialogs_zaton.zat_b29_actor_do_not_has_adv_task_af_5",
  (firstSpeaker: GameObject, secondSpeaker: GameObject): boolean => {
    return hasInfoPortion(zatB29InfopTable.get(20)) && !registry.actor.object(zatB29AfTable.get(20));
  }
);

/**
 * Check whether the sixth advanced artefact is requested but missing from the actor.
 *
 * @param firstSpeaker - First participant of the dialog (actor).
 * @param secondSpeaker - Second participant of the dialog (NPC).
 * @returns Whether the corresponding info portion is set and the actor lacks the sixth artefact.
 */
extern(
  "dialogs_zaton.zat_b29_actor_do_not_has_adv_task_af_6",
  (firstSpeaker: GameObject, secondSpeaker: GameObject): boolean => {
    return hasInfoPortion(zatB29InfopTable.get(21)) && !registry.actor.object(zatB29AfTable.get(21));
  }
);

/**
 * Check whether the seventh advanced artefact is requested but missing from the actor.
 *
 * @param firstSpeaker - First participant of the dialog (actor).
 * @param secondSpeaker - Second participant of the dialog (NPC).
 * @returns Whether the corresponding info portion is set and the actor lacks the seventh artefact.
 */
extern(
  "dialogs_zaton.zat_b29_actor_do_not_has_adv_task_af_7",
  (firstSpeaker: GameObject, secondSpeaker: GameObject): boolean => {
    return hasInfoPortion(zatB29InfopTable.get(22)) && !registry.actor.object(zatB29AfTable.get(22));
  }
);

/**
 * Check whether the eighth advanced artefact is requested but missing from the actor.
 *
 * @param firstSpeaker - First participant of the dialog (actor).
 * @param secondSpeaker - Second participant of the dialog (NPC).
 * @returns Whether the corresponding info portion is set and the actor lacks the eighth artefact.
 */
extern(
  "dialogs_zaton.zat_b29_actor_do_not_has_adv_task_af_8",
  (firstSpeaker: GameObject, secondSpeaker: GameObject): boolean => {
    return hasInfoPortion(zatB29InfopTable.get(23)) && !registry.actor.object(zatB29AfTable.get(23));
  }
);

/**
 * Check whether the first advanced artefact is requested and carried by the actor.
 *
 * @param firstSpeaker - First participant of the dialog (actor).
 * @param secondSpeaker - Second participant of the dialog (NPC).
 * @returns Whether the corresponding info portion is set and the actor owns the first artefact.
 */
extern(
  "dialogs_zaton.zat_b29_actor_has_adv_task_af_1",
  (firstSpeaker: GameObject, secondSpeaker: GameObject): boolean => {
    return hasInfoPortion(zatB29InfopTable.get(16)) && registry.actor.object(zatB29AfTable.get(16)) !== null;
  }
);

/**
 * Check whether the second advanced artefact is requested and carried by the actor.
 *
 * @param firstSpeaker - First participant of the dialog (actor).
 * @param secondSpeaker - Second participant of the dialog (NPC).
 * @returns Whether the corresponding info portion is set and the actor owns the second artefact.
 */
extern(
  "dialogs_zaton.zat_b29_actor_has_adv_task_af_2",
  (firstSpeaker: GameObject, secondSpeaker: GameObject): boolean => {
    return hasInfoPortion(zatB29InfopTable.get(17)) && registry.actor.object(zatB29AfTable.get(17)) !== null;
  }
);

/**
 * Check whether the third advanced artefact is requested and carried by the actor.
 *
 * @param firstSpeaker - First participant of the dialog (actor).
 * @param secondSpeaker - Second participant of the dialog (NPC).
 * @returns Whether the corresponding info portion is set and the actor owns the third artefact.
 */
extern(
  "dialogs_zaton.zat_b29_actor_has_adv_task_af_3",
  (firstSpeaker: GameObject, secondSpeaker: GameObject): boolean => {
    return hasInfoPortion(zatB29InfopTable.get(18)) && registry.actor.object(zatB29AfTable.get(18)) !== null;
  }
);

/**
 * Check whether the fourth advanced artefact is requested and carried by the actor.
 *
 * @param firstSpeaker - First participant of the dialog (actor).
 * @param secondSpeaker - Second participant of the dialog (NPC).
 * @returns Whether the corresponding info portion is set and the actor owns the fourth artefact.
 */
extern(
  "dialogs_zaton.zat_b29_actor_has_adv_task_af_4",
  (firstSpeaker: GameObject, secondSpeaker: GameObject): boolean => {
    return hasInfoPortion(zatB29InfopTable.get(19)) && registry.actor.object(zatB29AfTable.get(19)) !== null;
  }
);

/**
 * Check whether the fifth advanced artefact is requested and carried by the actor.
 *
 * @param firstSpeaker - First participant of the dialog (actor).
 * @param secondSpeaker - Second participant of the dialog (NPC).
 * @returns Whether the corresponding info portion is set and the actor owns the fifth artefact.
 */
extern(
  "dialogs_zaton.zat_b29_actor_has_adv_task_af_5",
  (firstSpeaker: GameObject, secondSpeaker: GameObject): boolean => {
    return hasInfoPortion(zatB29InfopTable.get(20)) && registry.actor.object(zatB29AfTable.get(20)) !== null;
  }
);

/**
 * Check whether the sixth advanced artefact is requested and carried by the actor.
 *
 * @param firstSpeaker - First participant of the dialog (actor).
 * @param secondSpeaker - Second participant of the dialog (NPC).
 * @returns Whether the corresponding info portion is set and the actor owns the sixth artefact.
 */
extern(
  "dialogs_zaton.zat_b29_actor_has_adv_task_af_6",
  (firstSpeaker: GameObject, secondSpeaker: GameObject): boolean => {
    return hasInfoPortion(zatB29InfopTable.get(21)) && registry.actor.object(zatB29AfTable.get(21)) !== null;
  }
);

/**
 * Check whether the seventh advanced artefact is requested and carried by the actor.
 *
 * @param firstSpeaker - First participant of the dialog (actor).
 * @param secondSpeaker - Second participant of the dialog (NPC).
 * @returns Whether the corresponding info portion is set and the actor owns the seventh artefact.
 */
extern(
  "dialogs_zaton.zat_b29_actor_has_adv_task_af_7",
  (firstSpeaker: GameObject, secondSpeaker: GameObject): boolean => {
    return hasInfoPortion(zatB29InfopTable.get(22)) && registry.actor.object(zatB29AfTable.get(22)) !== null;
  }
);

/**
 * Check whether the eighth advanced artefact is requested and carried by the actor.
 *
 * @param firstSpeaker - First participant of the dialog (actor).
 * @param secondSpeaker - Second participant of the dialog (NPC).
 * @returns Whether the corresponding info portion is set and the actor owns the eighth artefact.
 */
extern(
  "dialogs_zaton.zat_b29_actor_has_adv_task_af_8",
  (firstSpeaker: GameObject, secondSpeaker: GameObject): boolean => {
    return hasInfoPortion(zatB29InfopTable.get(23)) && registry.actor.object(zatB29AfTable.get(23)) !== null;
  }
);

/**
 * Give a scientific detector from the NPC to the actor.
 *
 * @param firstSpeaker - First participant of the dialog (actor).
 * @param secondSpeaker - Second participant of the dialog (NPC).
 */
extern(
  "dialogs_zaton.zat_b30_transfer_detector_to_actor",
  (firstSpeaker: GameObject, secondSpeaker: GameObject): void => {
    transferItemsToActor(getNpcSpeaker(firstSpeaker, secondSpeaker), detectors.detector_scientific);
  }
);

/**
 * Reward the actor with Owl's money share.
 *
 * @param firstSpeaker - First participant of the dialog (actor).
 * @param secondSpeaker - Second participant of the dialog (NPC).
 */
extern(
  "dialogs_zaton.zat_b30_give_owls_share_to_actor",
  (firstSpeaker: GameObject, secondSpeaker: GameObject): void => {
    giveMoneyToActor(1_500);
  }
);

/**
 * Check whether the actor carries the compass artefact.
 *
 * @param firstSpeaker - First participant of the dialog (actor).
 * @param secondSpeaker - Second participant of the dialog (NPC).
 * @returns Whether the actor owns the compass artefact.
 */
extern("dialogs_zaton.zat_b30_actor_has_compass", (firstSpeaker: GameObject, secondSpeaker: GameObject): boolean => {
  return registry.actor.object(artefacts.af_compass) !== null;
});

/**
 * Take the compass artefact from the actor, reward money and reveal treasure coordinates.
 *
 * @param firstSpeaker - First participant of the dialog (actor).
 * @param secondSpeaker - Second participant of the dialog (NPC).
 */
extern("dialogs_zaton.zat_b30_transfer_af_from_actor", (firstSpeaker: GameObject, secondSpeaker: GameObject): void => {
  transferItemsFromActor(getNpcSpeaker(firstSpeaker, secondSpeaker), artefacts.af_compass);
  giveMoneyToActor(10_000);

  const treasureManager: TreasureManager = getManager(TreasureManager);

  treasureManager.giveActorTreasureCoordinates("zat_hiding_place_49");
  treasureManager.giveActorTreasureCoordinates("zat_hiding_place_15");
});

/**
 * Check whether the barman has accumulated daily percent owed to the actor.
 *
 * @param firstSpeaker - First participant of the dialog (actor).
 * @param secondSpeaker - Second participant of the dialog (NPC).
 * @returns Whether the stored day counter is greater than zero.
 */
extern("dialogs_zaton.zat_b30_barmen_has_percent", (firstSpeaker: GameObject, secondSpeaker: GameObject): boolean => {
  const count: TCount = getPortableStoreValue(ACTOR_ID, "zat_b30_days_cnt", 0);

  return count > 0;
});
/**
 * Check whether the barman has no accumulated daily percent owed to the actor.
 *
 * @param firstSpeaker - First participant of the dialog (actor).
 * @param secondSpeaker - Second participant of the dialog (NPC).
 * @returns Whether the stored day counter is below one.
 */
extern(
  "dialogs_zaton.zat_b30_barmen_do_not_has_percent",
  (firstSpeaker: GameObject, secondSpeaker: GameObject): boolean => {
    const count: TCount = getPortableStoreValue(ACTOR_ID, "zat_b30_days_cnt", 0);

    return count < 1;
  }
);

/**
 * Check whether the actor carries Noah's PDA.
 *
 * @param firstSpeaker - First participant of the dialog (actor).
 * @param secondSpeaker - Second participant of the dialog (NPC).
 * @returns Whether the actor owns Noah's PDA quest item.
 */
extern("dialogs_zaton.zat_b30_actor_has_noah_pda", (firstSpeaker: GameObject, secondSpeaker: GameObject): boolean => {
  return registry.actor.object(questItems.zat_b20_noah_pda) !== null;
});

/**
 * Sell Noah's PDA to the NPC and reward the actor with money.
 *
 * @param firstSpeaker - First participant of the dialog (actor).
 * @param secondSpeaker - Second participant of the dialog (NPC).
 */
extern("dialogs_zaton.zat_b30_sell_noah_pda", (firstSpeaker: GameObject, secondSpeaker: GameObject): void => {
  transferItemsFromActor(getNpcSpeaker(firstSpeaker, secondSpeaker), questItems.zat_b20_noah_pda);
  giveMoneyToActor(1000);
});

/**
 * Check whether the actor carries the zat_b40 notebook.
 *
 * @param firstSpeaker - First participant of the dialog (actor).
 * @param secondSpeaker - Second participant of the dialog (NPC).
 * @returns Whether the actor owns the zat_b40 notebook quest item.
 */
extern("dialogs_zaton.zat_b40_actor_has_notebook", (firstSpeaker: GameObject, secondSpeaker: GameObject): boolean => {
  return registry.actor.object(questItems.zat_b40_notebook) !== null;
});

/**
 * Check whether the actor carries the first zat_b40 mercenary PDA.
 *
 * @param firstSpeaker - First participant of the dialog (actor).
 * @param secondSpeaker - Second participant of the dialog (NPC).
 * @returns Whether the actor owns the first zat_b40 mercenary PDA.
 */
extern("dialogs_zaton.zat_b40_actor_has_merc_pda_1", (firstSpeaker: GameObject, secondSpeaker: GameObject): boolean => {
  return registry.actor.object(questItems.zat_b40_pda_1) !== null;
});

/**
 * Check whether the actor carries the second zat_b40 mercenary PDA.
 *
 * @param firstSpeaker - First participant of the dialog (actor).
 * @param secondSpeaker - Second participant of the dialog (NPC).
 * @returns Whether the actor owns the second zat_b40 mercenary PDA.
 */
extern("dialogs_zaton.zat_b40_actor_has_merc_pda_2", (firstSpeaker: GameObject, secondSpeaker: GameObject): boolean => {
  return registry.actor.object(questItems.zat_b40_pda_2) !== null;
});

/**
 * Check whether the actor carries the third toolkit.
 *
 * @param firstSpeaker - First participant of the dialog (actor).
 * @param secondSpeaker - Second participant of the dialog (NPC).
 * @returns Whether the actor owns the third toolkit.
 */
extern("dialogs_zaton.if_actor_has_toolkit_3", (firstSpeaker: GameObject, secondSpeaker: GameObject): boolean => {
  return registry.actor.object(misc.toolkit_3) !== null;
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
  return registry.actor.object(food.vodka) !== null;
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
    return firstSpeaker.object(questItems.zat_a23_gauss_rifle_docs) !== null;
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
  return firstSpeaker.object(questItems.pri_a17_gauss_rifle) !== null;
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
 * Check whether the poor actor has enough money for the cheaper Pripyat passage.
 *
 * @param firstSpeaker - First participant of the dialog (actor).
 * @param secondSpeaker - Second participant of the dialog (NPC).
 * @returns Whether the actor owns at least 1000 money.
 */
extern(
  "dialogs_zaton.zat_b215_actor_has_money_poor",
  (firstSpeaker: GameObject, secondSpeaker: GameObject): boolean => {
    return registry.actor.money() >= 1000;
  }
);

/**
 * Check whether the poor actor lacks the money for the cheaper passage.
 *
 * @param firstSpeaker - First participant of the dialog (actor).
 * @param secondSpeaker - Second participant of the dialog (NPC).
 * @returns Whether the actor owns less than 1000 money.
 */
extern(
  "dialogs_zaton.zat_b215_actor_has_no_money_poor",
  (firstSpeaker: GameObject, secondSpeaker: GameObject): boolean => {
    return registry.actor.money() < 1000;
  }
);

/**
 * Check whether the poor actor has enough money for the Pripyat passage.
 *
 * @param firstSpeaker - First participant of the dialog (actor).
 * @param secondSpeaker - Second participant of the dialog (NPC).
 * @returns Whether the actor owns at least 4000 money.
 */
extern(
  "dialogs_zaton.zat_b215_actor_has_money_poor_pripyat",
  (firstSpeaker: GameObject, secondSpeaker: GameObject): boolean => {
    return registry.actor.money() >= 4000;
  }
);

/**
 * Check whether the poor actor lacks the money for the Pripyat passage.
 *
 * @param firstSpeaker - First participant of the dialog (actor).
 * @param secondSpeaker - Second participant of the dialog (NPC).
 * @returns Whether the actor owns less than 4000 money.
 */
extern(
  "dialogs_zaton.zat_b215_actor_has_no_money_poor_pripyat",
  (firstSpeaker: GameObject, secondSpeaker: GameObject): boolean => {
    return registry.actor.money() < 4000;
  }
);

/**
 * Check whether the rich actor has enough money for the passage.
 *
 * @param firstSpeaker - First participant of the dialog (actor).
 * @param secondSpeaker - Second participant of the dialog (NPC).
 * @returns Whether the actor owns at least 3000 money.
 */
extern(
  "dialogs_zaton.zat_b215_actor_has_money_rich",
  (firstSpeaker: GameObject, secondSpeaker: GameObject): boolean => {
    return registry.actor.money() >= 3000;
  }
);

/**
 * Check whether the rich actor lacks the money for the passage.
 *
 * @param firstSpeaker - First participant of the dialog (actor).
 * @param secondSpeaker - Second participant of the dialog (NPC).
 * @returns Whether the actor owns less than 3000 money.
 */
extern(
  "dialogs_zaton.zat_b215_actor_has_no_money_rich",
  (firstSpeaker: GameObject, secondSpeaker: GameObject): boolean => {
    return registry.actor.money() < 3000;
  }
);

/**
 * Check whether the rich actor has enough money for the Pripyat passage.
 *
 * @param firstSpeaker - First participant of the dialog (actor).
 * @param secondSpeaker - Second participant of the dialog (NPC).
 * @returns Whether the actor owns at least 6000 money.
 */
extern(
  "dialogs_zaton.zat_b215_actor_has_money_rich_pripyat",
  (firstSpeaker: GameObject, secondSpeaker: GameObject): boolean => {
    return registry.actor.money() >= 6000;
  }
);

/**
 * Check whether the rich actor lacks the money for the Pripyat passage.
 *
 * @param firstSpeaker - First participant of the dialog (actor).
 * @param secondSpeaker - Second participant of the dialog (NPC).
 * @returns Whether the actor owns less than 6000 money.
 */
extern(
  "dialogs_zaton.zat_b215_actor_has_no_money_rich_pripyat",
  (firstSpeaker: GameObject, secondSpeaker: GameObject): boolean => {
    return registry.actor.money() < 6000;
  }
);

/**
 * Transfer the 1000 money poor passage fee from the actor to the dialog NPC.
 *
 * @param firstSpeaker - First participant of the dialog (actor).
 * @param secondSpeaker - Second participant of the dialog (NPC).
 */
extern("dialogs_zaton.zat_b215_relocate_money_poor", (firstSpeaker: GameObject, secondSpeaker: GameObject): void => {
  transferMoneyFromActor(getNpcSpeaker(firstSpeaker, secondSpeaker), 1000);
});

/**
 * Transfer the 4000 money poor Pripyat passage fee from the actor to the dialog NPC.
 *
 * @param firstSpeaker - First participant of the dialog (actor).
 * @param secondSpeaker - Second participant of the dialog (NPC).
 */
extern(
  "dialogs_zaton.zat_b215_relocate_money_poor_pripyat",
  (firstSpeaker: GameObject, secondSpeaker: GameObject): void => {
    transferMoneyFromActor(getNpcSpeaker(firstSpeaker, secondSpeaker), 4000);
  }
);

/**
 * Transfer the 3000 money rich passage fee from the actor to the dialog NPC.
 *
 * @param firstSpeaker - First participant of the dialog (actor).
 * @param secondSpeaker - Second participant of the dialog (NPC).
 */
extern("dialogs_zaton.zat_b215_relocate_money_rich", (firstSpeaker: GameObject, secondSpeaker: GameObject): void => {
  transferMoneyFromActor(getNpcSpeaker(firstSpeaker, secondSpeaker), 3000);
});

/**
 * Transfer the 6000 money rich Pripyat passage fee from the actor to the dialog NPC.
 *
 * @param firstSpeaker - First participant of the dialog (actor).
 * @param secondSpeaker - Second participant of the dialog (NPC).
 */
extern(
  "dialogs_zaton.zat_b215_relocate_money_rich_pripyat",
  (firstSpeaker: GameObject, secondSpeaker: GameObject): void => {
    transferMoneyFromActor(getNpcSpeaker(firstSpeaker, secondSpeaker), 6000);
  }
);

/**
 * Check whether the actor carries either the Joker or the barge PDA.
 *
 * @param firstSpeaker - First participant of the dialog (actor).
 * @param secondSpeaker - Second participant of the dialog (NPC).
 * @returns Whether the actor owns the Joker PDA or the barge PDA.
 */
extern("dialogs_zaton.zat_b44_actor_has_pda_global", (firstSpeaker: GameObject, secondSpeaker: GameObject): boolean => {
  return (
    registry.actor.object(questItems.zat_b39_joker_pda) !== null ||
    registry.actor.object(questItems.zat_b44_barge_pda) !== null
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
      registry.actor.object(questItems.zat_b39_joker_pda) === null ||
      registry.actor.object(questItems.zat_b44_barge_pda) === null
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
  return registry.actor.object(questItems.zat_b44_barge_pda) !== null;
});

/**
 * Check whether the actor carries the Joker PDA.
 *
 * @param firstSpeaker - First participant of the dialog (actor).
 * @param secondSpeaker - Second participant of the dialog (NPC).
 * @returns Whether the actor owns the Joker PDA quest item.
 */
extern("dialogs_zaton.zat_b44_actor_has_pda_joker", (firstSpeaker: GameObject, secondSpeaker: GameObject): boolean => {
  return registry.actor.object(questItems.zat_b39_joker_pda) !== null;
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
    registry.actor.object(questItems.zat_b39_joker_pda) !== null &&
    registry.actor.object(questItems.zat_b44_barge_pda) !== null
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

/**
 * Check whether the actor carries an advanced-grade detector.
 *
 * @param firstSpeaker - First participant of the dialog (actor).
 * @param secondSpeaker - Second participant of the dialog (NPC).
 * @returns Whether the actor owns an advanced, elite or scientific detector.
 */
extern(
  "dialogs_zaton.zat_b53_if_actor_has_detector_advanced",
  (firstSpeaker: GameObject, secondSpeaker: GameObject): boolean => {
    return (
      actorHasItem(detectors.detector_advanced) ||
      actorHasItem(detectors.detector_elite) ||
      actorHasItem(detectors.detector_scientific)
    );
  }
);

/**
 * Release one of the actor medkits to the NPC, notify the relocation and raise actor reputation.
 *
 * @param firstSpeaker - First participant of the dialog (actor).
 * @param secondSpeaker - Second participant of the dialog (NPC).
 */
extern("dialogs_zaton.zat_b53_transfer_medkit_to_npc", (firstSpeaker: GameObject, secondSpeaker: GameObject): void => {
  let section: Nillable<TDrugItem> = null;
  const actor: GameObject = registry.actor;

  if (actorHasItem(drugs.medkit)) {
    section = drugs.medkit;
  } else if (actorHasItem(drugs.medkit_army)) {
    section = drugs.medkit_army;
  } else if (actorHasItem(drugs.medkit_scientic)) {
    section = drugs.medkit_scientic;
  }

  if (!section) {
    return;
  }

  registry.simulator.release(registry.simulator.object(actor.object(section)!.id()), true);
  getManager(NotificationManager).sendItemRelocatedNotification(ENotificationDirection.OUT, section, 1);
  actor.change_character_reputation(10);
});

/**
 * Check whether the current in-game time falls within the zat_b106 hunting window.
 *
 * @param firstSpeaker - First participant of the dialog (actor).
 * @param secondSpeaker - Second participant of the dialog (NPC).
 * @returns Whether the current time is at or after 02:45 and before 05:00.
 */
extern("dialogs_zaton.is_zat_b106_hunting_time", (firstSpeaker: GameObject, secondSpeaker: GameObject): boolean => {
  if (level.get_time_hours() >= 2 && level.get_time_hours() < 5) {
    if (level.get_time_hours() > 2) {
      return true;
    } else if (level.get_time_minutes() >= 45) {
      return true;
    }
  }

  return false;
});

/**
 * Check whether the current in-game time is outside the zat_b106 hunting window.
 *
 * @param firstSpeaker - First participant of the dialog (actor).
 * @param secondSpeaker - Second participant of the dialog (NPC).
 * @returns Whether the current time is not within the hunting window.
 */
extern("dialogs_zaton.is_not_zat_b106_hunting_time", (firstSpeaker: GameObject, secondSpeaker: GameObject): boolean => {
  if (level.get_time_hours() >= 2 && level.get_time_hours() < 5) {
    if (level.get_time_hours() > 2) {
      return false;
    } else if (level.get_time_minutes() >= 45) {
      return false;
    }
  }

  return true;
});

/**
 * Check whether the actor does not carry an advanced-grade detector.
 *
 * @param firstSpeaker - First participant of the dialog (actor).
 * @param secondSpeaker - Second participant of the dialog (NPC).
 * @returns Whether the actor lacks an advanced, elite and scientific detector.
 */
extern(
  "dialogs_zaton.zat_b53_if_actor_hasnt_detector_advanced",
  (firstSpeaker: GameObject, secondSpeaker: GameObject): boolean => {
    return !getExtern<AnyCallable>("zat_b53_if_actor_has_detector_advanced", getExtern("dialogs_zaton"))(
      firstSpeaker,
      secondSpeaker
    );
  }
);

/**
 * Give an advanced detector from the NPC to the actor.
 *
 * @param firstSpeaker - First participant of the dialog (actor).
 * @param secondSpeaker - Second participant of the dialog (NPC).
 */
extern(
  "dialogs_zaton.zat_b53_transfer_detector_advanced_to_actor",
  (firstSpeaker: GameObject, secondSpeaker: GameObject): void => {
    transferItemsToActor(getNpcSpeaker(firstSpeaker, secondSpeaker), detectors.detector_advanced);
  }
);

/**
 * Give the fireball artefact from the NPC to the actor.
 *
 * @param firstSpeaker - First participant of the dialog (actor).
 * @param secondSpeaker - Second participant of the dialog (NPC).
 */
extern(
  "dialogs_zaton.zat_b53_transfer_fireball_to_actor",
  (firstSpeaker: GameObject, secondSpeaker: GameObject): void => {
    transferItemsToActor(getNpcSpeaker(firstSpeaker, secondSpeaker), artefacts.af_fireball);
  }
);

/**
 * Give a medkit from the NPC to the actor.
 *
 * @param firstSpeaker - First participant of the dialog (actor).
 * @param secondSpeaker - Second participant of the dialog (NPC).
 */
extern(
  "dialogs_zaton.zat_b53_transfer_medkit_to_actor",
  (firstSpeaker: GameObject, secondSpeaker: GameObject): void => {
    transferItemsToActor(getNpcSpeaker(firstSpeaker, secondSpeaker), drugs.medkit);
  }
);

/**
 * Reward the actor with money for the Soroka task, reduced if Flint was blamed.
 *
 * @param firstSpeaker - First participant of the dialog (actor).
 * @param secondSpeaker - Second participant of the dialog (NPC).
 */
extern("dialogs_zaton.zat_b106_soroka_reward", (firstSpeaker: GameObject, secondSpeaker: GameObject): void => {
  if (
    hasInfoPortion(infoPortions.jup_b25_flint_blame_done_to_duty) ||
    hasInfoPortion(infoPortions.jup_b25_flint_blame_done_to_freedom)
  ) {
    giveMoneyToActor(1000);
  } else {
    giveMoneyToActor(3000);
  }
});

/**
 * Check whether the actor carries at least six of the requested food items.
 *
 * @param firstSpeaker - First participant of the dialog (actor).
 * @param secondSpeaker - Second participant of the dialog (NPC).
 * @returns Whether the actor owns six or more bread, kolbasa and conserva combined.
 */
extern(
  "dialogs_zaton.zat_b103_actor_has_needed_food",
  (firstSpeaker: GameObject, secondSpeaker: GameObject): boolean => {
    const actor: GameObject = registry.actor;
    const itemSections: LuaArray<TFoodItem> = $fromArray<TFoodItem>([food.bread, food.kolbasa, food.conserva]);

    let count: TCount = 0;

    for (const [k, itemSection] of itemSections) {
      registry.actor.iterate_inventory((temp, item) => {
        if (item.section() === itemSection) {
          count = count + 1;
        }
      }, actor);
    }

    return count >= 6;
  }
);

/**
 * Give a SPAS-12 shotgun from the NPC to the actor.
 *
 * @param firstSpeaker - First participant of the dialog (actor).
 * @param secondSpeaker - Second participant of the dialog (NPC).
 */
extern("dialogs_zaton.zat_b106_transfer_weap_to_actor", (firstSpeaker: GameObject, secondSpeaker: GameObject): void => {
  transferItemsToActor(getNpcSpeaker(firstSpeaker, secondSpeaker), weapons.wpn_spas12);
});

/**
 * Reveal the zat_b106 treasure coordinates as a reward.
 *
 * @param firstSpeaker - First participant of the dialog (actor).
 * @param secondSpeaker - Second participant of the dialog (NPC).
 */
extern("dialogs_zaton.zat_b106_give_reward", (firstSpeaker: GameObject, secondSpeaker: GameObject): void => {
  TreasureManager.giveTreasureCoordinates("zat_hiding_place_50");
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

/**
 * Check whether Soroka has left because Flint was blamed.
 *
 * @param firstSpeaker - First participant of the dialog (actor).
 * @param secondSpeaker - Second participant of the dialog (NPC).
 * @returns Whether either Flint blame info portion is set.
 */
extern("dialogs_zaton.zat_b106_soroka_gone", (firstSpeaker: GameObject, secondSpeaker: GameObject): boolean => {
  return (
    hasInfoPortion(infoPortions.jup_b25_flint_blame_done_to_duty) ||
    hasInfoPortion(infoPortions.jup_b25_flint_blame_done_to_freedom)
  );
});

/**
 * Check whether Soroka has not left.
 *
 * @param firstSpeaker - First participant of the dialog (actor).
 * @param secondSpeaker - Second participant of the dialog (NPC).
 * @returns Whether neither Flint blame info portion is set.
 */
extern("dialogs_zaton.zat_b106_soroka_not_gone", (firstSpeaker: GameObject, secondSpeaker: GameObject): boolean => {
  return !getExtern<AnyCallable>("zat_b106_soroka_gone", getExtern("dialogs_zaton"))(firstSpeaker, secondSpeaker);
});

/**
 * Check whether the actor carries the medic PDA proof.
 *
 * @param firstSpeaker - First participant of the dialog (actor).
 * @param secondSpeaker - Second participant of the dialog (NPC).
 * @returns Whether the actor owns the zat_b22 medic PDA.
 */
extern("dialogs_zaton.zat_b22_actor_has_proof", (firstSpeaker: GameObject, secondSpeaker: GameObject): boolean => {
  return actorHasItem(infoPortions.zat_b22_medic_pda);
});

/**
 * Take the zat_b22 medic PDA proof from the actor.
 *
 * @param firstSpeaker - First participant of the dialog (actor).
 * @param secondSpeaker - Second participant of the dialog (NPC).
 */
extern("dialogs_zaton.zat_b22_transfer_proof", (firstSpeaker: GameObject, secondSpeaker: GameObject): void => {
  transferItemsFromActor(getNpcSpeaker(firstSpeaker, secondSpeaker), infoPortions.zat_b22_medic_pda);
});

/**
 * Reward the actor with money and reveal treasure coordinates for the stalker outcome.
 *
 * @param firstSpeaker - First participant of the dialog (actor).
 * @param secondSpeaker - Second participant of the dialog (NPC).
 */
extern("dialogs_zaton.zat_b5_stalker_transfer_money", (firstSpeaker: GameObject, secondSpeaker: GameObject): void => {
  giveMoneyToActor(2500);
  TreasureManager.giveTreasureCoordinates("zat_hiding_place_7");
});

/**
 * Reward the actor with the full dealer payout.
 *
 * @param firstSpeaker - First participant of the dialog (actor).
 * @param secondSpeaker - Second participant of the dialog (NPC).
 */
extern("dialogs_zaton.zat_b5_dealer_full_revard", (firstSpeaker: GameObject, secondSpeaker: GameObject): void => {
  giveMoneyToActor(6_000);
});

/**
 * Reward the actor with the reduced dealer payout.
 *
 * @param firstSpeaker - First participant of the dialog (actor).
 * @param secondSpeaker - Second participant of the dialog (NPC).
 */
extern("dialogs_zaton.zat_b5_dealer_easy_revard", (firstSpeaker: GameObject, secondSpeaker: GameObject): void => {
  giveMoneyToActor(3_000);
});

/**
 * Reward the actor with money and reveal treasure coordinates for the bandit outcome.
 *
 * @param firstSpeaker - First participant of the dialog (actor).
 * @param secondSpeaker - Second participant of the dialog (NPC).
 */
extern("dialogs_zaton.zat_b5_bandits_revard", (firstSpeaker: GameObject, secondSpeaker: GameObject): void => {
  giveMoneyToActor(5_000);
  TreasureManager.giveTreasureCoordinates("zat_hiding_place_20");
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
    return registry.actor.object(questItems.zat_a23_access_card) !== null;
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

/**
 * Give an elite detector from the NPC to the actor and reveal treasure coordinates.
 *
 * @param firstSpeaker - First participant of the dialog (actor).
 * @param secondSpeaker - Second participant of the dialog (NPC).
 */
// --// --- b57 new // --// --
extern(
  "dialogs_zaton.zat_b57_stalker_reward_to_actor_detector",
  (firstSpeaker: GameObject, secondSpeaker: GameObject): void => {
    transferItemsToActor(getNpcSpeaker(firstSpeaker, secondSpeaker), detectors.detector_elite);
    TreasureManager.giveTreasureCoordinates("zat_hiding_place_54");
  }
);

/**
 * Check whether the actor carries the zat_b57 gas canister.
 *
 * @param firstSpeaker - First participant of the dialog (actor).
 * @param secondSpeaker - Second participant of the dialog (NPC).
 * @returns Whether the actor owns the zat_b57 gas quest item.
 */
extern("dialogs_zaton.actor_has_gas", (firstSpeaker: GameObject, secondSpeaker: GameObject): boolean => {
  return registry.actor.object(questItems.zat_b57_gas) !== null;
});

/**
 * Check whether the actor does not carry the zat_b57 gas canister.
 *
 * @param firstSpeaker - First participant of the dialog (actor).
 * @param secondSpeaker - Second participant of the dialog (NPC).
 * @returns Whether the actor lacks the zat_b57 gas quest item.
 */
extern("dialogs_zaton.actor_has_not_gas", (firstSpeaker: GameObject, secondSpeaker: GameObject): boolean => {
  return !getExtern<AnyCallable>("actor_has_gas", getExtern("dialogs_zaton"))(firstSpeaker, secondSpeaker);
});

/**
 * Check whether the actor has enough money for the zat_b57 deal.
 *
 * @param firstSpeaker - First participant of the dialog (actor).
 * @param secondSpeaker - Second participant of the dialog (NPC).
 * @returns Whether the actor owns at least 2000 money.
 */
extern("dialogs_zaton.zat_b57_actor_has_money", (firstSpeaker: GameObject, secondSpeaker: GameObject): boolean => {
  return registry.actor.money() >= 2000;
});

/**
 * Check whether the actor lacks the money for the zat_b57 deal.
 *
 * @param firstSpeaker - First participant of the dialog (actor).
 * @param secondSpeaker - Second participant of the dialog (NPC).
 * @returns Whether the actor owns less than 2000 money.
 */
extern("dialogs_zaton.zat_b57_actor_hasnt_money", (firstSpeaker: GameObject, secondSpeaker: GameObject): boolean => {
  return !getExtern<AnyCallable>("zat_b57_actor_has_money", getExtern("dialogs_zaton"))(firstSpeaker, secondSpeaker);
});

/**
 * Transfer the 2000 money zat_b57 gas fee from the actor to the dialog NPC.
 *
 * @param firstSpeaker - First participant of the dialog (actor).
 * @param secondSpeaker - Second participant of the dialog (NPC).
 */
extern("dialogs_zaton.zat_b57_transfer_gas_money", (firstSpeaker: GameObject, secondSpeaker: GameObject): void => {
  transferMoneyFromActor(getNpcSpeaker(firstSpeaker, secondSpeaker), 2000);
});
