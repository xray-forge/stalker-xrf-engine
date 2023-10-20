/* eslint @typescript-eslint/explicit-function-return-type: "error" */

import { game, level } from "xray16";

import { isStoryObjectExisting, registry } from "@/engine/core/database";
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
import { artefacts, TArtefact } from "@/engine/lib/constants/items/artefacts";
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
  GameObject,
  LuaArray,
  Optional,
  TCount,
  TIndex,
  TName,
  TSection,
  TStringId,
} from "@/engine/lib/types";

const logger: LuaLogger = new LuaLogger($filename);

/**
 * todo;
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
 * todo;
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
 * todo;
 */
extern("dialogs_zaton.zat_b30_actor_has_1000", (firstSpeaker: GameObject, secondSpeaker: GameObject): boolean => {
  return registry.actor.money() >= 1000;
});

/**
 * todo;
 */
extern("dialogs_zaton.zat_b30_actor_has_200", (firstSpeaker: GameObject, secondSpeaker: GameObject): boolean => {
  return registry.actor.money() >= 200;
});

/**
 * todo;
 */
extern(
  "dialogs_zaton.zat_b30_actor_has_pri_b36_monolith_hiding_place_pda",
  (firstSpeaker: GameObject, secondSpeaker: GameObject): boolean => {
    return registry.actor.object(questItems.pri_b36_monolith_hiding_place_pda) !== null;
  }
);

/**
 * todo;
 */
extern(
  "dialogs_zaton.zat_b30_actor_has_pri_b306_envoy_pda",
  (firstSpeaker: GameObject, secondSpeaker: GameObject): boolean => {
    return registry.actor.object(questItems.pri_b306_envoy_pda) !== null;
  }
);

/**
 * todo;
 */
extern(
  "dialogs_zaton.zat_b30_actor_has_jup_b10_strelok_notes_1",
  (firstSpeaker: GameObject, secondSpeaker: GameObject): boolean => {
    return registry.actor.object(questItems.jup_b10_notes_01) !== null;
  }
);

/**
 * todo;
 */
extern(
  "dialogs_zaton.zat_b30_actor_has_jup_b10_strelok_notes_2",
  (firstSpeaker: GameObject, secondSpeaker: GameObject): boolean => {
    return registry.actor.object(questItems.jup_b10_notes_02) !== null;
  }
);

/**
 * todo;
 */
extern(
  "dialogs_zaton.zat_b30_actor_has_jup_b10_strelok_notes_3",
  (firstSpeaker: GameObject, secondSpeaker: GameObject): boolean => {
    return registry.actor.object(questItems.jup_b10_notes_03) !== null;
  }
);

/**
 * todo;
 */
extern(
  "dialogs_zaton.zat_b30_actor_has_detector_scientific",
  (firstSpeaker: GameObject, secondSpeaker: GameObject): boolean => {
    return registry.actor.object(detectors.detector_scientific) !== null;
  }
);

/**
 * todo;
 */
extern(
  "dialogs_zaton.zat_b30_actor_has_device_flash_snag",
  (firstSpeaker: GameObject, secondSpeaker: GameObject): boolean => {
    return registry.actor.object(questItems.device_flash_snag) !== null;
  }
);

/**
 * todo;
 */
extern(
  "dialogs_zaton.zat_b30_actor_has_device_pda_port_bandit_leader",
  (firstSpeaker: GameObject, secondSpeaker: GameObject): boolean => {
    return registry.actor.object(questItems.device_pda_port_bandit_leader) !== null;
  }
);

/**
 * todo;
 */
extern(
  "dialogs_zaton.zat_b30_actor_has_jup_b10_ufo_memory",
  (firstSpeaker: GameObject, secondSpeaker: GameObject): boolean => {
    return registry.actor.object(questItems.jup_b10_ufo_memory_2) !== null;
  }
);

/**
 * todo;
 */
extern(
  "dialogs_zaton.zat_b30_actor_has_jup_b202_bandit_pda",
  (firstSpeaker: GameObject, secondSpeaker: GameObject): boolean => {
    return registry.actor.object(questItems.jup_b202_bandit_pda) !== null;
  }
);

/**
 * todo;
 */
extern("dialogs_zaton.zat_b30_transfer_1000", (firstSpeaker: GameObject, secondSpeaker: GameObject): void => {
  transferMoneyFromActor(getNpcSpeaker(firstSpeaker, secondSpeaker), 1000);
});

/**
 * todo;
 */
extern("dialogs_zaton.zat_b30_transfer_200", (firstSpeaker: GameObject, secondSpeaker: GameObject): void => {
  transferMoneyFromActor(getNpcSpeaker(firstSpeaker, secondSpeaker), 200);
});

/**
 * todo;
 */
extern(
  "dialogs_zaton.zat_b30_sell_pri_b36_monolith_hiding_place_pda",
  (firstSpeaker: GameObject, secondSpeaker: GameObject): void => {
    transferItemsFromActor(getNpcSpeaker(firstSpeaker, secondSpeaker), questItems.pri_b36_monolith_hiding_place_pda);
    giveMoneyToActor(5000);
  }
);

/**
 * todo;
 */
extern("dialogs_zaton.zat_b30_sell_pri_b306_envoy_pda", (firstSpeaker: GameObject, secondSpeaker: GameObject): void => {
  transferItemsFromActor(getNpcSpeaker(firstSpeaker, secondSpeaker), questItems.pri_b306_envoy_pda);
  giveMoneyToActor(4000);
});

/**
 * todo;
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
 * todo;
 */
extern(
  "dialogs_zaton.zat_b30_sell_jup_b10_strelok_notes_1",
  (firstSpeaker: GameObject, secondSpeaker: GameObject): void => {
    transferItemsFromActor(getNpcSpeaker(firstSpeaker, secondSpeaker), questItems.jup_b10_notes_01);
    giveMoneyToActor(500);
  }
);

/**
 * todo;
 */
extern(
  "dialogs_zaton.zat_b30_sell_jup_b10_strelok_notes_2",
  (firstSpeaker: GameObject, secondSpeaker: GameObject): void => {
    transferItemsFromActor(getNpcSpeaker(firstSpeaker, secondSpeaker), questItems.jup_b10_notes_02);
    giveMoneyToActor(500);
  }
);

/**
 * todo;
 */
extern(
  "dialogs_zaton.zat_b30_sell_jup_b10_strelok_notes_3",
  (firstSpeaker: GameObject, secondSpeaker: GameObject): void => {
    transferItemsFromActor(getNpcSpeaker(firstSpeaker, secondSpeaker), questItems.jup_b10_notes_03);
    giveMoneyToActor(500);
  }
);

/**
 * todo;
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
 * todo;
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
 * todo;
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
 * todo;
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
 * todo;
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
 * todo;
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
 * todo;
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
 * todo;
 */
extern(
  "dialogs_zaton.zat_b30_owl_stalker_trader_sell_jup_b202_bandit_pda",
  (firstSpeaker: GameObject, secondSpeaker: GameObject): void => {
    transferItemsFromActor(getNpcSpeaker(firstSpeaker, secondSpeaker), questItems.jup_b202_bandit_pda);
    giveMoneyToActor(500);
  }
);

/**
 * todo;
 */
extern("dialogs_zaton.zat_b14_bar_transfer_money", (firstSpeaker: GameObject, secondSpeaker: GameObject): void => {
  giveMoneyToActor(1000);
});

/**
 * todo;
 */
extern("dialogs_zaton.zat_b14_transfer_artefact", (firstSpeaker: GameObject, secondSpeaker: GameObject): void => {
  transferItemsFromActor(getNpcSpeaker(firstSpeaker, secondSpeaker), artefacts.af_quest_b14_twisted);
});

/**
 * todo;
 */
extern("dialogs_zaton.actor_has_artefact", (firstSpeaker: GameObject, secondSpeaker: GameObject): boolean => {
  return firstSpeaker.object(artefacts.af_quest_b14_twisted) !== null;
});

/**
 * todo;
 */
extern("dialogs_zaton.actor_hasnt_artefact", (firstSpeaker: GameObject, secondSpeaker: GameObject): boolean => {
  return !getExtern<AnyCallable>("actor_has_artefact", getExtern("dialogs_zaton"))(firstSpeaker, secondSpeaker)(
    firstSpeaker,
    secondSpeaker
  );
});

/**
 * todo;
 */
extern(
  "dialogs_zaton.zat_b7_give_bandit_reward_to_actor",
  (firstSpeaker: GameObject, secondSpeaker: GameObject): void => {
    giveMoneyToActor(math.random(15, 30) * 100);
    TreasureManager.getInstance().giveActorTreasureCoordinates("zat_hiding_place_30");
  }
);

/**
 * todo;
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
 * todo;
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
 * todo;
 */
extern("dialogs_zaton.zat_b7_rob_actor", (firstSpeaker: GameObject, secondSpeaker: GameObject): void => {
  let amount: TCount = math.floor((registry.actor.money() * math.random(75, 100)) / 100);

  if (registry.actor.money() < amount) {
    amount = registry.actor.money();
  }

  transferMoneyFromActor(getNpcSpeaker(firstSpeaker, secondSpeaker), amount);
});

/**
 * todo;
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
 * todo;
 */
extern("dialogs_zaton.zat_b7_squad_alive", (firstSpeaker: GameObject, secondSpeaker: GameObject): boolean => {
  return isStoryObjectExisting("zat_b7_stalkers_victims_1");
});

/**
 * todo;
 */
extern("dialogs_zaton.zat_b103_transfer_merc_supplies", (firstSpeaker: GameObject, secondSpeaker: GameObject): void => {
  const object: GameObject = getNpcSpeaker(firstSpeaker, secondSpeaker);
  const actor: GameObject = registry.actor;
  let it: TCount = 6;

  const newsManager: NotificationManager = NotificationManager.getInstance();
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
 * todo;
 */
extern("dialogs_zaton.zat_b33_set_counter_10", (firstSpeaker: GameObject, secondSpeaker: GameObject): void => {
  const actor: GameObject = registry.actor;

  getExtern<AnyCallablesModule>("xr_effects").set_counter(actor, null, ["zat_b33_items", 10]);
});

/**
 * todo;
 */
extern("dialogs_zaton.zat_b33_counter_ge_2", (firstSpeaker: GameObject, secondSpeaker: GameObject): boolean => {
  return getPortableStoreValue(ACTOR_ID, "zat_b33_items", 0 as number) >= 2;
});

/**
 * todo;
 */
extern("dialogs_zaton.zat_b33_counter_ge_4", (firstSpeaker: GameObject, secondSpeaker: GameObject): boolean => {
  return getPortableStoreValue(ACTOR_ID, "zat_b33_items", 0 as number) >= 4;
});

/**
 * todo;
 */
extern("dialogs_zaton.zat_b33_counter_ge_8", (firstSpeaker: GameObject, secondSpeaker: GameObject): boolean => {
  return getPortableStoreValue(ACTOR_ID, "zat_b33_items", 0 as number) >= 8;
});

/**
 * todo;
 */
extern("dialogs_zaton.zat_b33_counter_le_2", (firstSpeaker: GameObject, secondSpeaker: GameObject): boolean => {
  return !getExtern<AnyCallable>("zat_b33_counter_ge_2", getExtern("dialogs_zaton"))(firstSpeaker, secondSpeaker)(
    firstSpeaker,
    secondSpeaker
  );
});

/**
 * todo;
 */
extern("dialogs_zaton.zat_b33_counter_le_4", (firstSpeaker: GameObject, secondSpeaker: GameObject): boolean => {
  return !getExtern<AnyCallable>("zat_b33_counter_ge_4", getExtern("dialogs_zaton"))(firstSpeaker, secondSpeaker);
});

/**
 * todo;
 */
extern("dialogs_zaton.zat_b33_counter_le_8", (firstSpeaker: GameObject, secondSpeaker: GameObject): boolean => {
  return !getExtern<AnyCallable>("zat_b33_counter_ge_8", getExtern("dialogs_zaton"))(firstSpeaker, secondSpeaker);
});

/**
 * todo;
 */
extern("dialogs_zaton.zat_b33_counter_de_2", (firstSpeaker: GameObject, secondSpeaker: GameObject): boolean => {
  const actor: GameObject = registry.actor;

  return getExtern<AnyCallablesModule>("xr_effects").dec_counter(actor, null, ["zat_b33_items", 2]);
});

/**
 * todo;
 */
extern("dialogs_zaton.zat_b33_counter_de_4", (firstSpeaker: GameObject, secondSpeaker: GameObject): boolean => {
  const actor: GameObject = registry.actor;

  return getExtern<AnyCallablesModule>("xr_effects").dec_counter(actor, null, ["zat_b33_items", 4]);
});

/**
 * todo;
 */
extern("dialogs_zaton.zat_b33_counter_de_8", (firstSpeaker: GameObject, secondSpeaker: GameObject): boolean => {
  const actor: GameObject = registry.actor;

  return getExtern<AnyCallablesModule>("xr_effects").dec_counter(actor, null, ["zat_b33_items", 8]);
});

/**
 * todo;
 */
extern("dialogs_zaton.zat_b33_counter_eq_10", (firstSpeaker: GameObject, secondSpeaker: GameObject): boolean => {
  return getPortableStoreValue(ACTOR_ID, "zat_b33_items", 0 as number) === 10;
});

/**
 * todo;
 */
extern("dialogs_zaton.zat_b33_counter_ne_10", (firstSpeaker: GameObject, secondSpeaker: GameObject): boolean => {
  return !getExtern<AnyCallable>("zat_b33_counter_eq_10", getExtern("dialogs_zaton"))(firstSpeaker, secondSpeaker);
});

/**
 * todo;
 */
extern(
  "dialogs_zaton.zat_b103_transfer_mechanic_toolkit_2",
  (firstSpeaker: GameObject, secondSpeaker: GameObject): void => {
    transferItemsFromActor(getNpcSpeaker(firstSpeaker, secondSpeaker), misc.toolkit_2);
  }
);

/**
 * todo;
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
 * todo;
 */
extern("dialogs_zaton.zat_b33_transfer_first_item", (firstSpeaker: GameObject, secondSpeaker: GameObject): void => {
  giveItemsToActor(questItems.wpn_fort_snag);
});

/**
 * todo;
 */
extern("dialogs_zaton.zat_b33_transfer_second_item", (firstSpeaker: GameObject, secondSpeaker: GameObject): void => {
  giveItemsToActor(drugs.medkit_scientic, 3);
  giveItemsToActor(drugs.antirad, 3);
  giveItemsToActor(drugs.bandage, 5);
});

/**
 * todo;
 */
extern("dialogs_zaton.zat_b33_transfer_third_item", (firstSpeaker: GameObject, secondSpeaker: GameObject): void => {
  giveItemsToActor(questItems.wpn_ak74u_snag);
});

/**
 * todo;
 */
extern("dialogs_zaton.zat_b33_transfer_fourth_item", (firstSpeaker: GameObject, secondSpeaker: GameObject): void => {
  giveItemsToActor(artefacts.af_soul);
});

/**
 * todo;
 */
extern("dialogs_zaton.zat_b33_transfer_fifth_item", (firstSpeaker: GameObject, secondSpeaker: GameObject): void => {
  giveItemsToActor(questItems.helm_hardhat_snag);
});

/**
 * todo;
 */
extern("dialogs_zaton.zat_b33_transfer_safe_container", (firstSpeaker: GameObject, secondSpeaker: GameObject): void => {
  transferItemsFromActor(getNpcSpeaker(firstSpeaker, secondSpeaker), questItems.zat_b33_safe_container);
});

/**
 * todo;
 */
extern("dialogs_zaton.zat_b33_aractor_has_habar", (firstSpeaker: GameObject, secondSpeaker: GameObject): boolean => {
  return registry.actor.object(questItems.zat_b33_safe_container) !== null;
});

/**
 * todo;
 */
extern("dialogs_zaton.zat_b33_actor_hasnt_habar", (firstSpeaker: GameObject, secondSpeaker: GameObject): boolean => {
  return !getExtern<AnyCallable>("zat_b33_aractor_has_habar", getExtern("dialogs_zaton"))(firstSpeaker, secondSpeaker);
});

/**
 * todo;
 */
extern(
  "dialogs_zaton.zat_b33_actor_has_needed_money",
  (firstSpeaker: GameObject, secondSpeaker: GameObject): boolean => {
    return registry.actor.money() >= 500;
  }
);

/**
 * todo;
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
 * todo;
 */
extern("dialogs_zaton.zat_b33_relocate_money", (firstSpeaker: GameObject, secondSpeaker: GameObject): void => {
  if (
    getExtern<AnyCallable>("zat_b33_actor_has_needed_money", getExtern("dialogs_zaton"))(firstSpeaker, secondSpeaker)
  ) {
    transferMoneyFromActor(getNpcSpeaker(firstSpeaker, secondSpeaker), 500);
  }
});

/**
 * todo;
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
 * todo;
 */
export const zatB29AfNamesTable = {
  [16]: "st_af_gravi_name",
  [17]: "st_af_eye_name",
  [18]: "st_af_baloon_name",
  [19]: "st_af_dummy_dummy_name",
  [20]: "st_af_gold_fish_name",
  [21]: "st_af_fire_name",
  [22]: "st_af_glass_name",
  [23]: "st_af_ice_name",
} as unknown as LuaArray<string>;

/**
 * todo;
 */
export const zatB29InfopTable = {
  [16]: infoPortions.zat_b29_af_16,
  [17]: infoPortions.zat_b29_af_17,
  [18]: infoPortions.zat_b29_af_18,
  [19]: infoPortions.zat_b29_af_19,
  [20]: infoPortions.zat_b29_af_20,
  [21]: infoPortions.zat_b29_af_21,
  [22]: infoPortions.zat_b29_af_22,
  [23]: infoPortions.zat_b29_af_23,
} as unknown as LuaArray<TInfoPortion>;

/**
 * todo;
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
 * todo;
 */
extern("dialogs_zaton.zat_b29_create_af_in_anomaly", (firstSpeaker: GameObject, secondSpeaker: GameObject): void => {
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
  let zoneName: TName = "";
  let key;

  for (const [k, v] of zatB29InfopBringTable) {
    if (hasInfoPortion(v)) {
      key = k;
      zone = anomTbl.get(key);
      break;
    }
  }

  zoneName = anomaliesNamesTbl.get(zone).get(math.random(1, anomaliesNamesTbl.get(zone).length()));

  registry.anomalyZones.get(zoneName).setForcedSpawnOverride(zatB29AfTable.get(key as number));
});

/**
 * todo;
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
 * todo;
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
 * todo;
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
 * todo;
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
 * todo;
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
 * todo;
 */
extern(
  "dialogs_zaton.zat_b29_actor_has_exchange_item",
  (firstSpeaker: GameObject, secondSpeaker: GameObject): boolean => {
    const actor: GameObject = registry.actor;
    const actorWeaponsTable: LuaArray<TWeapon> = getGoodGunsInInventory(actor);

    if (actorWeaponsTable.length() > 0) {
      (actor as AnyObject).goodGun = actorWeaponsTable.get(math.random(1, actorWeaponsTable.length()));
    }

    return (actor as AnyObject).goodGun !== null;
  }
);

/**
 * todo;
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
 * todo;
 */
extern("dialogs_zaton.zat_b30_transfer_percent", (firstSpeaker: GameObject, secondSpeaker: GameObject): void => {
  const amount: TCount = math.random(5, 25) * 100;
  const days: TCount = getPortableStoreValue(ACTOR_ID, "zat_b30_days_cnt", 0);

  giveMoneyToActor(amount * days);
  setPortableStoreValue(ACTOR_ID, "zat_b30_days_cnt", 0);
});

/**
 * todo;
 */
extern("dialogs_zaton.zat_b30_npc_has_detector", (firstSpeaker: GameObject, secondSpeaker: GameObject): boolean => {
  return objectHasItem(getNpcSpeaker(firstSpeaker, secondSpeaker), detectors.detector_scientific);
});

/**
 * todo;
 */
extern("dialogs_zaton.zat_b30_actor_second_exchange", (firstSpeaker: GameObject, secondSpeaker: GameObject): void => {
  transferItemsToActor(getNpcSpeaker(firstSpeaker, secondSpeaker), detectors.detector_scientific);
});

/**
 * todo;
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
 * todo;
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
 * todo;
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
 * todo;
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
 * todo;
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
    transferItemsFromActor(
      getNpcSpeaker(firstSpeaker, secondSpeaker),
      actorHasItem.get(math.random(1, actorHasItem.length()))
    );
  }
});

/**
 * todo;
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
 * todo;
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
 * todo;
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
 * todo;
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
 * todo;
 */
extern("dialogs_zaton.zat_b51_hasnt_prepay", (firstSpeaker: GameObject, secondSpeaker: GameObject): boolean => {
  return !getExtern<AnyCallable>("zat_b51_has_prepay", getExtern("dialogs_zaton"))(firstSpeaker, secondSpeaker);
});

/**
 * todo;
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
 * todo;
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
 * todo;
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
 * todo;
 */
extern("dialogs_zaton.zat_b51_hasnt_item_cost", (firstSpeaker: GameObject, secondSpeaker: GameObject): boolean => {
  return !getExtern<AnyCallable>("zat_b51_has_item_cost", getExtern("dialogs_zaton"))(firstSpeaker, secondSpeaker);
});

/**
 * todo;
 */
extern("dialogs_zaton.zat_b12_actor_have_documents", (firstSpeaker: GameObject, secondSpeaker: GameObject): boolean => {
  return actorHasAtLeastOneItem([questItems.zat_b12_documents_1, questItems.zat_b12_documents_2]);
});

/**
 * todo;
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
 * todo;
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
 * todo;
 */
extern("dialogs_zaton.give_toolkit_3", (firstSpeaker: GameObject, secondSpeaker: GameObject): void => {
  transferItemsFromActor(getNpcSpeaker(firstSpeaker, secondSpeaker), misc.toolkit_3);
  (registry.actor as AnyObject).toolkit = null;
  giveMoneyToActor(1500);
});

/**
 * todo;
 */
extern("dialogs_zaton.give_toolkit_1", (firstSpeaker: GameObject, secondSpeaker: GameObject): void => {
  transferItemsFromActor(getNpcSpeaker(firstSpeaker, secondSpeaker), misc.toolkit_1);
  (registry.actor as AnyObject).toolkit = null;
  giveMoneyToActor(1000);
});

/**
 * todo;
 */
extern("dialogs_zaton.if_actor_has_toolkit_1", (firstSpeaker: GameObject, secondSpeaker: GameObject): boolean => {
  return registry.actor.object(misc.toolkit_1) !== null;
});

/**
 * todo;
 */
extern("dialogs_zaton.give_toolkit_2", (firstSpeaker: GameObject, secondSpeaker: GameObject): void => {
  transferItemsFromActor(getNpcSpeaker(firstSpeaker, secondSpeaker), misc.toolkit_2);
  (registry.actor as AnyObject).toolkit = null;
  giveMoneyToActor(1200);
});

/**
 * todo;
 */
extern("dialogs_zaton.if_actor_has_toolkit_2", (firstSpeaker: GameObject, secondSpeaker: GameObject): boolean => {
  return registry.actor.object(misc.toolkit_2) !== null;
});

/**
 * todo;
 */
extern("dialogs_zaton.zat_b215_counter_greater_3", (firstSpeaker: GameObject, secondSpeaker: GameObject): boolean => {
  return getPortableStoreValue(ACTOR_ID, "zat_a9_way_to_pripyat_counter", 0 as number) > 3;
});

/**
 * todo;
 */
extern("dialogs_zaton.zat_b40_transfer_notebook", (firstSpeaker: GameObject, secondSpeaker: GameObject): void => {
  transferItemsFromActor(getNpcSpeaker(firstSpeaker, secondSpeaker), questItems.zat_b40_notebook);
  giveInfoPortion(infoPortions.zat_b40_notebook_saled);
  giveMoneyToActor(2000);
});

/**
 * todo;
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
 * todo;
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
 * todo;
 */
extern(
  "dialogs_zaton.zat_b29_actor_do_not_has_adv_task_af_1",
  (firstSpeaker: GameObject, secondSpeaker: GameObject): boolean => {
    return hasInfoPortion(zatB29InfopTable.get(16)) && !registry.actor.object(zatB29AfTable.get(16));
  }
);

/**
 * todo;
 */
extern(
  "dialogs_zaton.zat_b29_actor_do_not_has_adv_task_af_2",
  (firstSpeaker: GameObject, secondSpeaker: GameObject): boolean => {
    return hasInfoPortion(zatB29InfopTable.get(17)) && !registry.actor.object(zatB29AfTable.get(17));
  }
);

/**
 * todo;
 */
extern(
  "dialogs_zaton.zat_b29_actor_do_not_has_adv_task_af_3",
  (firstSpeaker: GameObject, secondSpeaker: GameObject): boolean => {
    return hasInfoPortion(zatB29InfopTable.get(18)) && !registry.actor.object(zatB29AfTable.get(18));
  }
);

/**
 * todo;
 */
extern(
  "dialogs_zaton.zat_b29_actor_do_not_has_adv_task_af_4",
  (firstSpeaker: GameObject, secondSpeaker: GameObject): boolean => {
    return hasInfoPortion(zatB29InfopTable.get(19)) && !registry.actor.object(zatB29AfTable.get(19));
  }
);

/**
 * todo;
 */
extern(
  "dialogs_zaton.zat_b29_actor_do_not_has_adv_task_af_5",
  (firstSpeaker: GameObject, secondSpeaker: GameObject): boolean => {
    return hasInfoPortion(zatB29InfopTable.get(20)) && !registry.actor.object(zatB29AfTable.get(20));
  }
);

/**
 * todo;
 */
extern(
  "dialogs_zaton.zat_b29_actor_do_not_has_adv_task_af_6",
  (firstSpeaker: GameObject, secondSpeaker: GameObject): boolean => {
    return hasInfoPortion(zatB29InfopTable.get(21)) && !registry.actor.object(zatB29AfTable.get(21));
  }
);

/**
 * todo;
 */
extern(
  "dialogs_zaton.zat_b29_actor_do_not_has_adv_task_af_7",
  (firstSpeaker: GameObject, secondSpeaker: GameObject): boolean => {
    return hasInfoPortion(zatB29InfopTable.get(22)) && !registry.actor.object(zatB29AfTable.get(22));
  }
);

/**
 * todo;
 */
extern(
  "dialogs_zaton.zat_b29_actor_do_not_has_adv_task_af_8",
  (firstSpeaker: GameObject, secondSpeaker: GameObject): boolean => {
    return hasInfoPortion(zatB29InfopTable.get(23)) && !registry.actor.object(zatB29AfTable.get(23));
  }
);

/**
 * todo;
 */
extern(
  "dialogs_zaton.zat_b29_actor_has_adv_task_af_1",
  (firstSpeaker: GameObject, secondSpeaker: GameObject): boolean => {
    return hasInfoPortion(zatB29InfopTable.get(16)) && registry.actor.object(zatB29AfTable.get(16)) !== null;
  }
);

/**
 * todo;
 */
extern(
  "dialogs_zaton.zat_b29_actor_has_adv_task_af_2",
  (firstSpeaker: GameObject, secondSpeaker: GameObject): boolean => {
    return hasInfoPortion(zatB29InfopTable.get(17)) && registry.actor.object(zatB29AfTable.get(17)) !== null;
  }
);

/**
 * todo;
 */
extern(
  "dialogs_zaton.zat_b29_actor_has_adv_task_af_3",
  (firstSpeaker: GameObject, secondSpeaker: GameObject): boolean => {
    return hasInfoPortion(zatB29InfopTable.get(18)) && registry.actor.object(zatB29AfTable.get(18)) !== null;
  }
);

/**
 * todo;
 */
extern(
  "dialogs_zaton.zat_b29_actor_has_adv_task_af_4",
  (firstSpeaker: GameObject, secondSpeaker: GameObject): boolean => {
    return hasInfoPortion(zatB29InfopTable.get(19)) && registry.actor.object(zatB29AfTable.get(19)) !== null;
  }
);

/**
 * todo;
 */
extern(
  "dialogs_zaton.zat_b29_actor_has_adv_task_af_5",
  (firstSpeaker: GameObject, secondSpeaker: GameObject): boolean => {
    return hasInfoPortion(zatB29InfopTable.get(20)) && registry.actor.object(zatB29AfTable.get(20)) !== null;
  }
);

/**
 * todo;
 */
extern(
  "dialogs_zaton.zat_b29_actor_has_adv_task_af_6",
  (firstSpeaker: GameObject, secondSpeaker: GameObject): boolean => {
    return hasInfoPortion(zatB29InfopTable.get(21)) && registry.actor.object(zatB29AfTable.get(21)) !== null;
  }
);

/**
 * todo;
 */
extern(
  "dialogs_zaton.zat_b29_actor_has_adv_task_af_7",
  (firstSpeaker: GameObject, secondSpeaker: GameObject): boolean => {
    return hasInfoPortion(zatB29InfopTable.get(22)) && registry.actor.object(zatB29AfTable.get(22)) !== null;
  }
);

/**
 * todo;
 */
extern(
  "dialogs_zaton.zat_b29_actor_has_adv_task_af_8",
  (firstSpeaker: GameObject, secondSpeaker: GameObject): boolean => {
    return hasInfoPortion(zatB29InfopTable.get(23)) && registry.actor.object(zatB29AfTable.get(23)) !== null;
  }
);

/**
 * todo;
 */
extern(
  "dialogs_zaton.zat_b30_transfer_detector_to_actor",
  (firstSpeaker: GameObject, secondSpeaker: GameObject): void => {
    transferItemsToActor(getNpcSpeaker(firstSpeaker, secondSpeaker), detectors.detector_scientific);
  }
);

/**
 * todo;
 */
extern(
  "dialogs_zaton.zat_b30_give_owls_share_to_actor",
  (firstSpeaker: GameObject, secondSpeaker: GameObject): void => {
    giveMoneyToActor(1_500);
  }
);

/**
 * todo;
 */
extern("dialogs_zaton.zat_b30_actor_has_compass", (firstSpeaker: GameObject, secondSpeaker: GameObject): boolean => {
  return registry.actor.object(artefacts.af_compass) !== null;
});

/**
 * todo;
 */
extern("dialogs_zaton.zat_b30_transfer_af_from_actor", (firstSpeaker: GameObject, secondSpeaker: GameObject): void => {
  transferItemsFromActor(getNpcSpeaker(firstSpeaker, secondSpeaker), artefacts.af_compass);
  giveMoneyToActor(10_000);

  const treasureManager: TreasureManager = TreasureManager.getInstance();

  treasureManager.giveActorTreasureCoordinates("zat_hiding_place_49");
  treasureManager.giveActorTreasureCoordinates("zat_hiding_place_15");
});

/**
 * todo;
 */
extern("dialogs_zaton.zat_b30_barmen_has_percent", (firstSpeaker: GameObject, secondSpeaker: GameObject): boolean => {
  const count: TCount = getPortableStoreValue(ACTOR_ID, "zat_b30_days_cnt", 0);

  return count > 0;
});
/**
 * todo;
 */
extern(
  "dialogs_zaton.zat_b30_barmen_do_not_has_percent",
  (firstSpeaker: GameObject, secondSpeaker: GameObject): boolean => {
    const count: TCount = getPortableStoreValue(ACTOR_ID, "zat_b30_days_cnt", 0);

    return count < 1;
  }
);

/**
 * todo;
 */
extern("dialogs_zaton.zat_b30_actor_has_noah_pda", (firstSpeaker: GameObject, secondSpeaker: GameObject): boolean => {
  return registry.actor.object(questItems.zat_b20_noah_pda) !== null;
});

/**
 * todo;
 */
extern("dialogs_zaton.zat_b30_sell_noah_pda", (firstSpeaker: GameObject, secondSpeaker: GameObject): void => {
  transferItemsFromActor(getNpcSpeaker(firstSpeaker, secondSpeaker), questItems.zat_b20_noah_pda);
  giveMoneyToActor(1000);
});

/**
 * todo;
 */
extern("dialogs_zaton.zat_b40_actor_has_notebook", (firstSpeaker: GameObject, secondSpeaker: GameObject): boolean => {
  return registry.actor.object(questItems.zat_b40_notebook) !== null;
});

/**
 * todo;
 */
extern("dialogs_zaton.zat_b40_actor_has_merc_pda_1", (firstSpeaker: GameObject, secondSpeaker: GameObject): boolean => {
  return registry.actor.object(questItems.zat_b40_pda_1) !== null;
});

/**
 * todo;
 */
extern("dialogs_zaton.zat_b40_actor_has_merc_pda_2", (firstSpeaker: GameObject, secondSpeaker: GameObject): boolean => {
  return registry.actor.object(questItems.zat_b40_pda_2) !== null;
});

/**
 * todo;
 */
extern("dialogs_zaton.if_actor_has_toolkit_3", (firstSpeaker: GameObject, secondSpeaker: GameObject): boolean => {
  return registry.actor.object(misc.toolkit_3) !== null;
});

/**
 * todo;
 */
extern("dialogs_zaton.give_vodka", (firstSpeaker: GameObject, secondSpeaker: GameObject): void => {
  transferItemsFromActor(getNpcSpeaker(firstSpeaker, secondSpeaker), food.vodka);
});

/**
 * todo;
 */
extern("dialogs_zaton.if_actor_has_vodka", (firstSpeaker: GameObject, secondSpeaker: GameObject): boolean => {
  return registry.actor.object(food.vodka) !== null;
});

/**
 * todo;
 */
extern(
  "dialogs_zaton.actor_has_more_then_need_money_to_buy_battery",
  (firstSpeaker: GameObject, secondSpeaker: GameObject): boolean => {
    return registry.actor.money() >= 2000;
  }
);

/**
 * todo;
 */
extern(
  "dialogs_zaton.actor_has_less_then_need_money_to_buy_battery",
  (firstSpeaker: GameObject, secondSpeaker: GameObject): boolean => {
    return registry.actor.money() < 2000;
  }
);

/**
 * todo;
 */
extern(
  "dialogs_zaton.relocate_need_money_to_buy_battery",
  (firstSpeaker: GameObject, secondSpeaker: GameObject): void => {
    transferMoneyFromActor(getNpcSpeaker(firstSpeaker, secondSpeaker), 2000);
  }
);

/**
 * todo;
 */
extern("dialogs_zaton.give_actor_battery", (firstSpeaker: GameObject, secondSpeaker: GameObject): void => {
  transferItemsToActor(getNpcSpeaker(firstSpeaker, secondSpeaker), ammo.ammo_gauss_cardan);
});

/**
 * todo;
 */
extern("dialogs_zaton.give_actor_zat_a23_access_card", (firstSpeaker: GameObject, secondSpeaker: GameObject): void => {
  transferItemsToActor(getNpcSpeaker(firstSpeaker, secondSpeaker), questItems.zat_a23_access_card);
});

/**
 * todo;
 */
extern("dialogs_zaton.give_zat_a23_gauss_rifle_docs", (firstSpeaker: GameObject, secondSpeaker: GameObject): void => {
  transferItemsFromActor(getNpcSpeaker(firstSpeaker, secondSpeaker), questItems.zat_a23_gauss_rifle_docs);
});

/**
 * todo;
 */
extern("dialogs_zaton.return_zat_a23_gauss_rifle_docs", (firstSpeaker: GameObject, secondSpeaker: GameObject): void => {
  transferItemsToActor(getNpcSpeaker(firstSpeaker, secondSpeaker), questItems.zat_a23_gauss_rifle_docs);
});

/**
 * todo;
 */
extern(
  "dialogs_zaton.if_actor_has_zat_a23_gauss_rifle_docs",
  (firstSpeaker: GameObject, secondSpeaker: GameObject): boolean => {
    return firstSpeaker.object(questItems.zat_a23_gauss_rifle_docs) !== null;
  }
);

/**
 * todo;
 */
extern("dialogs_zaton.if_actor_has_gauss_rifle", (firstSpeaker: GameObject, secondSpeaker: GameObject): boolean => {
  return firstSpeaker.object(questItems.pri_a17_gauss_rifle) !== null;
});

/**
 * todo;
 */
extern("dialogs_zaton.give_tech_gauss_rifle", (firstSpeaker: GameObject, secondSpeaker: GameObject): void => {
  transferItemsFromActor(getNpcSpeaker(firstSpeaker, secondSpeaker), questItems.pri_a17_gauss_rifle);
});

/**
 * todo;
 */
extern("dialogs_zaton.give_actor_repaired_gauss_rifle", (firstSpeaker: GameObject, secondSpeaker: GameObject): void => {
  transferItemsToActor(getNpcSpeaker(firstSpeaker, secondSpeaker), weapons.wpn_gauss);
});

/**
 * todo;
 */
extern(
  "dialogs_zaton.zat_b215_actor_has_money_poor",
  (firstSpeaker: GameObject, secondSpeaker: GameObject): boolean => {
    return registry.actor.money() >= 1000;
  }
);

/**
 * todo;
 */
extern(
  "dialogs_zaton.zat_b215_actor_has_no_money_poor",
  (firstSpeaker: GameObject, secondSpeaker: GameObject): boolean => {
    return registry.actor.money() < 1000;
  }
);

/**
 * todo;
 */
extern(
  "dialogs_zaton.zat_b215_actor_has_money_poor_pripyat",
  (firstSpeaker: GameObject, secondSpeaker: GameObject): boolean => {
    return registry.actor.money() >= 4000;
  }
);

/**
 * todo;
 */
extern(
  "dialogs_zaton.zat_b215_actor_has_no_money_poor_pripyat",
  (firstSpeaker: GameObject, secondSpeaker: GameObject): boolean => {
    return registry.actor.money() < 4000;
  }
);

/**
 * todo;
 */
extern(
  "dialogs_zaton.zat_b215_actor_has_money_rich",
  (firstSpeaker: GameObject, secondSpeaker: GameObject): boolean => {
    return registry.actor.money() >= 3000;
  }
);

/**
 * todo;
 */
extern(
  "dialogs_zaton.zat_b215_actor_has_no_money_rich",
  (firstSpeaker: GameObject, secondSpeaker: GameObject): boolean => {
    return registry.actor.money() < 3000;
  }
);

/**
 * todo;
 */
extern(
  "dialogs_zaton.zat_b215_actor_has_money_rich_pripyat",
  (firstSpeaker: GameObject, secondSpeaker: GameObject): boolean => {
    return registry.actor.money() >= 6000;
  }
);

/**
 * todo;
 */
extern(
  "dialogs_zaton.zat_b215_actor_has_no_money_rich_pripyat",
  (firstSpeaker: GameObject, secondSpeaker: GameObject): boolean => {
    return registry.actor.money() < 6000;
  }
);

/**
 * todo;
 */
extern("dialogs_zaton.zat_b215_relocate_money_poor", (firstSpeaker: GameObject, secondSpeaker: GameObject): void => {
  transferMoneyFromActor(getNpcSpeaker(firstSpeaker, secondSpeaker), 1000);
});

/**
 * todo;
 */
extern(
  "dialogs_zaton.zat_b215_relocate_money_poor_pripyat",
  (firstSpeaker: GameObject, secondSpeaker: GameObject): void => {
    transferMoneyFromActor(getNpcSpeaker(firstSpeaker, secondSpeaker), 4000);
  }
);

/**
 * todo;
 */
extern("dialogs_zaton.zat_b215_relocate_money_rich", (firstSpeaker: GameObject, secondSpeaker: GameObject): void => {
  transferMoneyFromActor(getNpcSpeaker(firstSpeaker, secondSpeaker), 3000);
});

/**
 * todo;
 */
extern(
  "dialogs_zaton.zat_b215_relocate_money_rich_pripyat",
  (firstSpeaker: GameObject, secondSpeaker: GameObject): void => {
    transferMoneyFromActor(getNpcSpeaker(firstSpeaker, secondSpeaker), 6000);
  }
);

/**
 * todo;
 */
extern("dialogs_zaton.zat_b44_actor_has_pda_global", (firstSpeaker: GameObject, secondSpeaker: GameObject): boolean => {
  return (
    registry.actor.object(questItems.zat_b39_joker_pda) !== null ||
    registry.actor.object(questItems.zat_b44_barge_pda) !== null
  );
});

/**
 * todo;
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
 * todo;
 */
extern("dialogs_zaton.zat_b44_actor_has_pda_barge", (firstSpeaker: GameObject, secondSpeaker: GameObject): boolean => {
  return registry.actor.object(questItems.zat_b44_barge_pda) !== null;
});

/**
 * todo;
 */
extern("dialogs_zaton.zat_b44_actor_has_pda_joker", (firstSpeaker: GameObject, secondSpeaker: GameObject): boolean => {
  return registry.actor.object(questItems.zat_b39_joker_pda) !== null;
});

/**
 * todo;
 */
extern("dialogs_zaton.zat_b44_actor_has_pda_both", (firstSpeaker: GameObject, secondSpeaker: GameObject): boolean => {
  return (
    registry.actor.object(questItems.zat_b39_joker_pda) !== null &&
    registry.actor.object(questItems.zat_b44_barge_pda) !== null
  );
});

/**
 * todo;
 */
extern("dialogs_zaton.zat_b44_transfer_pda_barge", (firstSpeaker: GameObject, secondSpeaker: GameObject): void => {
  transferItemsFromActor(getNpcSpeaker(firstSpeaker, secondSpeaker), questItems.zat_b44_barge_pda);
});

/**
 * todo;
 */
extern("dialogs_zaton.zat_b44_transfer_pda_joker", (firstSpeaker: GameObject, secondSpeaker: GameObject): void => {
  transferItemsFromActor(getNpcSpeaker(firstSpeaker, secondSpeaker), questItems.zat_b39_joker_pda);
});

/**
 * todo;
 */
extern("dialogs_zaton.zat_b44_transfer_pda_both", (firstSpeaker: GameObject, secondSpeaker: GameObject): void => {
  transferItemsFromActor(getNpcSpeaker(firstSpeaker, secondSpeaker), questItems.zat_b44_barge_pda);
  transferItemsFromActor(getNpcSpeaker(firstSpeaker, secondSpeaker), questItems.zat_b39_joker_pda);
});

/**
 * todo;
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
 * todo;
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
 * todo;
 */
extern("dialogs_zaton.zat_b53_transfer_medkit_to_npc", (firstSpeaker: GameObject, secondSpeaker: GameObject): void => {
  let section: Optional<TDrugItem> = null;
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
  NotificationManager.getInstance().sendItemRelocatedNotification(ENotificationDirection.OUT, section, 1);
  actor.change_character_reputation(10);
});

/**
 * todo;
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
 * todo;
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
 * todo;
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
 * todo;
 */
extern(
  "dialogs_zaton.zat_b53_transfer_detector_advanced_to_actor",
  (firstSpeaker: GameObject, secondSpeaker: GameObject): void => {
    transferItemsToActor(getNpcSpeaker(firstSpeaker, secondSpeaker), detectors.detector_advanced);
  }
);

/**
 * todo;
 */
extern(
  "dialogs_zaton.zat_b53_transfer_fireball_to_actor",
  (firstSpeaker: GameObject, secondSpeaker: GameObject): void => {
    transferItemsToActor(getNpcSpeaker(firstSpeaker, secondSpeaker), artefacts.af_fireball);
  }
);

/**
 * todo;
 */
extern(
  "dialogs_zaton.zat_b53_transfer_medkit_to_actor",
  (firstSpeaker: GameObject, secondSpeaker: GameObject): void => {
    transferItemsToActor(getNpcSpeaker(firstSpeaker, secondSpeaker), drugs.medkit);
  }
);

/**
 * todo;
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
 * todo;
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
 * todo;
 */
extern("dialogs_zaton.zat_b106_transfer_weap_to_actor", (firstSpeaker: GameObject, secondSpeaker: GameObject): void => {
  transferItemsToActor(getNpcSpeaker(firstSpeaker, secondSpeaker), weapons.wpn_spas12);
});

/**
 * todo;
 */
extern("dialogs_zaton.zat_b106_give_reward", (firstSpeaker: GameObject, secondSpeaker: GameObject): void => {
  TreasureManager.giveTreasureCoordinates("zat_hiding_place_50");
});

/**
 * todo;
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
 * todo;
 */
extern("dialogs_zaton.zat_b106_soroka_gone", (firstSpeaker: GameObject, secondSpeaker: GameObject): boolean => {
  return (
    hasInfoPortion(infoPortions.jup_b25_flint_blame_done_to_duty) ||
    hasInfoPortion(infoPortions.jup_b25_flint_blame_done_to_freedom)
  );
});

/**
 * todo;
 */
extern("dialogs_zaton.zat_b106_soroka_not_gone", (firstSpeaker: GameObject, secondSpeaker: GameObject): boolean => {
  return !getExtern<AnyCallable>("zat_b106_soroka_gone", getExtern("dialogs_zaton"))(firstSpeaker, secondSpeaker);
});

/**
 * todo;
 */
extern("dialogs_zaton.zat_b22_actor_has_proof", (firstSpeaker: GameObject, secondSpeaker: GameObject): boolean => {
  return actorHasItem(infoPortions.zat_b22_medic_pda);
});

/**
 * todo;
 */
extern("dialogs_zaton.zat_b22_transfer_proof", (firstSpeaker: GameObject, secondSpeaker: GameObject): void => {
  transferItemsFromActor(getNpcSpeaker(firstSpeaker, secondSpeaker), infoPortions.zat_b22_medic_pda);
});

/**
 * todo;
 */
extern("dialogs_zaton.zat_b5_stalker_transfer_money", (firstSpeaker: GameObject, secondSpeaker: GameObject): void => {
  giveMoneyToActor(2500);
  TreasureManager.giveTreasureCoordinates("zat_hiding_place_7");
});

/**
 * todo;
 */
extern("dialogs_zaton.zat_b5_dealer_full_revard", (firstSpeaker: GameObject, secondSpeaker: GameObject): void => {
  giveMoneyToActor(6_000);
});

/**
 * todo;
 */
extern("dialogs_zaton.zat_b5_dealer_easy_revard", (firstSpeaker: GameObject, secondSpeaker: GameObject): void => {
  giveMoneyToActor(3_000);
});

/**
 * todo;
 */
extern("dialogs_zaton.zat_b5_bandits_revard", (firstSpeaker: GameObject, secondSpeaker: GameObject): void => {
  giveMoneyToActor(5_000);
  TreasureManager.giveTreasureCoordinates("zat_hiding_place_20");
});

/**
 * todo;
 */
extern(
  "dialogs_zaton.zat_a23_actor_has_access_card",
  (firstSpeaker: GameObject, secondSpeaker: GameObject): boolean => {
    return registry.actor.object(questItems.zat_a23_access_card) !== null;
  }
);

/**
 * todo;
 */
extern(
  "dialogs_zaton.zat_a23_transfer_access_card_to_tech",
  (firstSpeaker: GameObject, secondSpeaker: GameObject): void => {
    transferItemsFromActor(getNpcSpeaker(firstSpeaker, secondSpeaker), questItems.zat_a23_access_card);
    transferItemsToActor(getNpcSpeaker(firstSpeaker, secondSpeaker), drugs.medkit_scientic, 3);
  }
);

/**
 * todo;
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
 * todo;
 */
extern("dialogs_zaton.actor_has_gas", (firstSpeaker: GameObject, secondSpeaker: GameObject): boolean => {
  return registry.actor.object(questItems.zat_b57_gas) !== null;
});

/**
 * todo;
 */
extern("dialogs_zaton.actor_has_not_gas", (firstSpeaker: GameObject, secondSpeaker: GameObject): boolean => {
  return !getExtern<AnyCallable>("actor_has_gas", getExtern("dialogs_zaton"))(firstSpeaker, secondSpeaker);
});

/**
 * todo;
 */
extern("dialogs_zaton.zat_b57_actor_has_money", (firstSpeaker: GameObject, secondSpeaker: GameObject): boolean => {
  return registry.actor.money() >= 2000;
});

/**
 * todo;
 */
extern("dialogs_zaton.zat_b57_actor_hasnt_money", (firstSpeaker: GameObject, secondSpeaker: GameObject): boolean => {
  return !getExtern<AnyCallable>("zat_b57_actor_has_money", getExtern("dialogs_zaton"))(firstSpeaker, secondSpeaker);
});

/**
 * todo;
 */
extern("dialogs_zaton.zat_b57_transfer_gas_money", (firstSpeaker: GameObject, secondSpeaker: GameObject): void => {
  transferMoneyFromActor(getNpcSpeaker(firstSpeaker, secondSpeaker), 2000);
});
