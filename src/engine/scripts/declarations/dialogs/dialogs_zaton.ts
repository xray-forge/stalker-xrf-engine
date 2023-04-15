/* eslint @typescript-eslint/explicit-function-return-type: "error" */

import { alife, game, level, XR_game_object } from "xray16";

import { registry } from "@/engine/core/database";
import { portableStoreGet, portableStoreSet } from "@/engine/core/database/portable_store";
import { ENotificationDirection, NotificationManager } from "@/engine/core/managers/notifications";
import { TreasureManager } from "@/engine/core/managers/TreasureManager";
import { getExtern } from "@/engine/core/utils/binding";
import { isSquadExisting } from "@/engine/core/utils/check/check";
import { disableInfo, giveInfo, hasAlifeInfo } from "@/engine/core/utils/info_portion";
import { LuaLogger } from "@/engine/core/utils/logging";
import {
  actorHasAtLeastOneItem,
  actorHasItem,
  getNpcSpeaker,
  giveItemsToActor,
  giveMoneyToActor,
  isObjectName,
  npcHasItem,
  transferItemsFromActor,
  transferItemsToActor,
  transferMoneyFromActor,
} from "@/engine/core/utils/task_reward";
import { captions } from "@/engine/lib/constants/captions/captions";
import { infoPortions, TInfoPortion } from "@/engine/lib/constants/info_portions/info_portions";
import { TInventoryItem } from "@/engine/lib/constants/items";
import { ammo } from "@/engine/lib/constants/items/ammo";
import { artefacts, TArtefact } from "@/engine/lib/constants/items/artefacts";
import { detectors } from "@/engine/lib/constants/items/detectors";
import { drugs, TDrugItem } from "@/engine/lib/constants/items/drugs";
import { food, TFoodItem } from "@/engine/lib/constants/items/food";
import { helmets } from "@/engine/lib/constants/items/helmets";
import { misc } from "@/engine/lib/constants/items/misc";
import { outfits } from "@/engine/lib/constants/items/outfits";
import { quest_items } from "@/engine/lib/constants/items/quest_items";
import { TWeapon, weapons } from "@/engine/lib/constants/items/weapons";
import { treasures } from "@/engine/lib/constants/treasures";
import { AnyCallablesModule, AnyObject, LuaArray, Optional, TCount, TSection } from "@/engine/lib/types";

const logger: LuaLogger = new LuaLogger($filename);

/**
 * todo;
 */
export function zat_b30_owl_stalker_trader_actor_has_item_to_sell(
  firstSpeaker: XR_game_object,
  secondSpeaker: XR_game_object
): boolean {
  const itemsTable: LuaArray<TInventoryItem> = [
    quest_items.zat_b20_noah_pda,
    quest_items.zat_b40_notebook,
    quest_items.zat_b40_pda_1,
    quest_items.zat_b40_pda_2,
    quest_items.pri_b36_monolith_hiding_place_pda,
    quest_items.pri_b306_envoy_pda,
    quest_items.jup_b46_duty_founder_pda,
    quest_items.jup_b207_merc_pda_with_contract,
    quest_items.device_pda_zat_b5_dealer,
    quest_items.jup_b10_notes_01,
    quest_items.jup_b10_notes_02,
    quest_items.jup_b10_notes_03,
    quest_items.jup_a9_evacuation_info,
    quest_items.jup_a9_meeting_info,
    quest_items.jup_a9_losses_info,
    quest_items.jup_a9_delivery_info,
    quest_items.zat_b12_documents_1,
    quest_items.zat_b12_documents_2,
    quest_items.device_flash_snag,
    quest_items.jup_b202_bandit_pda,
    quest_items.device_pda_port_bandit_leader,
    quest_items.jup_b10_ufo_memory_2,
    // -- no sell
    quest_items.jup_b1_half_artifact,
    artefacts.af_quest_b14_twisted,
    artefacts.af_oasis_heart,
    detectors.detector_scientific,
  ] as unknown as LuaArray<TInventoryItem>;

  const infoPortionsTable = {
    [quest_items.jup_b1_half_artifact]: infoPortions.zat_b30_owl_stalker_about_halfart_jup_b6_asked,
    [artefacts.af_quest_b14_twisted]: infoPortions.zat_b30_owl_stalker_about_halfart_zat_b14_asked,
    [artefacts.af_oasis_heart]: infoPortions.zat_b30_owl_stalker_trader_about_osis_art,
    [detectors.detector_scientific]: infoPortions.zat_b30_owl_detectors_approached,
  } as unknown as LuaTable<TInventoryItem, TInfoPortion>;

  const actor: XR_game_object = registry.actor;

  for (const [k, v] of itemsTable) {
    if (actor.object(v) !== null) {
      if (v === detectors.detector_scientific && !hasAlifeInfo(infoPortions.zat_b30_second_detector)) {
        // --
      } else {
        if (infoPortionsTable.get(v) !== null) {
          if (!hasAlifeInfo(infoPortionsTable.get(v))) {
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

/**
 * todo;
 */
export function zat_b30_owl_can_say_about_heli(firstSpeaker: XR_game_object, secondSpeaker: XR_game_object): boolean {
  const table = [
    infoPortions.zat_b28_heli_3_searched,
    infoPortions.zat_b100_heli_2_searched,
    infoPortions.zat_b101_heli_5_searched,
  ] as unknown as LuaArray<TInfoPortion>;

  const table2 = [
    infoPortions.zat_b30_owl_scat_1,
    infoPortions.zat_b30_owl_scat_2,
    infoPortions.zat_b30_owl_scat_3,
  ] as unknown as LuaArray<TInfoPortion>;

  let cnt: TCount = 3;

  for (const k of $range(1, table.length())) {
    if (hasAlifeInfo(table.get(k)) || hasAlifeInfo(table2.get(k))) {
      cnt = cnt - 1;
    }
  }

  return cnt > 0;
}

/**
 * todo;
 */
export function zat_b30_actor_has_1000(firstSpeaker: XR_game_object, secondSpeaker: XR_game_object): boolean {
  return registry.actor.money() >= 1000;
}

/**
 * todo;
 */
export function zat_b30_actor_has_200(firstSpeaker: XR_game_object, secondSpeaker: XR_game_object): boolean {
  return registry.actor.money() >= 200;
}

/**
 * todo;
 */
export function zat_b30_actor_has_pri_b36_monolith_hiding_place_pda(
  firstSpeaker: XR_game_object,
  secondSpeaker: XR_game_object
): boolean {
  return registry.actor.object(quest_items.pri_b36_monolith_hiding_place_pda) !== null;
}

/**
 * todo;
 */
export function zat_b30_actor_has_pri_b306_envoy_pda(
  firstSpeaker: XR_game_object,
  secondSpeaker: XR_game_object
): boolean {
  return registry.actor.object(quest_items.pri_b306_envoy_pda) !== null;
}

/**
 * todo;
 */
export function zat_b30_actor_has_jup_b10_strelok_notes_1(
  firstSpeaker: XR_game_object,
  secondSpeaker: XR_game_object
): boolean {
  return registry.actor.object(quest_items.jup_b10_notes_01) !== null;
}

/**
 * todo;
 */
export function zat_b30_actor_has_jup_b10_strelok_notes_2(
  firstSpeaker: XR_game_object,
  secondSpeaker: XR_game_object
): boolean {
  return registry.actor.object(quest_items.jup_b10_notes_02) !== null;
}

/**
 * todo;
 */
export function zat_b30_actor_has_jup_b10_strelok_notes_3(
  firstSpeaker: XR_game_object,
  secondSpeaker: XR_game_object
): boolean {
  return registry.actor.object(quest_items.jup_b10_notes_03) !== null;
}

/**
 * todo;
 */
export function zat_b30_actor_has_detector_scientific(
  firstSpeaker: XR_game_object,
  secondSpeaker: XR_game_object
): boolean {
  return registry.actor.object(detectors.detector_scientific) !== null;
}

/**
 * todo;
 */
export function zat_b30_actor_has_device_flash_snag(
  firstSpeaker: XR_game_object,
  secondSpeaker: XR_game_object
): boolean {
  return registry.actor.object(quest_items.device_flash_snag) !== null;
}

/**
 * todo;
 */
export function zat_b30_actor_has_device_pda_port_bandit_leader(
  firstSpeaker: XR_game_object,
  secondSpeaker: XR_game_object
): boolean {
  return registry.actor.object(quest_items.device_pda_port_bandit_leader) !== null;
}

/**
 * todo;
 */
export function zat_b30_actor_has_jup_b10_ufo_memory(
  firstSpeaker: XR_game_object,
  secondSpeaker: XR_game_object
): boolean {
  return registry.actor.object(quest_items.jup_b10_ufo_memory_2) !== null;
}

/**
 * todo;
 */
export function zat_b30_actor_has_jup_b202_bandit_pda(
  firstSpeaker: XR_game_object,
  secondSpeaker: XR_game_object
): boolean {
  return registry.actor.object(quest_items.jup_b202_bandit_pda) !== null;
}

/**
 * todo;
 */
export function zat_b30_transfer_1000(firstSpeaker: XR_game_object, secondSpeaker: XR_game_object): void {
  transferMoneyFromActor(getNpcSpeaker(firstSpeaker, secondSpeaker), 1000);
}

/**
 * todo;
 */
export function zat_b30_transfer_200(firstSpeaker: XR_game_object, secondSpeaker: XR_game_object): void {
  transferMoneyFromActor(getNpcSpeaker(firstSpeaker, secondSpeaker), 200);
}

/**
 * todo;
 */
export function zat_b30_sell_pri_b36_monolith_hiding_place_pda(
  firstSpeaker: XR_game_object,
  secondSpeaker: XR_game_object
): void {
  transferItemsFromActor(getNpcSpeaker(firstSpeaker, secondSpeaker), quest_items.pri_b36_monolith_hiding_place_pda);
  giveMoneyToActor(5000);
}

/**
 * todo;
 */
export function zat_b30_sell_pri_b306_envoy_pda(firstSpeaker: XR_game_object, secondSpeaker: XR_game_object): void {
  transferItemsFromActor(getNpcSpeaker(firstSpeaker, secondSpeaker), quest_items.pri_b306_envoy_pda);
  giveMoneyToActor(4000);
}

/**
 * todo;
 */
export function zat_b30_sell_jup_b207_merc_pda_with_contract(
  firstSpeaker: XR_game_object,
  secondSpeaker: XR_game_object
): void {
  transferItemsFromActor(getNpcSpeaker(firstSpeaker, secondSpeaker), quest_items.jup_b207_merc_pda_with_contract);
  giveMoneyToActor(1000);
  giveInfo(infoPortions.jup_b207_merc_pda_with_contract_sold);
}

/**
 * todo;
 */
export function zat_b30_sell_jup_b10_strelok_notes_1(
  firstSpeaker: XR_game_object,
  secondSpeaker: XR_game_object
): void {
  transferItemsFromActor(getNpcSpeaker(firstSpeaker, secondSpeaker), quest_items.jup_b10_notes_01);
  giveMoneyToActor(500);
}

/**
 * todo;
 */
export function zat_b30_sell_jup_b10_strelok_notes_2(
  firstSpeaker: XR_game_object,
  secondSpeaker: XR_game_object
): void {
  transferItemsFromActor(getNpcSpeaker(firstSpeaker, secondSpeaker), quest_items.jup_b10_notes_02);
  giveMoneyToActor(500);
}

/**
 * todo;
 */
export function zat_b30_sell_jup_b10_strelok_notes_3(
  firstSpeaker: XR_game_object,
  secondSpeaker: XR_game_object
): void {
  transferItemsFromActor(getNpcSpeaker(firstSpeaker, secondSpeaker), quest_items.jup_b10_notes_03);
  giveMoneyToActor(500);
}

/**
 * todo;
 */
export function jup_a9_owl_stalker_trader_sell_jup_a9_evacuation_info(
  firstSpeaker: XR_game_object,
  secondSpeaker: XR_game_object
): void {
  transferItemsFromActor(getNpcSpeaker(firstSpeaker, secondSpeaker), quest_items.jup_a9_evacuation_info);
  giveMoneyToActor(750);
  giveInfo(infoPortions.jup_a9_evacuation_info_sold);
}

/**
 * todo;
 */
export function jup_a9_owl_stalker_trader_sell_jup_a9_meeting_info(
  firstSpeaker: XR_game_object,
  secondSpeaker: XR_game_object
): void {
  transferItemsFromActor(getNpcSpeaker(firstSpeaker, secondSpeaker), quest_items.jup_a9_meeting_info);
  giveMoneyToActor(750);
  giveInfo(infoPortions.jup_a9_meeting_info_sold);
}

/**
 * todo;
 */
export function jup_a9_owl_stalker_trader_sell_jup_a9_losses_info(
  firstSpeaker: XR_game_object,
  secondSpeaker: XR_game_object
): void {
  transferItemsFromActor(getNpcSpeaker(firstSpeaker, secondSpeaker), quest_items.jup_a9_losses_info);
  giveMoneyToActor(750);
  giveInfo(infoPortions.jup_a9_losses_info_sold);
}

/**
 * todo;
 */
export function jup_a9_owl_stalker_trader_sell_jup_a9_delivery_info(
  firstSpeaker: XR_game_object,
  secondSpeaker: XR_game_object
): void {
  transferItemsFromActor(getNpcSpeaker(firstSpeaker, secondSpeaker), quest_items.jup_a9_delivery_info);
  giveMoneyToActor(750);
  giveInfo(infoPortions.jup_a9_delivery_info_sold);
}

/**
 * todo;
 */
export function zat_b30_owl_stalker_trader_sell_device_flash_snag(
  firstSpeaker: XR_game_object,
  secondSpeaker: XR_game_object
): void {
  transferItemsFromActor(getNpcSpeaker(firstSpeaker, secondSpeaker), quest_items.device_flash_snag);
  giveMoneyToActor(200);
  registry.actor.give_info_portion(infoPortions.device_flash_snag_sold);
}

/**
 * todo;
 */
export function zat_b30_owl_stalker_trader_sell_device_pda_port_bandit_leader(
  firstSpeaker: XR_game_object,
  secondSpeaker: XR_game_object
): void {
  transferItemsFromActor(getNpcSpeaker(firstSpeaker, secondSpeaker), quest_items.device_pda_port_bandit_leader);
  giveMoneyToActor(1000);
  giveInfo(infoPortions.device_pda_port_bandit_leader_sold);
}

/**
 * todo;
 */
export function zat_b30_owl_stalker_trader_sell_jup_b10_ufo_memory(
  firstSpeaker: XR_game_object,
  secondSpeaker: XR_game_object
): void {
  transferItemsFromActor(getNpcSpeaker(firstSpeaker, secondSpeaker), quest_items.jup_b10_ufo_memory_2);
  giveMoneyToActor(500);
  giveInfo(infoPortions.jup_b10_ufo_memory_2_sold);
}

/**
 * todo;
 */
export function zat_b30_owl_stalker_trader_sell_jup_b202_bandit_pda(
  firstSpeaker: XR_game_object,
  secondSpeaker: XR_game_object
): void {
  transferItemsFromActor(getNpcSpeaker(firstSpeaker, secondSpeaker), quest_items.jup_b202_bandit_pda);
  giveMoneyToActor(500);
}

/**
 * todo;
 */
export function zat_b14_bar_transfer_money(firstSpeaker: XR_game_object, secondSpeaker: XR_game_object): void {
  giveMoneyToActor(1000);
}

/**
 * todo;
 */
export function zat_b14_transfer_artefact(firstSpeaker: XR_game_object, secondSpeaker: XR_game_object): void {
  transferItemsFromActor(getNpcSpeaker(firstSpeaker, secondSpeaker), artefacts.af_quest_b14_twisted);
}

/**
 * todo;
 */
export function actor_has_artefact(firstSpeaker: XR_game_object, secondSpeaker: XR_game_object): boolean {
  return firstSpeaker.object(artefacts.af_quest_b14_twisted) !== null;
}

/**
 * todo;
 */
export function actor_hasnt_artefact(firstSpeaker: XR_game_object, secondSpeaker: XR_game_object): boolean {
  return !actor_has_artefact(firstSpeaker, secondSpeaker);
}

/**
 * todo;
 */
export function zat_b7_give_bandit_reward_to_actor(firstSpeaker: XR_game_object, secondSpeaker: XR_game_object): void {
  giveMoneyToActor(math.random(15, 30) * 100);
  TreasureManager.getInstance().giveActorTreasureCoordinates(treasures.zat_hiding_place_30);
}

/**
 * todo;
 */
export function zat_b7_give_stalker_reward_to_actor(firstSpeaker: XR_game_object, secondSpeaker: XR_game_object): void {
  const reward = math.random(1, 3);

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

  TreasureManager.giveActorTreasureCoordinates(treasures.zat_hiding_place_29);
}

/**
 * todo;
 */
export function zat_b7_give_stalker_reward_2_to_actor(
  firstSpeaker: XR_game_object,
  secondSpeaker: XR_game_object
): void {
  transferItemsToActor(getNpcSpeaker(firstSpeaker, secondSpeaker), drugs.bandage, 4);
  transferItemsToActor(getNpcSpeaker(firstSpeaker, secondSpeaker), drugs.medkit, 2);
  transferItemsToActor(getNpcSpeaker(firstSpeaker, secondSpeaker), drugs.antirad, 2);
}

/**
 * todo;
 */
export function zat_b7_rob_actor(firstSpeaker: XR_game_object, secondSpeaker: XR_game_object): void {
  let amount = math.floor((registry.actor.money() * math.random(75, 100)) / 100);

  if (registry.actor.money() < amount) {
    amount = registry.actor.money();
  }

  transferMoneyFromActor(getNpcSpeaker(firstSpeaker, secondSpeaker), amount);
}

/**
 * todo;
 */
export function zat_b7_killed_self_precond(firstSpeaker: XR_game_object, secondSpeaker: XR_game_object): boolean {
  if (
    hasAlifeInfo(infoPortions.zat_b7_stalkers_raiders_meet) ||
    hasAlifeInfo(infoPortions.zat_b7_victims_disappeared)
  ) {
    return false;
  }

  return !isSquadExisting("zat_b7_stalkers_victims_1");
}

/**
 * todo;
 */
export function zat_b7_squad_alive(firstSpeaker: XR_game_object, secondSpeaker: XR_game_object): boolean {
  return isSquadExisting("zat_b7_stalkers_victims_1");
}

/**
 * todo;
 */
export function zat_b103_transfer_merc_supplies(firstSpeaker: XR_game_object, secondSpeaker: XR_game_object): void {
  const npc: XR_game_object = getNpcSpeaker(firstSpeaker, secondSpeaker);
  const actor: XR_game_object = registry.actor;
  let it: TCount = 6;

  const newsManager: NotificationManager = NotificationManager.getInstance();
  const itemSections: LuaArray<TFoodItem> = [food.conserva, food.kolbasa, food.bread] as unknown as LuaArray<TFoodItem>;

  for (const [k, section] of itemSections) {
    const j = it;

    actor.iterate_inventory((temp, item) => {
      if (item.section() === section && it !== 0) {
        actor.transfer_item(item, npc);
        it = it - 1;
      }
    }, actor);

    if (j - it !== 0) {
      newsManager.sendItemRelocatedNotification(ENotificationDirection.OUT, section, j - it);
    }
  }
}

/**
 * todo;
 */
export function zat_b33_set_counter_10(firstSpeaker: XR_game_object, secondSpeaker: XR_game_object): void {
  const actor = registry.actor;

  getExtern<AnyCallablesModule>("xr_effects").set_counter(actor, null, ["zat_b33_items", 10]);
}

/**
 * todo;
 */
export function zat_b33_counter_ge_2(firstSpeaker: XR_game_object, secondSpeaker: XR_game_object): boolean {
  const actor = registry.actor;

  return portableStoreGet(actor, "zat_b33_items", 0 as number) >= 2;
}

/**
 * todo;
 */
export function zat_b33_counter_ge_4(firstSpeaker: XR_game_object, secondSpeaker: XR_game_object): boolean {
  const actor = registry.actor;

  return portableStoreGet(actor, "zat_b33_items", 0 as number) >= 4;
}

/**
 * todo;
 */
export function zat_b33_counter_ge_8(firstSpeaker: XR_game_object, secondSpeaker: XR_game_object): boolean {
  const actor = registry.actor;

  return portableStoreGet(actor, "zat_b33_items", 0 as number) >= 8;
}

/**
 * todo;
 */
export function zat_b33_counter_le_2(firstSpeaker: XR_game_object, secondSpeaker: XR_game_object): boolean {
  return !zat_b33_counter_ge_2(firstSpeaker, secondSpeaker);
}

/**
 * todo;
 */
export function zat_b33_counter_le_4(firstSpeaker: XR_game_object, secondSpeaker: XR_game_object): boolean {
  return !zat_b33_counter_ge_4(firstSpeaker, secondSpeaker);
}

/**
 * todo;
 */
export function zat_b33_counter_le_8(firstSpeaker: XR_game_object, secondSpeaker: XR_game_object): boolean {
  return !zat_b33_counter_ge_8(firstSpeaker, secondSpeaker);
}

/**
 * todo;
 */
export function zat_b33_counter_de_2(firstSpeaker: XR_game_object, secondSpeaker: XR_game_object): boolean {
  const actor = registry.actor;

  return getExtern<AnyCallablesModule>("xr_effects").dec_counter(actor, null, ["zat_b33_items", 2]);
}

/**
 * todo;
 */
export function zat_b33_counter_de_4(firstSpeaker: XR_game_object, secondSpeaker: XR_game_object): boolean {
  const actor = registry.actor;

  return getExtern<AnyCallablesModule>("xr_effects").dec_counter(actor, null, ["zat_b33_items", 4]);
}

/**
 * todo;
 */
export function zat_b33_counter_de_8(firstSpeaker: XR_game_object, secondSpeaker: XR_game_object): boolean {
  const actor = registry.actor;

  return getExtern<AnyCallablesModule>("xr_effects").dec_counter(actor, null, ["zat_b33_items", 8]);
}

/**
 * todo;
 */
export function zat_b33_counter_eq_10(firstSpeaker: XR_game_object, secondSpeaker: XR_game_object): boolean {
  const actor = registry.actor;

  return portableStoreGet(actor, "zat_b33_items", 0 as number) === 10;
}

/**
 * todo;
 */
export function zat_b33_counter_ne_10(firstSpeaker: XR_game_object, secondSpeaker: XR_game_object): boolean {
  return !zat_b33_counter_eq_10(firstSpeaker, secondSpeaker);
}

/**
 * todo;
 */
export function zat_b103_transfer_mechanic_toolkit_2(
  firstSpeaker: XR_game_object,
  secondSpeaker: XR_game_object
): void {
  transferItemsFromActor(getNpcSpeaker(firstSpeaker, secondSpeaker), misc.toolkit_2);
}

/**
 * todo;
 */
export function check_npc_name_mechanics(firstSpeaker: XR_game_object, secondSpeaker: XR_game_object): boolean {
  return (
    !isObjectName(secondSpeaker, "mechanic") &&
    !isObjectName(secondSpeaker, "zat_b103_lost_merc") &&
    !isObjectName(secondSpeaker, "tech") &&
    !isObjectName(secondSpeaker, "zulus") &&
    isObjectName(secondSpeaker, "stalker")
  );
}

/**
 * todo;
 */
export function zat_b33_transfer_first_item(firstSpeaker: XR_game_object, secondSpeaker: XR_game_object): void {
  giveItemsToActor(quest_items.wpn_fort_snag);
}

/**
 * todo;
 */
export function zat_b33_transfer_second_item(firstSpeaker: XR_game_object, secondSpeaker: XR_game_object): void {
  giveItemsToActor(drugs.medkit_scientic, 3);
  giveItemsToActor(drugs.antirad, 3);
  giveItemsToActor(drugs.bandage, 5);
}

/**
 * todo;
 */
export function zat_b33_transfer_third_item(firstSpeaker: XR_game_object, secondSpeaker: XR_game_object): void {
  giveItemsToActor(quest_items.wpn_ak74u_snag);
}

/**
 * todo;
 */
export function zat_b33_transfer_fourth_item(firstSpeaker: XR_game_object, secondSpeaker: XR_game_object): void {
  giveItemsToActor(artefacts.af_soul);
}

/**
 * todo;
 */
export function zat_b33_transfer_fifth_item(firstSpeaker: XR_game_object, secondSpeaker: XR_game_object): void {
  giveItemsToActor(quest_items.helm_hardhat_snag);
}

/**
 * todo;
 */
export function zat_b33_transfer_safe_container(firstSpeaker: XR_game_object, secondSpeaker: XR_game_object): void {
  transferItemsFromActor(getNpcSpeaker(firstSpeaker, secondSpeaker), quest_items.zat_b33_safe_container);
}

/**
 * todo;
 */
export function zat_b33_aractor_has_habar(firstSpeaker: XR_game_object, secondSpeaker: XR_game_object): boolean {
  return registry.actor.object(quest_items.zat_b33_safe_container) !== null;
}

/**
 * todo;
 */
export function zat_b33_actor_hasnt_habar(firstSpeaker: XR_game_object, secondSpeaker: XR_game_object): boolean {
  return !zat_b33_aractor_has_habar(firstSpeaker, secondSpeaker);
}

/**
 * todo;
 */
export function zat_b33_actor_has_needed_money(firstSpeaker: XR_game_object, secondSpeaker: XR_game_object): boolean {
  return registry.actor.money() >= 500;
}

/**
 * todo;
 */
export function zat_b33_actor_hasnt_needed_money(firstSpeaker: XR_game_object, secondSpeaker: XR_game_object): boolean {
  return !zat_b33_actor_has_needed_money(firstSpeaker, secondSpeaker);
}

/**
 * todo;
 */
export function zat_b33_relocate_money(firstSpeaker: XR_game_object, secondSpeaker: XR_game_object): void {
  if (zat_b33_actor_has_needed_money(firstSpeaker, secondSpeaker)) {
    transferMoneyFromActor(getNpcSpeaker(firstSpeaker, secondSpeaker), 500);
  }
}

/**
 * todo;
 */
export const zat_b29_af_table = {
  [16]: artefacts.af_gravi,
  [17]: artefacts.af_eye,
  [18]: artefacts.af_baloon,
  [19]: artefacts.af_dummy_dummy,
  [20]: artefacts.af_gold_fish,
  [21]: artefacts.af_fire,
  [22]: artefacts.af_glass,
  [23]: artefacts.af_ice,
} as unknown as LuaArray<TArtefact>;

/**
 * todo;
 */
export const zat_b29_af_names_table = {
  [16]: captions.st_af_gravi_name,
  [17]: captions.st_af_eye_name,
  [18]: captions.st_af_baloon_name,
  [19]: captions.st_af_dummy_dummy_name,
  [20]: captions.st_af_gold_fish_name,
  [21]: captions.st_af_fire_name,
  [22]: captions.st_af_glass_name,
  [23]: captions.st_af_ice_name,
} as unknown as LuaArray<string>;

/**
 * todo;
 */
export const zat_b29_infop_table = {
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
export const zat_b29_infop_bring_table = {
  [16]: "zat_b29_bring_af_16",
  [17]: "zat_b29_bring_af_17",
  [18]: "zat_b29_bring_af_18",
  [19]: "zat_b29_bring_af_19",
  [20]: "zat_b29_bring_af_20",
  [21]: "zat_b29_bring_af_21",
  [22]: "zat_b29_bring_af_22",
  [23]: "zat_b29_bring_af_23",
} as unknown as LuaArray<TInfoPortion>;

/**
 * todo;
 */
export function zat_b29_create_af_in_anomaly(firstSpeaker: XR_game_object, secondSpeaker: XR_game_object): void {
  const anom_tbl: LuaArray<string> = {
    [16]: "gravi",
    [17]: "thermal",
    [18]: "acid",
    [19]: "electra",
    [20]: "gravi",
    [21]: "thermal",
    [22]: "acid",
    [23]: "electra",
  } as unknown as LuaArray<string>;

  const anomalies_names_tbl = {
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

  let zone = "";
  let zone_name = "";
  let key;

  for (const [k, v] of zat_b29_infop_bring_table) {
    if (hasAlifeInfo(v)) {
      key = k;
      zone = anom_tbl.get(key);
      break;
    }
  }

  zone_name = anomalies_names_tbl.get(zone).get(math.random(1, anomalies_names_tbl.get(zone).length()));

  registry.anomalies.get(zone_name).setForcedSpawnOverride(zat_b29_af_table.get(key as number));
}

/**
 * todo;
 */
export function zat_b29_linker_give_adv_task(firstSpeaker: XR_game_object, secondSpeaker: XR_game_object): string {
  let result: string = "";
  let f_first: boolean = true;

  for (const i of $range(16, 23)) {
    disableInfo(zat_b29_infop_bring_table.get(i));
    if (hasAlifeInfo(zat_b29_infop_table.get(i))) {
      if (f_first) {
        result = game.translate_string(zat_b29_af_names_table.get(i));
        f_first = false;
      } else {
        result = result + ", " + game.translate_string(zat_b29_af_names_table.get(i));
      }
    }
  }

  return result + ".";
}

/**
 * todo;
 */
export function zat_b29_actor_do_not_has_adv_task_af(
  firstSpeaker: XR_game_object,
  secondSpeaker: XR_game_object
): boolean {
  for (const i of $range(16, 23)) {
    if (hasAlifeInfo(zat_b29_infop_bring_table.get(i)) && registry.actor.object(zat_b29_af_table.get(i))) {
      return false;
    }
  }

  return true;
}

/**
 * todo;
 */
export function zat_b29_actor_has_adv_task_af(firstSpeaker: XR_game_object, secondSpeaker: XR_game_object): boolean {
  for (const i of $range(16, 23)) {
    if (hasAlifeInfo(zat_b29_infop_bring_table.get(i)) && registry.actor.object(zat_b29_af_table.get(i))) {
      return true;
    }
  }

  return false;
}

/**
 * todo;
 */
export function zat_b29_linker_get_adv_task_af(firstSpeaker: XR_game_object, secondSpeaker: XR_game_object): void {
  for (const i of $range(16, 23)) {
    if (hasAlifeInfo(zat_b29_infop_bring_table.get(i))) {
      disableInfo("zat_b29_adv_task_given");
      transferItemsFromActor(getNpcSpeaker(firstSpeaker, secondSpeaker), zat_b29_af_table.get(i));
      if (i < 20) {
        if (hasAlifeInfo("zat_b29_linker_take_af_from_rival")) {
          giveMoneyToActor(12000);
        } else {
          giveMoneyToActor(18000);
        }
      } else if (i > 19) {
        if (hasAlifeInfo("zat_b29_linker_take_af_from_rival")) {
          giveMoneyToActor(18000);
        } else {
          giveMoneyToActor(24000);
        }
      }

      break;
    }
  }
}

/**
 * todo;
 */
export function getGoodGunsInInventory(object: XR_game_object): LuaArray<TWeapon> {
  const actor_wpn_table: LuaArray<TWeapon> = new LuaTable();
  const wpn_table = [
    weapons.wpn_sig550,
    weapons.wpn_g36,
    weapons.wpn_val,
    weapons.wpn_groza,
    weapons.wpn_vintorez,
    weapons.wpn_fn2000,
  ] as unknown as LuaArray<TWeapon>;

  object.iterate_inventory((owner: XR_game_object, item: XR_game_object): void => {
    const section = item.section();

    for (const [k, v] of wpn_table) {
      if (section === v) {
        table.insert(actor_wpn_table, v);
        break;
      }
    }
  }, object);

  return actor_wpn_table;
}

/**
 * todo;
 */
export function zat_b29_actor_has_exchange_item(firstSpeaker: XR_game_object, secondSpeaker: XR_game_object): boolean {
  const actor: XR_game_object = registry.actor;
  const actor_wpn_table = getGoodGunsInInventory(actor);

  if (actor_wpn_table.length() > 0) {
    (actor as AnyObject).good_gun = actor_wpn_table.get(math.random(1, actor_wpn_table.length()));
  }

  return (actor as AnyObject).good_gun !== null;
}

/**
 * todo;
 */
export function zat_b29_actor_exchange(firstSpeaker: XR_game_object, secondSpeaker: XR_game_object): void {
  const actor: XR_game_object = registry.actor;

  for (const i of $range(16, 23)) {
    if (hasAlifeInfo(zat_b29_infop_bring_table.get(i))) {
      if ((actor as AnyObject).good_gun !== null) {
        transferItemsFromActor(getNpcSpeaker(firstSpeaker, secondSpeaker), (actor as AnyObject).good_gun);
        transferItemsToActor(getNpcSpeaker(firstSpeaker, secondSpeaker), zat_b29_af_table.get(i));

        (actor as AnyObject).good_gun = null;
        break;
      }
    }
  }
}

/**
 * todo;
 */
export function zat_b30_transfer_percent(firstSpeaker: XR_game_object, secondSpeaker: XR_game_object): void {
  const actor: XR_game_object = registry.actor;
  const amount: number = math.random(5, 25) * 100;
  const days: number = portableStoreGet(actor, "zat_b30_days_cnt", 0);

  giveMoneyToActor(amount * days);
  portableStoreSet(actor, "zat_b30_days_cnt", 0);
}

/**
 * todo;
 */
export function zat_b30_npc_has_detector(firstSpeaker: XR_game_object, secondSpeaker: XR_game_object): boolean {
  return npcHasItem(getNpcSpeaker(firstSpeaker, secondSpeaker), detectors.detector_scientific);
}

/**
 * todo;
 */
export function zat_b30_actor_second_exchange(firstSpeaker: XR_game_object, secondSpeaker: XR_game_object): void {
  transferItemsToActor(getNpcSpeaker(firstSpeaker, secondSpeaker), detectors.detector_scientific);
}

/**
 * todo;
 */
export function zat_b30_actor_exchange(firstSpeaker: XR_game_object, secondSpeaker: XR_game_object): void {
  const actor: XR_game_object = registry.actor;

  if ((actor as AnyObject).good_gun !== null) {
    transferItemsFromActor(getNpcSpeaker(firstSpeaker, secondSpeaker), (actor as AnyObject).good_gun);
    transferItemsToActor(getNpcSpeaker(firstSpeaker, secondSpeaker), detectors.detector_scientific);
    (actor as AnyObject).good_gun = null;
  }

  if (isObjectName(secondSpeaker, "zat_b29_stalker_rival_1")) {
    giveInfo(infoPortions.zat_b30_rival_1_wo_detector);
  } else if (isObjectName(secondSpeaker, "zat_b29_stalker_rival_2")) {
    giveInfo(infoPortions.zat_b30_rival_2_wo_detector);
  }
}

/**
 * todo;
 */
export function zat_b30_actor_has_two_detectors(firstSpeaker: XR_game_object, secondSpeaker: XR_game_object): boolean {
  const actor: XR_game_object = registry.actor;
  let cnt: number = 0;

  actor.iterate_inventory((npc, item) => {
    if (item.section() === detectors.detector_scientific) {
      cnt = cnt + 1;
    }
  }, actor);

  return cnt > 1;
}

/**
 * todo;
 */
export function actor_has_nimble_weapon(firstSpeaker: XR_game_object, secondSpeaker: XR_game_object): boolean {
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
}

/**
 * todo;
 */
export function zat_b51_robbery(firstSpeaker: XR_game_object, secondSpeaker: XR_game_object): void {
  const actor: XR_game_object = registry.actor;
  let amount: number = math.floor((actor.money() * math.random(35, 50)) / 100);

  if (amount > actor.money()) {
    amount = actor.money();
  }

  const need_item = {
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

  for (const k of need_item) {
    if (actor.object(k) !== null) {
      transferItemsFromActor(getNpcSpeaker(firstSpeaker, secondSpeaker), k, "all");
    }
  }

  transferMoneyFromActor(getNpcSpeaker(firstSpeaker, secondSpeaker), amount);
}

/**
 * todo;
 */
export function zat_b51_rob_nimble_weapon(firstSpeaker: XR_game_object, secondSpeaker: XR_game_object): void {
  const actor: XR_game_object = registry.actor;
  const actor_has_item: LuaArray<TWeapon> = new LuaTable();
  const need_item = {
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

  for (const k of need_item) {
    if (actor.object(k) !== null) {
      table.insert(actor_has_item, k);
    }

    if (actor.item_in_slot(2) !== null && actor.item_in_slot(2)!.section() === k) {
      transferItemsFromActor(getNpcSpeaker(firstSpeaker, secondSpeaker), k);

      return;
    } else if (actor.item_in_slot(3) !== null && actor.item_in_slot(3)!.section() === k) {
      transferItemsFromActor(getNpcSpeaker(firstSpeaker, secondSpeaker), k);

      return;
    }
  }

  if (actor_has_item.length() > 0) {
    transferItemsFromActor(
      getNpcSpeaker(firstSpeaker, secondSpeaker),
      actor_has_item.get(math.random(1, actor_has_item.length()))
    );
  }
}

/**
 * todo;
 */
export function give_compass_to_actor(firstSpeaker: XR_game_object, secondSpeaker: XR_game_object): void {
  transferItemsToActor(getNpcSpeaker(firstSpeaker, secondSpeaker), artefacts.af_compass);
}

const item_count_by_category = [3, 3, 3, 3, 1, 1, 1] as unknown as LuaArray<number>;

const zat_b51_costs_table = [
  { prepay_agreed: 700, prepay_refused: 1400, cost: 2800 },
  { prepay_agreed: 2000, prepay_refused: 4000, cost: 8000 },
  { prepay_agreed: 4000, prepay_refused: 8000, cost: 16000 },
  { prepay_agreed: 4000, prepay_refused: 8000, cost: 16000 },
  { prepay_agreed: 8000, prepay_refused: 16000, cost: 32000 },
  { prepay_agreed: 6000, prepay_refused: 12000, cost: 24000 },
  { prepay_agreed: 12000, prepay_refused: 24000, cost: 48000 },
] as unknown as LuaArray<{ prepay_agreed: number; prepay_refused: number; cost: number }>;

const zat_b51_buy_item_table = [
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
export function zat_b51_randomize_item(firstSpeaker: XR_game_object, secondSpeaker: XR_game_object): void {
  for (const it of $range(1, 7)) {
    if (hasAlifeInfo(("zat_b51_processing_category_" + tostring(it)) as TInfoPortion)) {
      const zat_b51_available_items_table: LuaArray<TCount> = new LuaTable();

      for (const j of $range(1, item_count_by_category.get(it))) {
        if (!hasAlifeInfo(("zat_b51_done_item_" + tostring(it) + "_" + tostring(j)) as TInfoPortion)) {
          table.insert(zat_b51_available_items_table, j);
        }
      }

      giveInfo(
        ("zat_b51_ordered_item_" +
          tostring(it) +
          "_" +
          tostring(
            zat_b51_available_items_table.get(math.random(1, zat_b51_available_items_table.length()))
          )) as TInfoPortion
      );
    }
  }
}

/**
 * todo;
 */
export function zat_b51_give_prepay(firstSpeaker: XR_game_object, secondSpeaker: XR_game_object): void {
  for (const it of $range(1, 7)) {
    if (hasAlifeInfo(("zat_b51_processing_category_" + tostring(it)) as TInfoPortion)) {
      if (!hasAlifeInfo(infoPortions.zat_b51_order_refused)) {
        return transferMoneyFromActor(
          getNpcSpeaker(firstSpeaker, secondSpeaker),
          zat_b51_costs_table.get(it).prepay_agreed
        );
      }

      return transferMoneyFromActor(
        getNpcSpeaker(firstSpeaker, secondSpeaker),
        zat_b51_costs_table.get(it).prepay_refused
      );
    }
  }
}

/**
 * todo;
 */
export function zat_b51_has_prepay(firstSpeaker: XR_game_object, secondSpeaker: XR_game_object): boolean {
  const actor: XR_game_object = registry.actor;

  for (const it of $range(1, 7)) {
    if (hasAlifeInfo(("zat_b51_processing_category_" + tostring(it)) as TInfoPortion)) {
      if (!hasAlifeInfo(infoPortions.zat_b51_order_refused)) {
        return actor.money() >= zat_b51_costs_table.get(it).prepay_agreed;
      }

      return actor.money() >= zat_b51_costs_table.get(it).prepay_refused;
    }
  }

  return false;
}

/**
 * todo;
 */
export function zat_b51_hasnt_prepay(firstSpeaker: XR_game_object, secondSpeaker: XR_game_object): boolean {
  return !zat_b51_has_prepay(firstSpeaker, secondSpeaker);
}

/**
 * todo;
 */
export function zat_b51_buy_item(firstSpeaker: XR_game_object, secondSpeaker: XR_game_object): void {
  for (const it of $range(1, 7)) {
    if (hasAlifeInfo(("zat_b51_processing_category_" + tostring(it)) as TInfoPortion)) {
      for (const j of $range(1, zat_b51_buy_item_table.get(it).length())) {
        if (hasAlifeInfo(("zat_b51_ordered_item_" + tostring(it) + "_" + tostring(j)) as TInfoPortion)) {
          for (const [k, v] of zat_b51_buy_item_table.get(it).get(j).item) {
            transferItemsToActor(getNpcSpeaker(firstSpeaker, secondSpeaker), v);
          }

          transferMoneyFromActor(getNpcSpeaker(firstSpeaker, secondSpeaker), zat_b51_costs_table.get(it).cost);
          disableInfo(("zat_b51_processing_category_" + tostring(it)) as TInfoPortion);
          disableInfo(("zat_b51_ordered_item_" + tostring(it) + "_" + tostring(j)) as TInfoPortion);
          giveInfo(("zat_b51_done_item_" + tostring(it) + "_" + tostring(j)) as TInfoPortion);
          break;
        }
      }

      let category_finishing: boolean = true;

      for (const j of $range(1, zat_b51_buy_item_table.get(it).length())) {
        if (!hasAlifeInfo(("zat_b51_done_item_" + tostring(it) + "_" + tostring(j)) as TInfoPortion)) {
          category_finishing = false;
          break;
        }
      }

      if (category_finishing) {
        giveInfo(("zat_b51_finishing_category_" + tostring(it)) as TInfoPortion);
      }

      return;
    }
  }
}

/**
 * todo;
 */
export function zat_b51_refuse_item(firstSpeaker: XR_game_object, secondSpeaker: XR_game_object): void {
  for (const i of $range(1, 7)) {
    if (hasAlifeInfo(("zat_b51_processing_category_" + tostring(i)) as TInfoPortion)) {
      for (const j of $range(1, zat_b51_buy_item_table.get(i).length())) {
        if (hasAlifeInfo(("zat_b51_ordered_item_" + tostring(i) + "_" + tostring(j)) as TInfoPortion)) {
          disableInfo(("zat_b51_processing_category_" + tostring(i)) as TInfoPortion);
          disableInfo(("zat_b51_ordered_item_" + tostring(i) + "_" + tostring(j)) as TInfoPortion);
          giveInfo(("zat_b51_done_item_" + tostring(i) + "_" + tostring(j)) as TInfoPortion);
          break;
        }
      }

      let category_finishing = true;

      for (const j of $range(1, zat_b51_buy_item_table.get(i).length())) {
        if (!hasAlifeInfo(("zat_b51_done_item_" + tostring(i) + "_" + tostring(j)) as TInfoPortion)) {
          category_finishing = false;
          break;
        }
      }

      if (category_finishing === true) {
        giveInfo(("zat_b51_finishing_category_" + tostring(i)) as TInfoPortion);
      }

      return;
    }
  }
}

/**
 * todo;
 */
export function zat_b51_has_item_cost(firstSpeaker: XR_game_object, secondSpeaker: XR_game_object): boolean {
  const actor: XR_game_object = registry.actor;

  for (const i of $range(1, 7)) {
    if (hasAlifeInfo(("zat_b51_processing_category_" + tostring(i)) as TInfoPortion)) {
      return actor.money() >= zat_b51_costs_table.get(i).cost;
    }
  }

  return false;
}

/**
 * todo;
 */
export function zat_b51_hasnt_item_cost(firstSpeaker: XR_game_object, secondSpeaker: XR_game_object): boolean {
  return !zat_b51_has_item_cost(firstSpeaker, secondSpeaker);
}

/**
 * todo;
 */
export function zat_b12_actor_have_documents(firstSpeaker: XR_game_object, secondSpeaker: XR_game_object): boolean {
  return actorHasAtLeastOneItem([quest_items.zat_b12_documents_1, quest_items.zat_b12_documents_2]);
}

/**
 * todo;
 */
export function zat_b12_actor_transfer_documents(firstSpeaker: XR_game_object, secondSpeaker: XR_game_object): boolean {
  const npc: XR_game_object = getNpcSpeaker(firstSpeaker, secondSpeaker);
  const actor: XR_game_object = registry.actor;

  const amount_doc1: TCount = 1000;
  const amount_doc2: TCount = 600;
  const amount_doc3: TCount = 400;

  let amount_total: TCount = 0;
  let cnt: TCount = 0;
  let cnt2: TCount = 0;

  if (actor.object(quest_items.zat_b12_documents_1) !== null) {
    transferItemsFromActor(getNpcSpeaker(firstSpeaker, secondSpeaker), quest_items.zat_b12_documents_1);
    giveInfo(infoPortions.zat_b12_documents_sold_1);
    amount_total = amount_total + amount_doc1;
  }

  npc.iterate_inventory((temp, item) => {
    if (item.section() === quest_items.zat_b12_documents_2) {
      cnt = cnt + 1;
    }
  }, npc);

  actor.iterate_inventory((temp, item) => {
    if (item.section() === quest_items.zat_b12_documents_2) {
      cnt2 = cnt2 + 1;
    }
  }, actor);

  if (actor.object(quest_items.zat_b12_documents_2) !== null) {
    if (cnt < 1) {
      amount_total = amount_total + amount_doc2;

      if (cnt2 > 1) {
        amount_total = amount_total + amount_doc3 * (cnt2 - 1);
        giveInfo(infoPortions.zat_b12_documents_sold_2);
      }
    } else {
      amount_total = amount_total + amount_doc3 * cnt2;
      giveInfo(infoPortions.zat_b12_documents_sold_3);
    }

    transferItemsFromActor(getNpcSpeaker(firstSpeaker, secondSpeaker), quest_items.zat_b12_documents_2, cnt2);
  }

  giveMoneyToActor(amount_total);

  return false;
}

/**
 * todo;
 */
export function zat_b3_actor_got_toolkit(firstSpeaker: XR_game_object, secondSpeaker: XR_game_object): boolean {
  const actor: XR_game_object = registry.actor;

  actor.iterate_inventory((npc: XR_game_object, item: XR_game_object) => {
    const section = item.section();

    if (
      (section === misc.toolkit_1 && !hasAlifeInfo(infoPortions.zat_b3_tech_instrument_1_brought)) ||
      (section === misc.toolkit_2 && !hasAlifeInfo(infoPortions.zat_b3_tech_instrument_2_brought)) ||
      (section === misc.toolkit_3 && !hasAlifeInfo(infoPortions.zat_b3_tech_instrument_3_brought))
    ) {
      (actor as AnyObject).toolkit = section;

      return;
    }
  }, actor);

  return (actor as AnyObject).toolkit !== null;
}

/**
 * todo;
 */
export function give_toolkit_3(firstSpeaker: XR_game_object, secondSpeaker: XR_game_object): void {
  transferItemsFromActor(getNpcSpeaker(firstSpeaker, secondSpeaker), misc.toolkit_3);
  (registry.actor as AnyObject).toolkit = null;
  giveMoneyToActor(1500);
}

/**
 * todo;
 */
export function give_toolkit_1(firstSpeaker: XR_game_object, secondSpeaker: XR_game_object): void {
  transferItemsFromActor(getNpcSpeaker(firstSpeaker, secondSpeaker), misc.toolkit_1);
  (registry.actor as AnyObject).toolkit = null;
  giveMoneyToActor(1000);
}

/**
 * todo;
 */
export function if_actor_has_toolkit_1(firstSpeaker: XR_game_object, secondSpeaker: XR_game_object): boolean {
  return registry.actor.object(misc.toolkit_1) !== null;
}

/**
 * todo;
 */
export function give_toolkit_2(firstSpeaker: XR_game_object, secondSpeaker: XR_game_object): void {
  transferItemsFromActor(getNpcSpeaker(firstSpeaker, secondSpeaker), misc.toolkit_2);
  (registry.actor as AnyObject).toolkit = null;
  giveMoneyToActor(1200);
}

/**
 * todo;
 */
export function if_actor_has_toolkit_2(firstSpeaker: XR_game_object, secondSpeaker: XR_game_object): boolean {
  return registry.actor.object(misc.toolkit_2) !== null;
}

/**
 * todo;
 */
export function zat_b215_counter_greater_3(firstSpeaker: XR_game_object, secondSpeaker: XR_game_object): boolean {
  const actor: XR_game_object = registry.actor;

  return portableStoreGet(actor, "zat_a9_way_to_pripyat_counter", 0 as number) > 3;
}

/**
 * todo;
 */
export function zat_b40_transfer_notebook(firstSpeaker: XR_game_object, secondSpeaker: XR_game_object): void {
  transferItemsFromActor(getNpcSpeaker(firstSpeaker, secondSpeaker), quest_items.zat_b40_notebook);
  giveInfo(infoPortions.zat_b40_notebook_saled);
  giveMoneyToActor(2000);
}

/**
 * todo;
 */
export function zat_b40_transfer_merc_pda_1(firstSpeaker: XR_game_object, secondSpeaker: XR_game_object): void {
  transferItemsFromActor(getNpcSpeaker(firstSpeaker, secondSpeaker), quest_items.zat_b40_pda_1);
  giveInfo(infoPortions.zat_b40_pda_1_saled);
  giveMoneyToActor(1000);

  if (
    hasAlifeInfo(infoPortions.zat_b40_notebook_saled) &&
    hasAlifeInfo(infoPortions.zat_b40_pda_1_saled) &&
    hasAlifeInfo(infoPortions.zat_b40_pda_2_saled)
  ) {
    giveInfo(infoPortions.zat_b40_all_item_saled);
  }
}

/**
 * todo;
 */
export function zat_b40_transfer_merc_pda_2(firstSpeaker: XR_game_object, secondSpeaker: XR_game_object): void {
  transferItemsFromActor(getNpcSpeaker(firstSpeaker, secondSpeaker), quest_items.zat_b40_pda_2);
  giveInfo(infoPortions.zat_b40_pda_2_saled);
  giveMoneyToActor(1_000);

  if (
    hasAlifeInfo(infoPortions.zat_b40_notebook_saled) &&
    hasAlifeInfo(infoPortions.zat_b40_pda_1_saled) &&
    hasAlifeInfo(infoPortions.zat_b40_pda_2_saled)
  ) {
    giveInfo(infoPortions.zat_b40_all_item_saled);
  }
}

/**
 * todo;
 */
export function zat_b29_actor_do_not_has_adv_task_af_1(
  firstSpeaker: XR_game_object,
  secondSpeaker: XR_game_object
): boolean {
  return hasAlifeInfo(zat_b29_infop_table.get(16)) && !registry.actor.object(zat_b29_af_table.get(16));
}

/**
 * todo;
 */
export function zat_b29_actor_do_not_has_adv_task_af_2(
  firstSpeaker: XR_game_object,
  secondSpeaker: XR_game_object
): boolean {
  return hasAlifeInfo(zat_b29_infop_table.get(17)) && !registry.actor.object(zat_b29_af_table.get(17));
}

/**
 * todo;
 */
export function zat_b29_actor_do_not_has_adv_task_af_3(
  firstSpeaker: XR_game_object,
  secondSpeaker: XR_game_object
): boolean {
  return hasAlifeInfo(zat_b29_infop_table.get(18)) && !registry.actor.object(zat_b29_af_table.get(18));
}

/**
 * todo;
 */
export function zat_b29_actor_do_not_has_adv_task_af_4(
  firstSpeaker: XR_game_object,
  secondSpeaker: XR_game_object
): boolean {
  return hasAlifeInfo(zat_b29_infop_table.get(19)) && !registry.actor.object(zat_b29_af_table.get(19));
}

/**
 * todo;
 */
export function zat_b29_actor_do_not_has_adv_task_af_5(
  firstSpeaker: XR_game_object,
  secondSpeaker: XR_game_object
): boolean {
  return hasAlifeInfo(zat_b29_infop_table.get(20)) && !registry.actor.object(zat_b29_af_table.get(20));
}

/**
 * todo;
 */
export function zat_b29_actor_do_not_has_adv_task_af_6(
  firstSpeaker: XR_game_object,
  secondSpeaker: XR_game_object
): boolean {
  return hasAlifeInfo(zat_b29_infop_table.get(21)) && !registry.actor.object(zat_b29_af_table.get(21));
}

/**
 * todo;
 */
export function zat_b29_actor_do_not_has_adv_task_af_7(
  firstSpeaker: XR_game_object,
  secondSpeaker: XR_game_object
): boolean {
  return hasAlifeInfo(zat_b29_infop_table.get(22)) && !registry.actor.object(zat_b29_af_table.get(22));
}

/**
 * todo;
 */
export function zat_b29_actor_do_not_has_adv_task_af_8(
  firstSpeaker: XR_game_object,
  secondSpeaker: XR_game_object
): boolean {
  return hasAlifeInfo(zat_b29_infop_table.get(23)) && !registry.actor.object(zat_b29_af_table.get(23));
}

/**
 * todo;
 */
export function zat_b29_actor_has_adv_task_af_1(firstSpeaker: XR_game_object, secondSpeaker: XR_game_object): boolean {
  return hasAlifeInfo(zat_b29_infop_table.get(16)) && registry.actor.object(zat_b29_af_table.get(16)) !== null;
}

/**
 * todo;
 */
export function zat_b29_actor_has_adv_task_af_2(firstSpeaker: XR_game_object, secondSpeaker: XR_game_object): boolean {
  return hasAlifeInfo(zat_b29_infop_table.get(17)) && registry.actor.object(zat_b29_af_table.get(17)) !== null;
}

/**
 * todo;
 */
export function zat_b29_actor_has_adv_task_af_3(firstSpeaker: XR_game_object, secondSpeaker: XR_game_object): boolean {
  return hasAlifeInfo(zat_b29_infop_table.get(18)) && registry.actor.object(zat_b29_af_table.get(18)) !== null;
}

/**
 * todo;
 */
export function zat_b29_actor_has_adv_task_af_4(firstSpeaker: XR_game_object, secondSpeaker: XR_game_object): boolean {
  return hasAlifeInfo(zat_b29_infop_table.get(19)) && registry.actor.object(zat_b29_af_table.get(19)) !== null;
}

/**
 * todo;
 */
export function zat_b29_actor_has_adv_task_af_5(firstSpeaker: XR_game_object, secondSpeaker: XR_game_object): boolean {
  return hasAlifeInfo(zat_b29_infop_table.get(20)) && registry.actor.object(zat_b29_af_table.get(20)) !== null;
}

/**
 * todo;
 */
export function zat_b29_actor_has_adv_task_af_6(firstSpeaker: XR_game_object, secondSpeaker: XR_game_object): boolean {
  return hasAlifeInfo(zat_b29_infop_table.get(21)) && registry.actor.object(zat_b29_af_table.get(21)) !== null;
}

/**
 * todo;
 */
export function zat_b29_actor_has_adv_task_af_7(firstSpeaker: XR_game_object, secondSpeaker: XR_game_object): boolean {
  return hasAlifeInfo(zat_b29_infop_table.get(22)) && registry.actor.object(zat_b29_af_table.get(22)) !== null;
}

/**
 * todo;
 */
export function zat_b29_actor_has_adv_task_af_8(firstSpeaker: XR_game_object, secondSpeaker: XR_game_object): boolean {
  return hasAlifeInfo(zat_b29_infop_table.get(23)) && registry.actor.object(zat_b29_af_table.get(23)) !== null;
}

/**
 * todo;
 */
export function zat_b30_transfer_detector_to_actor(firstSpeaker: XR_game_object, secondSpeaker: XR_game_object): void {
  transferItemsToActor(getNpcSpeaker(firstSpeaker, secondSpeaker), detectors.detector_scientific);
}

/**
 * todo;
 */
export function zat_b30_give_owls_share_to_actor(firstSpeaker: XR_game_object, secondSpeaker: XR_game_object): void {
  giveMoneyToActor(1_500);
}

/**
 * todo;
 */
export function zat_b30_actor_has_compass(firstSpeaker: XR_game_object, secondSpeaker: XR_game_object): boolean {
  return registry.actor.object(artefacts.af_compass) !== null;
}

/**
 * todo;
 */
export function zat_b30_transfer_af_from_actor(firstSpeaker: XR_game_object, secondSpeaker: XR_game_object): void {
  transferItemsFromActor(getNpcSpeaker(firstSpeaker, secondSpeaker), artefacts.af_compass);
  giveMoneyToActor(10_000);

  const treasureManager: TreasureManager = TreasureManager.getInstance();

  treasureManager.giveActorTreasureCoordinates(treasures.zat_hiding_place_49);
  treasureManager.giveActorTreasureCoordinates(treasures.zat_hiding_place_15);
}

/**
 * todo;
 */
export function zat_b30_barmen_has_percent(firstSpeaker: XR_game_object, secondSpeaker: XR_game_object): boolean {
  const actor = registry.actor;
  const cnt = portableStoreGet(actor, "zat_b30_days_cnt", 0);

  return cnt > 0;
}

/**
 * todo;
 */
export function zat_b30_barmen_do_not_has_percent(
  firstSpeaker: XR_game_object,
  secondSpeaker: XR_game_object
): boolean {
  const actor = registry.actor;
  const cnt = portableStoreGet(actor, "zat_b30_days_cnt", 0);

  return cnt < 1;
}

/**
 * todo;
 */
export function zat_b30_actor_has_noah_pda(firstSpeaker: XR_game_object, secondSpeaker: XR_game_object): boolean {
  return registry.actor.object(quest_items.zat_b20_noah_pda) !== null;
}

/**
 * todo;
 */
export function zat_b30_sell_noah_pda(firstSpeaker: XR_game_object, secondSpeaker: XR_game_object): void {
  transferItemsFromActor(getNpcSpeaker(firstSpeaker, secondSpeaker), quest_items.zat_b20_noah_pda);
  giveMoneyToActor(1000);
}

/**
 * todo;
 */
export function zat_b40_actor_has_notebook(firstSpeaker: XR_game_object, secondSpeaker: XR_game_object): boolean {
  return registry.actor.object(quest_items.zat_b40_notebook) !== null;
}

/**
 * todo;
 */
export function zat_b40_actor_has_merc_pda_1(firstSpeaker: XR_game_object, secondSpeaker: XR_game_object): boolean {
  return registry.actor.object(quest_items.zat_b40_pda_1) !== null;
}

/**
 * todo;
 */
export function zat_b40_actor_has_merc_pda_2(firstSpeaker: XR_game_object, secondSpeaker: XR_game_object): boolean {
  return registry.actor.object(quest_items.zat_b40_pda_2) !== null;
}

/**
 * todo;
 */
export function if_actor_has_toolkit_3(firstSpeaker: XR_game_object, secondSpeaker: XR_game_object): boolean {
  return registry.actor.object(misc.toolkit_3) !== null;
}

/**
 * todo;
 */
export function give_vodka(firstSpeaker: XR_game_object, secondSpeaker: XR_game_object): void {
  transferItemsFromActor(getNpcSpeaker(firstSpeaker, secondSpeaker), food.vodka);
}

/**
 * todo;
 */
export function if_actor_has_vodka(firstSpeaker: XR_game_object, secondSpeaker: XR_game_object): boolean {
  return registry.actor.object(food.vodka) !== null;
}

/**
 * todo;
 */
export function actor_has_more_then_need_money_to_buy_battery(
  firstSpeaker: XR_game_object,
  secondSpeaker: XR_game_object
): boolean {
  return registry.actor.money() >= 2000;
}

/**
 * todo;
 */
export function actor_has_less_then_need_money_to_buy_battery(
  firstSpeaker: XR_game_object,
  secondSpeaker: XR_game_object
): boolean {
  return registry.actor.money() < 2000;
}

/**
 * todo;
 */
export function relocate_need_money_to_buy_battery(firstSpeaker: XR_game_object, secondSpeaker: XR_game_object): void {
  transferMoneyFromActor(getNpcSpeaker(firstSpeaker, secondSpeaker), 2000);
}

/**
 * todo;
 */
export function give_actor_battery(firstSpeaker: XR_game_object, secondSpeaker: XR_game_object): void {
  transferItemsToActor(getNpcSpeaker(firstSpeaker, secondSpeaker), ammo.ammo_gauss_cardan);
}

/**
 * todo;
 */
export function give_actor_zat_a23_access_card(firstSpeaker: XR_game_object, secondSpeaker: XR_game_object): void {
  transferItemsToActor(getNpcSpeaker(firstSpeaker, secondSpeaker), quest_items.zat_a23_access_card);
}

/**
 * todo;
 */
export function give_zat_a23_gauss_rifle_docs(firstSpeaker: XR_game_object, secondSpeaker: XR_game_object): void {
  transferItemsFromActor(getNpcSpeaker(firstSpeaker, secondSpeaker), quest_items.zat_a23_gauss_rifle_docs);
}

/**
 * todo;
 */
export function return_zat_a23_gauss_rifle_docs(firstSpeaker: XR_game_object, secondSpeaker: XR_game_object): void {
  transferItemsToActor(getNpcSpeaker(firstSpeaker, secondSpeaker), quest_items.zat_a23_gauss_rifle_docs);
}

/**
 * todo;
 */
export function if_actor_has_zat_a23_gauss_rifle_docs(
  firstSpeaker: XR_game_object,
  secondSpeaker: XR_game_object
): boolean {
  return firstSpeaker.object(quest_items.zat_a23_gauss_rifle_docs) !== null;
}

/**
 * todo;
 */
export function if_actor_has_gauss_rifle(firstSpeaker: XR_game_object, secondSpeaker: XR_game_object): boolean {
  return firstSpeaker.object(quest_items.pri_a17_gauss_rifle) !== null;
}

/**
 * todo;
 */
export function give_tech_gauss_rifle(firstSpeaker: XR_game_object, secondSpeaker: XR_game_object): void {
  transferItemsFromActor(getNpcSpeaker(firstSpeaker, secondSpeaker), quest_items.pri_a17_gauss_rifle);
}

/**
 * todo;
 */
export function give_actor_repaired_gauss_rifle(firstSpeaker: XR_game_object, secondSpeaker: XR_game_object): void {
  transferItemsToActor(getNpcSpeaker(firstSpeaker, secondSpeaker), weapons.wpn_gauss);
}

/**
 * todo;
 */
export function zat_b215_actor_has_money_poor(firstSpeaker: XR_game_object, secondSpeaker: XR_game_object): boolean {
  return registry.actor.money() >= 1000;
}

/**
 * todo;
 */
export function zat_b215_actor_has_no_money_poor(firstSpeaker: XR_game_object, secondSpeaker: XR_game_object): boolean {
  return registry.actor.money() < 1000;
}

/**
 * todo;
 */
export function zat_b215_actor_has_money_poor_pripyat(
  firstSpeaker: XR_game_object,
  secondSpeaker: XR_game_object
): boolean {
  return registry.actor.money() >= 4000;
}

/**
 * todo;
 */
export function zat_b215_actor_has_no_money_poor_pripyat(
  firstSpeaker: XR_game_object,
  secondSpeaker: XR_game_object
): boolean {
  return registry.actor.money() < 4000;
}

/**
 * todo;
 */
export function zat_b215_actor_has_money_rich(firstSpeaker: XR_game_object, secondSpeaker: XR_game_object): boolean {
  return registry.actor.money() >= 3000;
}

/**
 * todo;
 */
export function zat_b215_actor_has_no_money_rich(firstSpeaker: XR_game_object, secondSpeaker: XR_game_object): boolean {
  return registry.actor.money() < 3000;
}

/**
 * todo;
 */
export function zat_b215_actor_has_money_rich_pripyat(
  firstSpeaker: XR_game_object,
  secondSpeaker: XR_game_object
): boolean {
  return registry.actor.money() >= 6000;
}

/**
 * todo;
 */
export function zat_b215_actor_has_no_money_rich_pripyat(
  firstSpeaker: XR_game_object,
  secondSpeaker: XR_game_object
): boolean {
  return registry.actor.money() < 6000;
}

/**
 * todo;
 */
export function zat_b215_relocate_money_poor(firstSpeaker: XR_game_object, secondSpeaker: XR_game_object): void {
  transferMoneyFromActor(getNpcSpeaker(firstSpeaker, secondSpeaker), 1000);
}

/**
 * todo;
 */
export function zat_b215_relocate_money_poor_pripyat(
  firstSpeaker: XR_game_object,
  secondSpeaker: XR_game_object
): void {
  transferMoneyFromActor(getNpcSpeaker(firstSpeaker, secondSpeaker), 4000);
}

/**
 * todo;
 */
export function zat_b215_relocate_money_rich(firstSpeaker: XR_game_object, secondSpeaker: XR_game_object): void {
  transferMoneyFromActor(getNpcSpeaker(firstSpeaker, secondSpeaker), 3000);
}

/**
 * todo;
 */
export function zat_b215_relocate_money_rich_pripyat(
  firstSpeaker: XR_game_object,
  secondSpeaker: XR_game_object
): void {
  transferMoneyFromActor(getNpcSpeaker(firstSpeaker, secondSpeaker), 6000);
}

/**
 * todo;
 */
export function zat_b44_actor_has_pda_global(firstSpeaker: XR_game_object, secondSpeaker: XR_game_object): boolean {
  return (
    registry.actor.object(quest_items.zat_b39_joker_pda) !== null ||
    registry.actor.object(quest_items.zat_b44_barge_pda) !== null
  );
}

/**
 * todo;
 */
export function zat_b44_actor_has_not_pda_global(firstSpeaker: XR_game_object, secondSpeaker: XR_game_object): boolean {
  return (
    registry.actor.object(quest_items.zat_b39_joker_pda) === null ||
    registry.actor.object(quest_items.zat_b44_barge_pda) === null
  );
}

/**
 * todo;
 */
export function zat_b44_actor_has_pda_barge(firstSpeaker: XR_game_object, secondSpeaker: XR_game_object): boolean {
  return registry.actor.object(quest_items.zat_b44_barge_pda) !== null;
}

/**
 * todo;
 */
export function zat_b44_actor_has_pda_joker(firstSpeaker: XR_game_object, secondSpeaker: XR_game_object): boolean {
  return registry.actor.object(quest_items.zat_b39_joker_pda) !== null;
}

/**
 * todo;
 */
export function zat_b44_actor_has_pda_both(firstSpeaker: XR_game_object, secondSpeaker: XR_game_object): boolean {
  return (
    registry.actor.object(quest_items.zat_b39_joker_pda) !== null &&
    registry.actor.object(quest_items.zat_b44_barge_pda) !== null
  );
}

/**
 * todo;
 */
export function zat_b44_transfer_pda_barge(firstSpeaker: XR_game_object, secondSpeaker: XR_game_object): void {
  transferItemsFromActor(getNpcSpeaker(firstSpeaker, secondSpeaker), quest_items.zat_b44_barge_pda);
}

/**
 * todo;
 */
export function zat_b44_transfer_pda_joker(firstSpeaker: XR_game_object, secondSpeaker: XR_game_object): void {
  transferItemsFromActor(getNpcSpeaker(firstSpeaker, secondSpeaker), quest_items.zat_b39_joker_pda);
}

/**
 * todo;
 */
export function zat_b44_transfer_pda_both(firstSpeaker: XR_game_object, secondSpeaker: XR_game_object): void {
  transferItemsFromActor(getNpcSpeaker(firstSpeaker, secondSpeaker), quest_items.zat_b44_barge_pda);
  transferItemsFromActor(getNpcSpeaker(firstSpeaker, secondSpeaker), quest_items.zat_b39_joker_pda);
}

/**
 * todo;
 */
export function zat_b44_frends_dialog_enabled(firstSpeaker: XR_game_object, secondSpeaker: XR_game_object): boolean {
  const a =
    hasAlifeInfo(infoPortions.zat_b3_tech_have_couple_dose) && hasAlifeInfo(infoPortions.zat_b3_tech_discount_1);
  const b = zat_b44_actor_has_pda_global(firstSpeaker, secondSpeaker);

  return a || b;
}

/**
 * todo;
 */
export function zat_b53_if_actor_has_detector_advanced(
  firstSpeaker: XR_game_object,
  secondSpeaker: XR_game_object
): boolean {
  return (
    actorHasItem(detectors.detector_advanced) ||
    actorHasItem(detectors.detector_elite) ||
    actorHasItem(detectors.detector_scientific)
  );
}

/**
 * todo;
 */
export function zat_b53_transfer_medkit_to_npc(firstSpeaker: XR_game_object, secondSpeaker: XR_game_object): void {
  let section: Optional<TDrugItem> = null;
  const actor: XR_game_object = registry.actor;

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

  alife().release(alife().object(actor.object(section)!.id()), true);
  NotificationManager.getInstance().sendItemRelocatedNotification(ENotificationDirection.OUT, section, 1);
  actor.change_character_reputation(10);
}

/**
 * todo;
 */
export function is_zat_b106_hunting_time(firstSpeaker: XR_game_object, secondSpeaker: XR_game_object): boolean {
  if (level.get_time_hours() >= 2 && level.get_time_hours() < 5) {
    if (level.get_time_hours() > 2) {
      return true;
    } else if (level.get_time_minutes() >= 45) {
      return true;
    }
  }

  return false;
}

/**
 * todo;
 */
export function is_not_zat_b106_hunting_time(firstSpeaker: XR_game_object, secondSpeaker: XR_game_object): boolean {
  if (level.get_time_hours() >= 2 && level.get_time_hours() < 5) {
    if (level.get_time_hours() > 2) {
      return false;
    } else if (level.get_time_minutes() >= 45) {
      return false;
    }
  }

  return true;
}

/**
 * todo;
 */
export function zat_b53_if_actor_hasnt_detector_advanced(
  firstSpeaker: XR_game_object,
  secondSpeaker: XR_game_object
): boolean {
  return !zat_b53_if_actor_has_detector_advanced(firstSpeaker, secondSpeaker);
}

/**
 * todo;
 */
export function zat_b53_transfer_detector_advanced_to_actor(
  firstSpeaker: XR_game_object,
  secondSpeaker: XR_game_object
): void {
  transferItemsToActor(getNpcSpeaker(firstSpeaker, secondSpeaker), detectors.detector_advanced);
}

/**
 * todo;
 */
export function zat_b53_transfer_fireball_to_actor(firstSpeaker: XR_game_object, secondSpeaker: XR_game_object): void {
  transferItemsToActor(getNpcSpeaker(firstSpeaker, secondSpeaker), artefacts.af_fireball);
}

/**
 * todo;
 */
export function zat_b53_transfer_medkit_to_actor(firstSpeaker: XR_game_object, secondSpeaker: XR_game_object): void {
  transferItemsToActor(getNpcSpeaker(firstSpeaker, secondSpeaker), drugs.medkit);
}

/**
 * todo;
 */
export function zat_b106_soroka_reward(firstSpeaker: XR_game_object, secondSpeaker: XR_game_object): void {
  if (
    hasAlifeInfo(infoPortions.jup_b25_flint_blame_done_to_duty) ||
    hasAlifeInfo(infoPortions.jup_b25_flint_blame_done_to_freedom)
  ) {
    giveMoneyToActor(1000);
  } else {
    giveMoneyToActor(3000);
  }
}

/**
 * todo;
 */
export function zat_b103_actor_has_needed_food(firstSpeaker: XR_game_object, secondSpeaker: XR_game_object): boolean {
  const actor: XR_game_object = registry.actor;
  const item_sections = [food.bread, food.kolbasa, food.conserva] as unknown as LuaArray<TFoodItem>;

  let count = 0;

  for (const [k, item_section] of item_sections) {
    registry.actor.iterate_inventory((temp, item) => {
      if (item.section() === item_section) {
        count = count + 1;
      }
    }, actor);
  }

  return count >= 6;
}

/**
 * todo;
 */
export function zat_b106_transfer_weap_to_actor(firstSpeaker: XR_game_object, secondSpeaker: XR_game_object): void {
  transferItemsToActor(getNpcSpeaker(firstSpeaker, secondSpeaker), weapons.wpn_spas12);
}

/**
 * todo;
 */
export function zat_b106_give_reward(firstSpeaker: XR_game_object, secondSpeaker: XR_game_object): void {
  TreasureManager.giveActorTreasureCoordinates(treasures.zat_hiding_place_50);
}

/**
 * todo;
 */
export function zat_b3_tech_drinks_precond(firstSpeaker: XR_game_object, secondSpeaker: XR_game_object): boolean {
  if (hasAlifeInfo(infoPortions.zat_b3_gauss_repaired) && !hasAlifeInfo(infoPortions.zat_b3_tech_drink_no_more)) {
    return true;
  } else if (!hasAlifeInfo(infoPortions.zat_b3_tech_see_produce_62)) {
    return true;
  }

  return false;
}

/**
 * todo;
 */
export function zat_b106_soroka_gone(firstSpeaker: XR_game_object, secondSpeaker: XR_game_object): boolean {
  return (
    hasAlifeInfo(infoPortions.jup_b25_flint_blame_done_to_duty) ||
    hasAlifeInfo(infoPortions.jup_b25_flint_blame_done_to_freedom)
  );
}

/**
 * todo;
 */
export function zat_b106_soroka_not_gone(firstSpeaker: XR_game_object, secondSpeaker: XR_game_object): boolean {
  return !zat_b106_soroka_gone(firstSpeaker, secondSpeaker);
}

/**
 * todo;
 */
export function zat_b22_actor_has_proof(firstSpeaker: XR_game_object, secondSpeaker: XR_game_object): boolean {
  return actorHasItem(infoPortions.zat_b22_medic_pda);
}

/**
 * todo;
 */
export function zat_b22_transfer_proof(firstSpeaker: XR_game_object, secondSpeaker: XR_game_object): void {
  transferItemsFromActor(getNpcSpeaker(firstSpeaker, secondSpeaker), infoPortions.zat_b22_medic_pda);
}

/**
 * todo;
 */
export function zat_b5_stalker_transfer_money(firstSpeaker: XR_game_object, secondSpeaker: XR_game_object): void {
  giveMoneyToActor(2500);
  TreasureManager.giveActorTreasureCoordinates(treasures.zat_hiding_place_7);
}

/**
 * todo;
 */
export function zat_b5_dealer_full_revard(firstSpeaker: XR_game_object, secondSpeaker: XR_game_object): void {
  giveMoneyToActor(6_000);
}

/**
 * todo;
 */
export function zat_b5_dealer_easy_revard(firstSpeaker: XR_game_object, secondSpeaker: XR_game_object): void {
  giveMoneyToActor(3_000);
}

/**
 * todo;
 */
export function zat_b5_bandits_revard(firstSpeaker: XR_game_object, secondSpeaker: XR_game_object): void {
  giveMoneyToActor(5_000);
  TreasureManager.giveActorTreasureCoordinates(treasures.zat_hiding_place_20);
}

/**
 * todo;
 */
export function zat_a23_actor_has_access_card(firstSpeaker: XR_game_object, secondSpeaker: XR_game_object): boolean {
  return registry.actor.object(quest_items.zat_a23_access_card) !== null;
}

/**
 * todo;
 */
export function zat_a23_transfer_access_card_to_tech(
  firstSpeaker: XR_game_object,
  secondSpeaker: XR_game_object
): void {
  transferItemsFromActor(getNpcSpeaker(firstSpeaker, secondSpeaker), quest_items.zat_a23_access_card);
  transferItemsToActor(getNpcSpeaker(firstSpeaker, secondSpeaker), drugs.medkit_scientic, 3);
}

/**
 * todo;
 */
// --// --- b57 new // --// --
export function zat_b57_stalker_reward_to_actor_detector(
  firstSpeaker: XR_game_object,
  secondSpeaker: XR_game_object
): void {
  transferItemsToActor(getNpcSpeaker(firstSpeaker, secondSpeaker), detectors.detector_elite);
  TreasureManager.giveActorTreasureCoordinates(treasures.zat_hiding_place_54);
}

/**
 * todo;
 */
export function actor_has_gas(firstSpeaker: XR_game_object, secondSpeaker: XR_game_object): boolean {
  return registry.actor.object(quest_items.zat_b57_gas) !== null;
}

/**
 * todo;
 */
export function actor_has_not_gas(firstSpeaker: XR_game_object, secondSpeaker: XR_game_object): boolean {
  return !actor_has_gas(firstSpeaker, secondSpeaker);
}

/**
 * todo;
 */
export function zat_b57_actor_has_money(firstSpeaker: XR_game_object, secondSpeaker: XR_game_object): boolean {
  return registry.actor.money() >= 2000;
}

/**
 * todo;
 */
export function zat_b57_actor_hasnt_money(firstSpeaker: XR_game_object, secondSpeaker: XR_game_object): boolean {
  return !zat_b57_actor_has_money(firstSpeaker, secondSpeaker);
}

/**
 * todo;
 */
export function zat_b57_transfer_gas_money(firstSpeaker: XR_game_object, secondSpeaker: XR_game_object): void {
  transferMoneyFromActor(getNpcSpeaker(firstSpeaker, secondSpeaker), 2000);
}
