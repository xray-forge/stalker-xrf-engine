/* eslint @typescript-eslint/explicit-function-return-type: "error" */

import { alife, game, level, XR_game_object } from "xray16";

import { captions } from "@/mod/globals/captions";
import { info_portions } from "@/mod/globals/info_portions/info_portions";
import { ammo } from "@/mod/globals/items/ammo";
import { artefacts, TArtefact } from "@/mod/globals/items/artefacts";
import { detectors } from "@/mod/globals/items/detectors";
import { drugs, TDrugItem } from "@/mod/globals/items/drugs";
import { food, TFoodItem } from "@/mod/globals/items/food";
import { helmets } from "@/mod/globals/items/helmets";
import { misc } from "@/mod/globals/items/misc";
import { outfits } from "@/mod/globals/items/outfits";
import { quest_items } from "@/mod/globals/items/quest_items";
import { TWeapon, weapons } from "@/mod/globals/items/weapons";
import { AnyCallablesModule, AnyObject, LuaArray, Optional } from "@/mod/lib/types";
import { anomalyByName, getActor } from "@/mod/scripts/core/db";
import { pstor_retrieve, pstor_store } from "@/mod/scripts/core/db/pstor";
import { relocate_item } from "@/mod/scripts/core/NewsManager";
import { getTreasureManager } from "@/mod/scripts/core/TreasureManager";
import { counter_greater } from "@/mod/scripts/globals/conditions";
import { disableInfo, giveInfo, hasAlifeInfo } from "@/mod/scripts/utils/actor";
import { LuaLogger } from "@/mod/scripts/utils/logging";
import {
  actorHasAtLeastOneItem,
  actorHasItem,
  getActorSpeaker,
  getNpcSpeaker,
  giveItemsToActor,
  giveMoneyToActor,
  isNpcName,
  npcHasItem,
  relocateQuestItemSection,
  takeItemsFromActor,
  takeMoneyFromActor,
} from "@/mod/scripts/utils/quests";

const logger: LuaLogger = new LuaLogger("dialogs_zaton");

/**
 * todo;
 */
export function zat_b30_owl_stalker_trader_actor_has_item_to_sell(
  first_speaker: XR_game_object,
  second_speaker: XR_game_object
): boolean {
  const items_table: LuaArray<string> = [
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
  ] as unknown as LuaArray<string>;

  const info_table = {
    [quest_items.jup_b1_half_artifact]: info_portions.zat_b30_owl_stalker_about_halfart_jup_b6_asked,
    [artefacts.af_quest_b14_twisted]: info_portions.zat_b30_owl_stalker_about_halfart_zat_b14_asked,
    [artefacts.af_oasis_heart]: info_portions.zat_b30_owl_stalker_trader_about_osis_art,
    [detectors.detector_scientific]: info_portions.zat_b30_owl_detectors_approached,
  } as unknown as LuaTable<string, string>;

  const actor: XR_game_object = getActor() as XR_game_object;

  for (const [k, v] of items_table) {
    if (actor.object(v) !== null) {
      if (v === detectors.detector_scientific && !hasAlifeInfo(info_portions.zat_b30_second_detector)) {
        // --
      } else {
        if (info_table.get(v) !== null) {
          if (!hasAlifeInfo(info_table.get(v))) {
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
export function zat_b30_owl_can_say_about_heli(first_speaker: XR_game_object, second_speaker: XR_game_object): boolean {
  const table = [
    info_portions.zat_b28_heli_3_searched,
    info_portions.zat_b100_heli_2_searched,
    info_portions.zat_b101_heli_5_searched,
  ] as unknown as LuaArray<string>;

  const table2 = [
    info_portions.zat_b30_owl_scat_1,
    info_portions.zat_b30_owl_scat_2,
    info_portions.zat_b30_owl_scat_3,
  ] as unknown as LuaArray<string>;

  let cnt: number = 3;

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
export function zat_b30_actor_has_1000(first_speaker: XR_game_object, second_speaker: XR_game_object): boolean {
  return getActor()!.money() >= 1000;
}

/**
 * todo;
 */
export function zat_b30_actor_has_200(first_speaker: XR_game_object, second_speaker: XR_game_object): boolean {
  return getActor()!.money() >= 200;
}

/**
 * todo;
 */
export function zat_b30_actor_has_pri_b36_monolith_hiding_place_pda(
  first_speaker: XR_game_object,
  second_speaker: XR_game_object
): boolean {
  return getActor()!.object(quest_items.pri_b36_monolith_hiding_place_pda) !== null;
}

/**
 * todo;
 */
export function zat_b30_actor_has_pri_b306_envoy_pda(
  first_speaker: XR_game_object,
  second_speaker: XR_game_object
): boolean {
  return getActor()!.object(quest_items.pri_b306_envoy_pda) !== null;
}

/**
 * todo;
 */
export function zat_b30_actor_has_jup_b10_strelok_notes_1(
  first_speaker: XR_game_object,
  second_speaker: XR_game_object
): boolean {
  return getActor()!.object(quest_items.jup_b10_notes_01) !== null;
}

/**
 * todo;
 */
export function zat_b30_actor_has_jup_b10_strelok_notes_2(
  first_speaker: XR_game_object,
  second_speaker: XR_game_object
): boolean {
  return getActor()!.object(quest_items.jup_b10_notes_02) !== null;
}

/**
 * todo;
 */
export function zat_b30_actor_has_jup_b10_strelok_notes_3(
  first_speaker: XR_game_object,
  second_speaker: XR_game_object
): boolean {
  return getActor()!.object(quest_items.jup_b10_notes_03) !== null;
}

/**
 * todo;
 */
export function zat_b30_actor_has_detector_scientific(
  first_speaker: XR_game_object,
  second_speaker: XR_game_object
): boolean {
  return getActor()!.object(detectors.detector_scientific) !== null;
}

/**
 * todo;
 */
export function zat_b30_actor_has_device_flash_snag(
  first_speaker: XR_game_object,
  second_speaker: XR_game_object
): boolean {
  return getActor()!.object(quest_items.device_flash_snag) !== null;
}

/**
 * todo;
 */
export function zat_b30_actor_has_device_pda_port_bandit_leader(
  first_speaker: XR_game_object,
  second_speaker: XR_game_object
): boolean {
  return getActor()!.object(quest_items.device_pda_port_bandit_leader) !== null;
}

/**
 * todo;
 */
export function zat_b30_actor_has_jup_b10_ufo_memory(
  first_speaker: XR_game_object,
  second_speaker: XR_game_object
): boolean {
  return getActor()!.object(quest_items.jup_b10_ufo_memory_2) !== null;
}

/**
 * todo;
 */
export function zat_b30_actor_has_jup_b202_bandit_pda(
  first_speaker: XR_game_object,
  second_speaker: XR_game_object
): boolean {
  return getActor()!.object(quest_items.jup_b202_bandit_pda) !== null;
}

/**
 * todo;
 */
export function zat_b30_transfer_1000(first_speaker: XR_game_object, second_speaker: XR_game_object): void {
  takeMoneyFromActor(first_speaker, second_speaker, 1000);
}

/**
 * todo;
 */
export function zat_b30_transfer_200(first_speaker: XR_game_object, second_speaker: XR_game_object): void {
  takeMoneyFromActor(first_speaker, second_speaker, 200);
}

/**
 * todo;
 */
export function zat_b30_sell_pri_b36_monolith_hiding_place_pda(
  first_speaker: XR_game_object,
  second_speaker: XR_game_object
): void {
  takeItemsFromActor(first_speaker, second_speaker, quest_items.pri_b36_monolith_hiding_place_pda);
  giveMoneyToActor(5000);
}

/**
 * todo;
 */
export function zat_b30_sell_pri_b306_envoy_pda(first_speaker: XR_game_object, second_speaker: XR_game_object): void {
  takeItemsFromActor(first_speaker, second_speaker, quest_items.pri_b306_envoy_pda);
  giveMoneyToActor(4000);
}

/**
 * todo;
 */
export function zat_b30_sell_jup_b207_merc_pda_with_contract(
  first_speaker: XR_game_object,
  second_speaker: XR_game_object
): void {
  takeItemsFromActor(first_speaker, second_speaker, quest_items.jup_b207_merc_pda_with_contract);
  giveMoneyToActor(1000);
  giveInfo(info_portions.jup_b207_merc_pda_with_contract_sold);
}

/**
 * todo;
 */
export function zat_b30_sell_jup_b10_strelok_notes_1(
  first_speaker: XR_game_object,
  second_speaker: XR_game_object
): void {
  takeItemsFromActor(first_speaker, second_speaker, quest_items.jup_b10_notes_01);
  giveMoneyToActor(500);
}

/**
 * todo;
 */
export function zat_b30_sell_jup_b10_strelok_notes_2(
  first_speaker: XR_game_object,
  second_speaker: XR_game_object
): void {
  takeItemsFromActor(first_speaker, second_speaker, quest_items.jup_b10_notes_02);
  giveMoneyToActor(500);
}

/**
 * todo;
 */
export function zat_b30_sell_jup_b10_strelok_notes_3(
  first_speaker: XR_game_object,
  second_speaker: XR_game_object
): void {
  takeItemsFromActor(first_speaker, second_speaker, quest_items.jup_b10_notes_03);
  giveMoneyToActor(500);
}

/**
 * todo;
 */
export function jup_a9_owl_stalker_trader_sell_jup_a9_evacuation_info(
  first_speaker: XR_game_object,
  second_speaker: XR_game_object
): void {
  takeItemsFromActor(first_speaker, second_speaker, quest_items.jup_a9_evacuation_info);
  giveMoneyToActor(750);
  giveInfo(info_portions.jup_a9_evacuation_info_sold);
}

/**
 * todo;
 */
export function jup_a9_owl_stalker_trader_sell_jup_a9_meeting_info(
  first_speaker: XR_game_object,
  second_speaker: XR_game_object
): void {
  takeItemsFromActor(first_speaker, second_speaker, quest_items.jup_a9_meeting_info);
  giveMoneyToActor(750);
  giveInfo(info_portions.jup_a9_meeting_info_sold);
}

/**
 * todo;
 */
export function jup_a9_owl_stalker_trader_sell_jup_a9_losses_info(
  first_speaker: XR_game_object,
  second_speaker: XR_game_object
): void {
  takeItemsFromActor(first_speaker, second_speaker, quest_items.jup_a9_losses_info);
  giveMoneyToActor(750);
  giveInfo(info_portions.jup_a9_losses_info_sold);
}

/**
 * todo;
 */
export function jup_a9_owl_stalker_trader_sell_jup_a9_delivery_info(
  first_speaker: XR_game_object,
  second_speaker: XR_game_object
): void {
  takeItemsFromActor(first_speaker, second_speaker, quest_items.jup_a9_delivery_info);
  giveMoneyToActor(750);
  giveInfo(info_portions.jup_a9_delivery_info_sold);
}

/**
 * todo;
 */
export function zat_b30_owl_stalker_trader_sell_device_flash_snag(
  first_speaker: XR_game_object,
  second_speaker: XR_game_object
): void {
  takeItemsFromActor(first_speaker, second_speaker, quest_items.device_flash_snag);
  giveMoneyToActor(200);
  getActor()!.give_info_portion(info_portions.device_flash_snag_sold);
}

/**
 * todo;
 */
export function zat_b30_owl_stalker_trader_sell_device_pda_port_bandit_leader(
  first_speaker: XR_game_object,
  second_speaker: XR_game_object
): void {
  takeItemsFromActor(first_speaker, second_speaker, quest_items.device_pda_port_bandit_leader);
  giveMoneyToActor(1000);
  giveInfo(info_portions.device_pda_port_bandit_leader_sold);
}

/**
 * todo;
 */
export function zat_b30_owl_stalker_trader_sell_jup_b10_ufo_memory(
  first_speaker: XR_game_object,
  second_speaker: XR_game_object
): void {
  takeItemsFromActor(first_speaker, second_speaker, quest_items.jup_b10_ufo_memory_2);
  giveMoneyToActor(500);
  giveInfo(info_portions.jup_b10_ufo_memory_2_sold);
}

/**
 * todo;
 */
export function zat_b30_owl_stalker_trader_sell_jup_b202_bandit_pda(
  first_speaker: XR_game_object,
  second_speaker: XR_game_object
): void {
  takeItemsFromActor(first_speaker, second_speaker, quest_items.jup_b202_bandit_pda);
  giveMoneyToActor(500);
}

/**
 * todo;
 */
export function zat_b14_bar_transfer_money(first_speaker: XR_game_object, second_speaker: XR_game_object): void {
  giveMoneyToActor(1000);
}

/**
 * todo;
 */
export function zat_b14_transfer_artefact(first_speaker: XR_game_object, second_speaker: XR_game_object): void {
  takeItemsFromActor(first_speaker, second_speaker, artefacts.af_quest_b14_twisted);
}

/**
 * todo;
 */
export function actor_has_artefact(first_speaker: XR_game_object, second_speaker: XR_game_object): boolean {
  return first_speaker.object(artefacts.af_quest_b14_twisted) !== null;
}

/**
 * todo;
 */
export function actor_hasnt_artefact(first_speaker: XR_game_object, second_speaker: XR_game_object): boolean {
  return !actor_has_artefact(first_speaker, second_speaker);
}

/**
 * todo;
 */
export function zat_b7_give_bandit_reward_to_actor(
  first_speaker: XR_game_object,
  second_speaker: XR_game_object
): void {
  giveMoneyToActor(math.random(15, 30) * 100);
  getTreasureManager().give_treasure("zat_hiding_place_30");
}

/**
 * todo;
 */
export function zat_b7_give_stalker_reward_to_actor(
  first_speaker: XR_game_object,
  second_speaker: XR_game_object
): void {
  const reward = math.random(1, 3);

  if (reward === 1) {
    giveItemsToActor(first_speaker, second_speaker, drugs.bandage, 6);
    giveItemsToActor(first_speaker, second_speaker, food.vodka, 4);
  }

  if (reward === 2) {
    giveItemsToActor(first_speaker, second_speaker, drugs.medkit, 2);
    giveItemsToActor(first_speaker, second_speaker, food.vodka, 4);
  }

  if (reward === 3) {
    giveItemsToActor(first_speaker, second_speaker, drugs.antirad, 3);
    giveItemsToActor(first_speaker, second_speaker, food.vodka, 4);
  }

  getTreasureManager().give_treasure("zat_hiding_place_29");
}

/**
 * todo;
 */
export function zat_b7_give_stalker_reward_2_to_actor(
  first_speaker: XR_game_object,
  second_speaker: XR_game_object
): void {
  giveItemsToActor(first_speaker, second_speaker, drugs.bandage, 4);
  giveItemsToActor(first_speaker, second_speaker, drugs.medkit, 2);
  giveItemsToActor(first_speaker, second_speaker, drugs.antirad, 2);
}

/**
 * todo;
 */
export function zat_b7_rob_actor(first_speaker: XR_game_object, second_speaker: XR_game_object): void {
  let amount = math.floor((getActor()!.money() * math.random(75, 100)) / 100);

  if (getActor()!.money() < amount) {
    amount = getActor()!.money();
  }

  takeMoneyFromActor(first_speaker, second_speaker, amount);
}

/**
 * todo;
 */
export function zat_b7_killed_self_precond(first_speaker: XR_game_object, second_speaker: XR_game_object): boolean {
  if (
    hasAlifeInfo(info_portions.zat_b7_stalkers_raiders_meet) ||
    hasAlifeInfo(info_portions.zat_b7_victims_disappeared)
  ) {
    return false;
  }

  if (get_global<AnyCallablesModule>("xr_conditions").squad_exist(null, null, ["zat_b7_stalkers_victims_1"])) {
    return false;
  }

  return true;
}

/**
 * todo;
 */
export function zat_b7_squad_alive(first_speaker: XR_game_object, second_speaker: XR_game_object): boolean {
  if (get_global<AnyCallablesModule>("xr_conditions").squad_exist(null, null, ["zat_b7_stalkers_victims_1"])) {
    return true;
  }

  return false;
}

/**
 * todo;
 */
export function zat_b103_transfer_merc_supplies(first_speaker: XR_game_object, second_speaker: XR_game_object): void {
  const npc = getNpcSpeaker(first_speaker, second_speaker);
  const actor = getActorSpeaker(first_speaker, second_speaker);
  let i = 6;

  const item_sections = [food.conserva, food.kolbasa, food.bread];

  for (const [k, section] of item_sections) {
    const j = i;

    actor.iterate_inventory((temp, item) => {
      if (item.section() === section && i !== 0) {
        actor.transfer_item(item, npc);
        i = i - 1;
      }
    }, actor);

    if (j - i !== 0) {
      relocate_item(actor, "out", section, j - i);
    }
  }
}

/**
 * todo;
 */
export function zat_b33_set_counter_10(first_speaker: XR_game_object, second_speaker: XR_game_object): void {
  const actor = getActorSpeaker(first_speaker, second_speaker);

  get_global<AnyCallablesModule>("xr_effects").set_counter(actor, null, ["zat_b33_items", 10]);
}

/**
 * todo;
 */
export function zat_b33_counter_ge_2(first_speaker: XR_game_object, second_speaker: XR_game_object): boolean {
  const actor = getActorSpeaker(first_speaker, second_speaker);

  return get_global<AnyCallablesModule>("xr_conditions").counter_greater(actor, null, ["zat_b33_items", 1]);
}

/**
 * todo;
 */
export function zat_b33_counter_ge_4(first_speaker: XR_game_object, second_speaker: XR_game_object): boolean {
  const actor = getActorSpeaker(first_speaker, second_speaker);

  return get_global<AnyCallablesModule>("xr_conditions").counter_greater(actor, null, ["zat_b33_items", 3]);
}

/**
 * todo;
 */
export function zat_b33_counter_ge_8(first_speaker: XR_game_object, second_speaker: XR_game_object): boolean {
  const actor = getActorSpeaker(first_speaker, second_speaker);

  return get_global<AnyCallablesModule>("xr_conditions").counter_greater(actor, null, ["zat_b33_items", 7]);
}

/**
 * todo;
 */
export function zat_b33_counter_le_2(first_speaker: XR_game_object, second_speaker: XR_game_object): boolean {
  return !zat_b33_counter_ge_2(first_speaker, second_speaker);
}

/**
 * todo;
 */
export function zat_b33_counter_le_4(first_speaker: XR_game_object, second_speaker: XR_game_object): boolean {
  return !zat_b33_counter_ge_4(first_speaker, second_speaker);
}

/**
 * todo;
 */
export function zat_b33_counter_le_8(first_speaker: XR_game_object, second_speaker: XR_game_object): boolean {
  return !zat_b33_counter_ge_8(first_speaker, second_speaker);
}

/**
 * todo;
 */
export function zat_b33_counter_de_2(first_speaker: XR_game_object, second_speaker: XR_game_object): boolean {
  const actor = getActorSpeaker(first_speaker, second_speaker);

  return get_global<AnyCallablesModule>("xr_effects").dec_counter(actor, null, ["zat_b33_items", 2]);
}

/**
 * todo;
 */
export function zat_b33_counter_de_4(first_speaker: XR_game_object, second_speaker: XR_game_object): boolean {
  const actor = getActorSpeaker(first_speaker, second_speaker);

  return get_global<AnyCallablesModule>("xr_effects").dec_counter(actor, null, ["zat_b33_items", 4]);
}

/**
 * todo;
 */
export function zat_b33_counter_de_8(first_speaker: XR_game_object, second_speaker: XR_game_object): boolean {
  const actor = getActorSpeaker(first_speaker, second_speaker);

  return get_global<AnyCallablesModule>("xr_effects").dec_counter(actor, null, ["zat_b33_items", 8]);
}

/**
 * todo;
 */
export function zat_b33_counter_eq_10(first_speaker: XR_game_object, second_speaker: XR_game_object): boolean {
  const actor = getActorSpeaker(first_speaker, second_speaker);

  return get_global<AnyCallablesModule>("xr_conditions").counter_equal(actor, null, ["zat_b33_items", 10]);
}

/**
 * todo;
 */
export function zat_b33_counter_ne_10(first_speaker: XR_game_object, second_speaker: XR_game_object): boolean {
  return !zat_b33_counter_eq_10(first_speaker, second_speaker);
}

/**
 * todo;
 */
export function zat_b33_transfer_first_item(first_speaker: XR_game_object, second_speaker: XR_game_object): void {
  relocateQuestItemSection(getActorSpeaker(first_speaker, second_speaker), quest_items.wpn_fort_snag, "in");
}

/**
 * todo;
 */
export function zat_b103_transfer_mechanic_toolkit_2(
  first_speaker: XR_game_object,
  second_speaker: XR_game_object
): void {
  takeItemsFromActor(first_speaker, second_speaker, misc.toolkit_2);
}

/**
 * todo;
 */
export function check_npc_name_mechanics(first_speaker: XR_game_object, second_speaker: XR_game_object): boolean {
  return (
    !get_global<AnyCallablesModule>("xr_conditions").check_npc_name(first_speaker, second_speaker, ["mechanic"]) &&
    !get_global<AnyCallablesModule>("xr_conditions").check_npc_name(first_speaker, second_speaker, [
      "zat_b103_lost_merc",
    ]) &&
    !get_global<AnyCallablesModule>("xr_conditions").check_npc_name(first_speaker, second_speaker, ["tech"]) &&
    !get_global<AnyCallablesModule>("xr_conditions").check_npc_name(first_speaker, second_speaker, ["zulus"]) &&
    get_global<AnyCallablesModule>("xr_conditions").check_npc_name(first_speaker, second_speaker, ["stalker"])
  );
}

/**
 * todo;
 */
export function zat_b33_transfer_second_item(first_speaker: XR_game_object, second_speaker: XR_game_object): void {
  const actor = getActorSpeaker(first_speaker, second_speaker);

  relocateQuestItemSection(actor, drugs.medkit_scientic, "in", 3);
  relocateQuestItemSection(actor, drugs.antirad, "in", 3);
  relocateQuestItemSection(actor, drugs.bandage, "in", 5);
}

/**
 * todo;
 */
export function zat_b33_transfer_third_item(first_speaker: XR_game_object, second_speaker: XR_game_object): void {
  const actor = getActorSpeaker(first_speaker, second_speaker);

  relocateQuestItemSection(actor, quest_items.wpn_ak74u_snag, "in");
}

/**
 * todo;
 */
export function zat_b33_transfer_fourth_item(first_speaker: XR_game_object, second_speaker: XR_game_object): void {
  const actor = getActorSpeaker(first_speaker, second_speaker);

  relocateQuestItemSection(actor, artefacts.af_soul, "in");
}

/**
 * todo;
 */
export function zat_b33_transfer_fifth_item(first_speaker: XR_game_object, second_speaker: XR_game_object): void {
  const actor = getActorSpeaker(first_speaker, second_speaker);

  relocateQuestItemSection(actor, quest_items.helm_hardhat_snag, "in");
}

/**
 * todo;
 */
export function zat_b33_transfer_safe_container(first_speaker: XR_game_object, second_speaker: XR_game_object): void {
  relocateQuestItemSection(getNpcSpeaker(first_speaker, second_speaker), quest_items.zat_b33_safe_container, "out");
}

/**
 * todo;
 */
export function zat_b33_aractor_has_habar(first_speaker: XR_game_object, second_speaker: XR_game_object): boolean {
  return getActor()!.object(quest_items.zat_b33_safe_container) !== null;
}

/**
 * todo;
 */
export function zat_b33_actor_hasnt_habar(first_speaker: XR_game_object, second_speaker: XR_game_object): boolean {
  return !zat_b33_aractor_has_habar(first_speaker, second_speaker);
}

/**
 * todo;
 */
export function zat_b33_actor_has_needed_money(first_speaker: XR_game_object, second_speaker: XR_game_object): boolean {
  return getActor()!.money() >= 500;
}

/**
 * todo;
 */
export function zat_b33_actor_hasnt_needed_money(
  first_speaker: XR_game_object,
  second_speaker: XR_game_object
): boolean {
  return !zat_b33_actor_has_needed_money(first_speaker, second_speaker);
}

/**
 * todo;
 */
export function zat_b33_relocate_money(first_speaker: XR_game_object, second_speaker: XR_game_object): void {
  if (zat_b33_actor_has_needed_money(first_speaker, second_speaker)) {
    takeMoneyFromActor(first_speaker, second_speaker, 500);
  }
}

/**
 * todo;
 */
const zat_b29_af_table = {
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
const zat_b29_af_names_table = {
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
const zat_b29_infop_table = {
  [16]: "zat_b29_af_16",
  [17]: "zat_b29_af_17",
  [18]: "zat_b29_af_18",
  [19]: "zat_b29_af_19",
  [20]: "zat_b29_af_20",
  [21]: "zat_b29_af_21",
  [22]: "zat_b29_af_22",
  [23]: "zat_b29_af_23",
} as unknown as LuaArray<string>;

/**
 * todo;
 */
const zat_b29_infop_bring_table = {
  [16]: "zat_b29_bring_af_16",
  [17]: "zat_b29_bring_af_17",
  [18]: "zat_b29_bring_af_18",
  [19]: "zat_b29_bring_af_19",
  [20]: "zat_b29_bring_af_20",
  [21]: "zat_b29_bring_af_21",
  [22]: "zat_b29_bring_af_22",
  [23]: "zat_b29_bring_af_23",
} as unknown as LuaArray<string>;

/**
 * todo;
 */
export function zat_b29_create_af_in_anomaly(first_speaker: XR_game_object, second_speaker: XR_game_object): void {
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

  anomalyByName.get(zone_name).setForcedSpawnOverride(zat_b29_af_table.get(key as number));
}

/**
 * todo;
 */
export function zat_b29_linker_give_adv_task(first_speaker: XR_game_object, second_speaker: XR_game_object): string {
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
  first_speaker: XR_game_object,
  second_speaker: XR_game_object
): boolean {
  for (const i of $range(16, 23)) {
    if (hasAlifeInfo(zat_b29_infop_bring_table.get(i)) && getActor()!.object(zat_b29_af_table.get(i))) {
      return false;
    }
  }

  return true;
}

/**
 * todo;
 */
export function zat_b29_actor_has_adv_task_af(first_speaker: XR_game_object, second_speaker: XR_game_object): boolean {
  for (const i of $range(16, 23)) {
    if (hasAlifeInfo(zat_b29_infop_bring_table.get(i)) && getActor()!.object(zat_b29_af_table.get(i))) {
      return true;
    }
  }

  return false;
}

/**
 * todo;
 */
export function zat_b29_linker_get_adv_task_af(first_speaker: XR_game_object, second_speaker: XR_game_object): void {
  for (const i of $range(16, 23)) {
    if (hasAlifeInfo(zat_b29_infop_bring_table.get(i))) {
      disableInfo("zat_b29_adv_task_given");
      takeItemsFromActor(first_speaker, second_speaker, zat_b29_af_table.get(i));
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
export function zat_b29_actor_has_exchange_item(
  first_speaker: XR_game_object,
  second_speaker: XR_game_object
): boolean {
  const actor: XR_game_object = getActor() as XR_game_object;
  const actor_wpn_table = getGoodGunsInInventory(actor);

  if (actor_wpn_table.length() > 0) {
    (actor as AnyObject).good_gun = actor_wpn_table.get(math.random(1, actor_wpn_table.length()));
  }

  return (actor as AnyObject).good_gun !== null;
}

/**
 * todo;
 */
export function zat_b29_actor_exchange(first_speaker: XR_game_object, second_speaker: XR_game_object): void {
  const actor: XR_game_object = getActor() as XR_game_object;

  for (const i of $range(16, 23)) {
    if (hasAlifeInfo(zat_b29_infop_bring_table.get(i))) {
      if ((actor as AnyObject).good_gun !== null) {
        takeItemsFromActor(first_speaker, second_speaker, (actor as AnyObject).good_gun);
        giveItemsToActor(first_speaker, second_speaker, zat_b29_af_table.get(i));

        (actor as AnyObject).good_gun = null;
        break;
      }
    }
  }
}

/**
 * todo;
 */
export function zat_b30_transfer_percent(first_speaker: XR_game_object, second_speaker: XR_game_object): void {
  const actor: XR_game_object = getActor() as XR_game_object;
  const amount: number = math.random(5, 25) * 100;
  const days: number = pstor_retrieve(actor, "zat_b30_days_cnt", 0);

  giveMoneyToActor(amount * days);
  pstor_store(actor, "zat_b30_days_cnt", 0);
}

/**
 * todo;
 */
export function zat_b30_npc_has_detector(first_speaker: XR_game_object, second_speaker: XR_game_object): boolean {
  return npcHasItem(getNpcSpeaker(first_speaker, second_speaker), detectors.detector_scientific);
}

/**
 * todo;
 */
export function zat_b30_actor_second_exchange(first_speaker: XR_game_object, second_speaker: XR_game_object): void {
  giveItemsToActor(first_speaker, second_speaker, detectors.detector_scientific);
}

/**
 * todo;
 */
export function zat_b30_actor_exchange(first_speaker: XR_game_object, second_speaker: XR_game_object): void {
  const actor: XR_game_object = getActor() as XR_game_object;

  if ((actor as AnyObject).good_gun !== null) {
    takeItemsFromActor(first_speaker, second_speaker, (actor as AnyObject).good_gun);
    giveItemsToActor(first_speaker, second_speaker, detectors.detector_scientific);
    (actor as AnyObject).good_gun = null;
  }

  if (isNpcName(second_speaker, "zat_b29_stalker_rival_1")) {
    giveInfo(info_portions.zat_b30_rival_1_wo_detector);
  } else if (isNpcName(second_speaker, "zat_b29_stalker_rival_2")) {
    giveInfo(info_portions.zat_b30_rival_2_wo_detector);
  }
}

/**
 * todo;
 */
export function zat_b30_actor_has_two_detectors(
  first_speaker: XR_game_object,
  second_speaker: XR_game_object
): boolean {
  const actor: XR_game_object = getActor() as XR_game_object;
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
export function actor_has_nimble_weapon(first_speaker: XR_game_object, second_speaker: XR_game_object): boolean {
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
export function zat_b51_robbery(first_speaker: XR_game_object, second_speaker: XR_game_object): void {
  const actor: XR_game_object = getActor() as XR_game_object;
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
      takeItemsFromActor(first_speaker, second_speaker, k, "all");
    }
  }

  takeMoneyFromActor(first_speaker, second_speaker, amount);
}

/**
 * todo;
 */
export function zat_b51_rob_nimble_weapon(first_speaker: XR_game_object, second_speaker: XR_game_object): void {
  const actor: XR_game_object = getActor() as XR_game_object;
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
      takeItemsFromActor(first_speaker, second_speaker, k);

      return;
    } else if (actor.item_in_slot(3) !== null && actor.item_in_slot(3)!.section() === k) {
      takeItemsFromActor(first_speaker, second_speaker, k);

      return;
    }
  }

  if (actor_has_item.length() > 0) {
    takeItemsFromActor(first_speaker, second_speaker, actor_has_item.get(math.random(1, actor_has_item.length())));
  }
}

/**
 * todo;
 */
export function give_compass_to_actor(first_speaker: XR_game_object, second_speaker: XR_game_object): void {
  giveItemsToActor(first_speaker, second_speaker, artefacts.af_compass);
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
export function zat_b51_randomize_item(first_speaker: XR_game_object, second_speaker: XR_game_object): void {
  for (const i of $range(1, 7)) {
    if (hasAlifeInfo("zat_b51_processing_category_" + tostring(i))) {
      const zat_b51_available_items_table: LuaArray<number> = new LuaTable();

      for (const j of $range(1, item_count_by_category.get(i))) {
        if (!hasAlifeInfo("zat_b51_done_item_" + tostring(i) + "_" + tostring(j))) {
          table.insert(zat_b51_available_items_table, j);
        }
      }

      giveInfo(
        "zat_b51_ordered_item_" +
          tostring(i) +
          "_" +
          tostring(zat_b51_available_items_table.get(math.random(1, zat_b51_available_items_table.length())))
      );
    }
  }
}

/**
 * todo;
 */
export function zat_b51_give_prepay(first_speaker: XR_game_object, second_speaker: XR_game_object): void {
  for (const i of $range(1, 7)) {
    if (hasAlifeInfo("zat_b51_processing_category_" + tostring(i))) {
      if (!hasAlifeInfo(info_portions.zat_b51_order_refused)) {
        return takeMoneyFromActor(first_speaker, second_speaker, zat_b51_costs_table.get(i).prepay_agreed);
      }

      return takeMoneyFromActor(first_speaker, second_speaker, zat_b51_costs_table.get(i).prepay_refused);
    }
  }
}

/**
 * todo;
 */
export function zat_b51_has_prepay(first_speaker: XR_game_object, second_speaker: XR_game_object): boolean {
  const actor: XR_game_object = getActor() as XR_game_object;

  for (const i of $range(1, 7)) {
    if (hasAlifeInfo("zat_b51_processing_category_" + tostring(i))) {
      if (!hasAlifeInfo(info_portions.zat_b51_order_refused)) {
        return actor.money() >= zat_b51_costs_table.get(i).prepay_agreed;
      }

      return actor.money() >= zat_b51_costs_table.get(i).prepay_refused;
    }
  }

  return false;
}

/**
 * todo;
 */
export function zat_b51_hasnt_prepay(first_speaker: XR_game_object, second_speaker: XR_game_object): boolean {
  return !zat_b51_has_prepay(first_speaker, second_speaker);
}

/**
 * todo;
 */
export function zat_b51_buy_item(first_speaker: XR_game_object, second_speaker: XR_game_object): void {
  for (const i of $range(1, 7)) {
    if (hasAlifeInfo("zat_b51_processing_category_" + tostring(i))) {
      for (const j of $range(1, zat_b51_buy_item_table.get(i).length())) {
        if (hasAlifeInfo("zat_b51_ordered_item_" + tostring(i) + "_" + tostring(j))) {
          for (const [k, v] of zat_b51_buy_item_table.get(i).get(j).item) {
            giveItemsToActor(first_speaker, second_speaker, v);
          }

          takeMoneyFromActor(first_speaker, second_speaker, zat_b51_costs_table.get(i).cost);
          disableInfo("zat_b51_processing_category_" + tostring(i));
          disableInfo("zat_b51_ordered_item_" + tostring(i) + "_" + tostring(j));
          giveInfo("zat_b51_done_item_" + tostring(i) + "_" + tostring(j));
          break;
        }
      }

      let category_finishing: boolean = true;

      for (const j of $range(1, zat_b51_buy_item_table.get(i).length())) {
        if (!hasAlifeInfo("zat_b51_done_item_" + tostring(i) + "_" + tostring(j))) {
          category_finishing = false;
          break;
        }
      }

      if (category_finishing) {
        giveInfo("zat_b51_finishing_category_" + tostring(i));
      }

      return;
    }
  }
}

/**
 * todo;
 */
export function zat_b51_refuse_item(first_speaker: XR_game_object, second_speaker: XR_game_object): void {
  for (const i of $range(1, 7)) {
    if (hasAlifeInfo("zat_b51_processing_category_" + tostring(i))) {
      for (const j of $range(1, zat_b51_buy_item_table.get(i).length())) {
        if (hasAlifeInfo("zat_b51_ordered_item_" + tostring(i) + "_" + tostring(j))) {
          disableInfo("zat_b51_processing_category_" + tostring(i));
          disableInfo("zat_b51_ordered_item_" + tostring(i) + "_" + tostring(j));
          giveInfo("zat_b51_done_item_" + tostring(i) + "_" + tostring(j));
          break;
        }
      }

      let category_finishing = true;

      for (const j of $range(1, zat_b51_buy_item_table.get(i).length())) {
        if (!hasAlifeInfo("zat_b51_done_item_" + tostring(i) + "_" + tostring(j))) {
          category_finishing = false;
          break;
        }
      }

      if (category_finishing === true) {
        giveInfo("zat_b51_finishing_category_" + tostring(i));
      }

      return;
    }
  }
}

/**
 * todo;
 */
export function zat_b51_has_item_cost(first_speaker: XR_game_object, second_speaker: XR_game_object): boolean {
  const actor: XR_game_object = getActor() as XR_game_object;

  for (const i of $range(1, 7)) {
    if (hasAlifeInfo("zat_b51_processing_category_" + tostring(i))) {
      return actor.money() >= zat_b51_costs_table.get(i).cost;
    }
  }

  return false;
}

/**
 * todo;
 */
export function zat_b51_hasnt_item_cost(first_speaker: XR_game_object, second_speaker: XR_game_object): boolean {
  return !zat_b51_has_item_cost(first_speaker, second_speaker);
}

/**
 * todo;
 */
export function zat_b12_actor_have_documents(first_speaker: XR_game_object, second_speaker: XR_game_object): boolean {
  return actorHasAtLeastOneItem([quest_items.zat_b12_documents_1, quest_items.zat_b12_documents_2]);
}

/**
 * todo;
 */
export function zat_b12_actor_transfer_documents(
  first_speaker: XR_game_object,
  second_speaker: XR_game_object
): boolean {
  const npc: XR_game_object = getNpcSpeaker(first_speaker, second_speaker);
  const actor: XR_game_object = getActor() as XR_game_object;

  const amount_doc1: number = 1000;
  const amount_doc2: number = 600;
  const amount_doc3: number = 400;

  let amount_total: number = 0;
  let cnt: number = 0;
  let cnt2: number = 0;

  if (actor.object(quest_items.zat_b12_documents_1) !== null) {
    takeItemsFromActor(first_speaker, second_speaker, quest_items.zat_b12_documents_1);
    giveInfo(info_portions.zat_b12_documents_sold_1);
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
        giveInfo(info_portions.zat_b12_documents_sold_2);
      }
    } else {
      amount_total = amount_total + amount_doc3 * cnt2;
      giveInfo(info_portions.zat_b12_documents_sold_3);
    }

    takeItemsFromActor(first_speaker, second_speaker, quest_items.zat_b12_documents_2, cnt2);
  }

  giveMoneyToActor(amount_total);

  return false;
}

/**
 * todo;
 */
export function zat_b3_actor_got_toolkit(first_speaker: XR_game_object, second_speaker: XR_game_object): boolean {
  const actor: XR_game_object = getActor() as XR_game_object;

  actor.iterate_inventory((npc: XR_game_object, item: XR_game_object) => {
    const section = item.section();

    if (
      (section === misc.toolkit_1 && !hasAlifeInfo(info_portions.zat_b3_tech_instrument_1_brought)) ||
      (section === misc.toolkit_2 && !hasAlifeInfo(info_portions.zat_b3_tech_instrument_2_brought)) ||
      (section === misc.toolkit_3 && !hasAlifeInfo(info_portions.zat_b3_tech_instrument_3_brought))
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
export function give_toolkit_3(first_speaker: XR_game_object, second_speaker: XR_game_object): void {
  takeItemsFromActor(first_speaker, second_speaker, misc.toolkit_3);
  (getActor() as AnyObject).toolkit = null;
  giveMoneyToActor(1500);
}

/**
 * todo;
 */
export function give_toolkit_1(first_speaker: XR_game_object, second_speaker: XR_game_object): void {
  takeItemsFromActor(first_speaker, second_speaker, misc.toolkit_1);
  (getActor() as AnyObject).toolkit = null;
  giveMoneyToActor(1000);
}

/**
 * todo;
 */
export function if_actor_has_toolkit_1(first_speaker: XR_game_object, second_speaker: XR_game_object): boolean {
  return getActor()!.object(misc.toolkit_1) !== null;
}

/**
 * todo;
 */
export function give_toolkit_2(first_speaker: XR_game_object, second_speaker: XR_game_object): void {
  takeItemsFromActor(first_speaker, second_speaker, misc.toolkit_2);
  (getActor() as AnyObject).toolkit = null;
  giveMoneyToActor(1200);
}

/**
 * todo;
 */
export function if_actor_has_toolkit_2(first_speaker: XR_game_object, second_speaker: XR_game_object): boolean {
  return getActor()!.object(misc.toolkit_2) !== null;
}

/**
 * todo;
 */
export function zat_b215_counter_greater_3(first_speaker: XR_game_object, second_speaker: XR_game_object): boolean {
  const npc: XR_game_object = getNpcSpeaker(first_speaker, second_speaker);
  const actor: XR_game_object = getActorSpeaker(first_speaker, second_speaker);

  return counter_greater(actor, npc, ["zat_a9_way_to_pripyat_counter", 3]);
}

/**
 * todo;
 */
export function zat_b215_counter_less_4(first_speaker: XR_game_object, second_speaker: XR_game_object): boolean {
  const npc: XR_game_object = getNpcSpeaker(first_speaker, second_speaker);
  const actor: XR_game_object = getActorSpeaker(first_speaker, second_speaker);

  return !get_global<AnyCallablesModule>("xr_conditions").counter_greater(actor, npc, ["jup_a9_way_gates_counter", 4]);
}

/**
 * todo;
 */
export function zat_b40_transfer_notebook(first_speaker: XR_game_object, second_speaker: XR_game_object): void {
  takeItemsFromActor(first_speaker, second_speaker, quest_items.zat_b40_notebook);
  giveInfo(info_portions.zat_b40_notebook_saled);
  giveMoneyToActor(2000);
}

/**
 * todo;
 */
export function zat_b40_transfer_merc_pda_1(first_speaker: XR_game_object, second_speaker: XR_game_object): void {
  takeItemsFromActor(first_speaker, second_speaker, quest_items.zat_b40_pda_1);
  giveInfo(info_portions.zat_b40_pda_1_saled);
  giveMoneyToActor(1000);

  if (
    hasAlifeInfo(info_portions.zat_b40_notebook_saled) &&
    hasAlifeInfo(info_portions.zat_b40_pda_1_saled) &&
    hasAlifeInfo(info_portions.zat_b40_pda_2_saled)
  ) {
    giveInfo(info_portions.zat_b40_all_item_saled);
  }
}

/**
 * todo;
 */
export function zat_b40_transfer_merc_pda_2(first_speaker: XR_game_object, second_speaker: XR_game_object): void {
  takeItemsFromActor(first_speaker, second_speaker, quest_items.zat_b40_pda_2);
  giveInfo(info_portions.zat_b40_pda_2_saled);
  giveMoneyToActor(1_000);

  if (
    hasAlifeInfo(info_portions.zat_b40_notebook_saled) &&
    hasAlifeInfo(info_portions.zat_b40_pda_1_saled) &&
    hasAlifeInfo(info_portions.zat_b40_pda_2_saled)
  ) {
    giveInfo(info_portions.zat_b40_all_item_saled);
  }
}

/**
 * todo;
 */
export function zat_b29_actor_do_not_has_adv_task_af_1(
  first_speaker: XR_game_object,
  second_speaker: XR_game_object
): boolean {
  return hasAlifeInfo(zat_b29_infop_table.get(16)) && !getActor()!.object(zat_b29_af_table.get(16));
}

/**
 * todo;
 */
export function zat_b29_actor_do_not_has_adv_task_af_2(
  first_speaker: XR_game_object,
  second_speaker: XR_game_object
): boolean {
  return hasAlifeInfo(zat_b29_infop_table.get(17)) && !getActor()!.object(zat_b29_af_table.get(17));
}

/**
 * todo;
 */
export function zat_b29_actor_do_not_has_adv_task_af_3(
  first_speaker: XR_game_object,
  second_speaker: XR_game_object
): boolean {
  return hasAlifeInfo(zat_b29_infop_table.get(18)) && !getActor()!.object(zat_b29_af_table.get(18));
}

/**
 * todo;
 */
export function zat_b29_actor_do_not_has_adv_task_af_4(
  first_speaker: XR_game_object,
  second_speaker: XR_game_object
): boolean {
  return hasAlifeInfo(zat_b29_infop_table.get(19)) && !getActor()!.object(zat_b29_af_table.get(19));
}

/**
 * todo;
 */
export function zat_b29_actor_do_not_has_adv_task_af_5(
  first_speaker: XR_game_object,
  second_speaker: XR_game_object
): boolean {
  return hasAlifeInfo(zat_b29_infop_table.get(20)) && !getActor()!.object(zat_b29_af_table.get(20));
}

/**
 * todo;
 */
export function zat_b29_actor_do_not_has_adv_task_af_6(
  first_speaker: XR_game_object,
  second_speaker: XR_game_object
): boolean {
  return hasAlifeInfo(zat_b29_infop_table.get(21)) && !getActor()!.object(zat_b29_af_table.get(21));
}

/**
 * todo;
 */
export function zat_b29_actor_do_not_has_adv_task_af_7(
  first_speaker: XR_game_object,
  second_speaker: XR_game_object
): boolean {
  return hasAlifeInfo(zat_b29_infop_table.get(22)) && !getActor()!.object(zat_b29_af_table.get(22));
}

/**
 * todo;
 */
export function zat_b29_actor_do_not_has_adv_task_af_8(
  first_speaker: XR_game_object,
  second_speaker: XR_game_object
): boolean {
  return hasAlifeInfo(zat_b29_infop_table.get(23)) && !getActor()!.object(zat_b29_af_table.get(23));
}

/**
 * todo;
 */
export function zat_b29_actor_has_adv_task_af_1(
  first_speaker: XR_game_object,
  second_speaker: XR_game_object
): boolean {
  return hasAlifeInfo(zat_b29_infop_table.get(16)) && getActor()!.object(zat_b29_af_table.get(16)) !== null;
}

/**
 * todo;
 */
export function zat_b29_actor_has_adv_task_af_2(
  first_speaker: XR_game_object,
  second_speaker: XR_game_object
): boolean {
  return hasAlifeInfo(zat_b29_infop_table.get(17)) && getActor()!.object(zat_b29_af_table.get(17)) !== null;
}

/**
 * todo;
 */
export function zat_b29_actor_has_adv_task_af_3(
  first_speaker: XR_game_object,
  second_speaker: XR_game_object
): boolean {
  return hasAlifeInfo(zat_b29_infop_table.get(18)) && getActor()!.object(zat_b29_af_table.get(18)) !== null;
}

/**
 * todo;
 */
export function zat_b29_actor_has_adv_task_af_4(
  first_speaker: XR_game_object,
  second_speaker: XR_game_object
): boolean {
  return hasAlifeInfo(zat_b29_infop_table.get(19)) && getActor()!.object(zat_b29_af_table.get(19)) !== null;
}

/**
 * todo;
 */
export function zat_b29_actor_has_adv_task_af_5(
  first_speaker: XR_game_object,
  second_speaker: XR_game_object
): boolean {
  return hasAlifeInfo(zat_b29_infop_table.get(20)) && getActor()!.object(zat_b29_af_table.get(20)) !== null;
}

/**
 * todo;
 */
export function zat_b29_actor_has_adv_task_af_6(
  first_speaker: XR_game_object,
  second_speaker: XR_game_object
): boolean {
  return hasAlifeInfo(zat_b29_infop_table.get(21)) && getActor()!.object(zat_b29_af_table.get(21)) !== null;
}

/**
 * todo;
 */
export function zat_b29_actor_has_adv_task_af_7(
  first_speaker: XR_game_object,
  second_speaker: XR_game_object
): boolean {
  return hasAlifeInfo(zat_b29_infop_table.get(22)) && getActor()!.object(zat_b29_af_table.get(22)) !== null;
}

/**
 * todo;
 */
export function zat_b29_actor_has_adv_task_af_8(
  first_speaker: XR_game_object,
  second_speaker: XR_game_object
): boolean {
  return hasAlifeInfo(zat_b29_infop_table.get(23)) && getActor()!.object(zat_b29_af_table.get(23)) !== null;
}

/**
 * todo;
 */
export function zat_b30_transfer_detector_to_actor(
  first_speaker: XR_game_object,
  second_speaker: XR_game_object
): void {
  giveItemsToActor(first_speaker, second_speaker, detectors.detector_scientific);
}

/**
 * todo;
 */
export function zat_b30_give_owls_share_to_actor(first_speaker: XR_game_object, second_speaker: XR_game_object): void {
  giveMoneyToActor(1_500);
}

/**
 * todo;
 */
export function zat_b30_actor_has_compass(first_speaker: XR_game_object, second_speaker: XR_game_object): boolean {
  return getActor()!.object(artefacts.af_compass) !== null;
}

/**
 * todo;
 */
export function zat_b30_transfer_af_from_actor(first_speaker: XR_game_object, second_speaker: XR_game_object): void {
  takeItemsFromActor(first_speaker, second_speaker, artefacts.af_compass);
  giveMoneyToActor(10_000);
  getTreasureManager().give_treasure("zat_hiding_place_49");
  getTreasureManager().give_treasure("zat_hiding_place_15");
}

/**
 * todo;
 */
export function zat_b30_barmen_has_percent(first_speaker: XR_game_object, second_speaker: XR_game_object): boolean {
  const actor = getActorSpeaker(first_speaker, second_speaker);
  const cnt = pstor_retrieve(actor, "zat_b30_days_cnt", 0);

  return cnt > 0;
}

/**
 * todo;
 */
export function zat_b30_barmen_do_not_has_percent(
  first_speaker: XR_game_object,
  second_speaker: XR_game_object
): boolean {
  const actor = getActorSpeaker(first_speaker, second_speaker);
  const cnt = pstor_retrieve(actor, "zat_b30_days_cnt", 0);

  return cnt < 1;
}

/**
 * todo;
 */
export function zat_b30_actor_has_noah_pda(first_speaker: XR_game_object, second_speaker: XR_game_object): boolean {
  return getActor()!.object(quest_items.zat_b20_noah_pda) !== null;
}

/**
 * todo;
 */
export function zat_b30_sell_noah_pda(first_speaker: XR_game_object, second_speaker: XR_game_object): void {
  takeItemsFromActor(first_speaker, second_speaker, quest_items.zat_b20_noah_pda);
  giveMoneyToActor(1000);
}

/**
 * todo;
 */
export function zat_b40_actor_has_notebook(first_speaker: XR_game_object, second_speaker: XR_game_object): boolean {
  return getActor()!.object(quest_items.zat_b40_notebook) !== null;
}

/**
 * todo;
 */
export function zat_b40_actor_has_merc_pda_1(first_speaker: XR_game_object, second_speaker: XR_game_object): boolean {
  return getActor()!.object(quest_items.zat_b40_pda_1) !== null;
}

/**
 * todo;
 */
export function zat_b40_actor_has_merc_pda_2(first_speaker: XR_game_object, second_speaker: XR_game_object): boolean {
  return getActor()!.object(quest_items.zat_b40_pda_2) !== null;
}

/**
 * todo;
 */
export function if_actor_has_toolkit_3(first_speaker: XR_game_object, second_speaker: XR_game_object): boolean {
  return getActor()!.object(misc.toolkit_3) !== null;
}

/**
 * todo;
 */
export function give_vodka(first_speaker: XR_game_object, second_speaker: XR_game_object): void {
  takeItemsFromActor(first_speaker, second_speaker, food.vodka);
}

/**
 * todo;
 */
export function if_actor_has_vodka(first_speaker: XR_game_object, second_speaker: XR_game_object): boolean {
  return getActor()!.object(food.vodka) !== null;
}

/**
 * todo;
 */
export function actor_has_more_then_need_money_to_buy_battery(
  first_speaker: XR_game_object,
  second_speaker: XR_game_object
): boolean {
  return getActor()!.money() >= 2000;
}

/**
 * todo;
 */
export function actor_has_less_then_need_money_to_buy_battery(
  first_speaker: XR_game_object,
  second_speaker: XR_game_object
): boolean {
  return getActor()!.money() < 2000;
}

/**
 * todo;
 */
export function relocate_need_money_to_buy_battery(
  first_speaker: XR_game_object,
  second_speaker: XR_game_object
): void {
  takeMoneyFromActor(first_speaker, second_speaker, 2000);
}

/**
 * todo;
 */
export function give_actor_battery(first_speaker: XR_game_object, second_speaker: XR_game_object): void {
  giveItemsToActor(first_speaker, second_speaker, ammo.ammo_gauss_cardan);
}

/**
 * todo;
 */
export function give_actor_zat_a23_access_card(first_speaker: XR_game_object, second_speaker: XR_game_object): void {
  giveItemsToActor(first_speaker, second_speaker, quest_items.zat_a23_access_card);
}

/**
 * todo;
 */
export function give_zat_a23_gauss_rifle_docs(first_speaker: XR_game_object, second_speaker: XR_game_object): void {
  takeItemsFromActor(first_speaker, second_speaker, quest_items.zat_a23_gauss_rifle_docs);
}

/**
 * todo;
 */
export function return_zat_a23_gauss_rifle_docs(first_speaker: XR_game_object, second_speaker: XR_game_object): void {
  giveItemsToActor(first_speaker, second_speaker, quest_items.zat_a23_gauss_rifle_docs);
}

/**
 * todo;
 */
export function if_actor_has_zat_a23_gauss_rifle_docs(
  first_speaker: XR_game_object,
  second_speaker: XR_game_object
): boolean {
  return first_speaker.object(quest_items.zat_a23_gauss_rifle_docs) !== null;
}

/**
 * todo;
 */
export function if_actor_has_gauss_rifle(first_speaker: XR_game_object, second_speaker: XR_game_object): boolean {
  return first_speaker.object(quest_items.pri_a17_gauss_rifle) !== null;
}

/**
 * todo;
 */
export function give_tech_gauss_rifle(first_speaker: XR_game_object, second_speaker: XR_game_object): void {
  takeItemsFromActor(first_speaker, second_speaker, quest_items.pri_a17_gauss_rifle);
}

/**
 * todo;
 */
export function give_actor_repaired_gauss_rifle(first_speaker: XR_game_object, second_speaker: XR_game_object): void {
  giveItemsToActor(first_speaker, second_speaker, weapons.wpn_gauss);
}

/**
 * todo;
 */
export function zat_b215_actor_has_money_poor(first_speaker: XR_game_object, second_speaker: XR_game_object): boolean {
  return getActor()!.money() >= 1000;
}

/**
 * todo;
 */
export function zat_b215_actor_has_no_money_poor(
  first_speaker: XR_game_object,
  second_speaker: XR_game_object
): boolean {
  return getActor()!.money() < 1000;
}

/**
 * todo;
 */
export function zat_b215_actor_has_money_poor_pripyat(
  first_speaker: XR_game_object,
  second_speaker: XR_game_object
): boolean {
  return getActor()!.money() >= 4000;
}

/**
 * todo;
 */
export function zat_b215_actor_has_no_money_poor_pripyat(
  first_speaker: XR_game_object,
  second_speaker: XR_game_object
): boolean {
  return getActor()!.money() < 4000;
}

/**
 * todo;
 */
export function zat_b215_actor_has_money_rich(first_speaker: XR_game_object, second_speaker: XR_game_object): boolean {
  return getActor()!.money() >= 3000;
}

/**
 * todo;
 */
export function zat_b215_actor_has_no_money_rich(
  first_speaker: XR_game_object,
  second_speaker: XR_game_object
): boolean {
  return getActor()!.money() < 3000;
}

/**
 * todo;
 */
export function zat_b215_actor_has_money_rich_pripyat(
  first_speaker: XR_game_object,
  second_speaker: XR_game_object
): boolean {
  return getActor()!.money() >= 6000;
}

/**
 * todo;
 */
export function zat_b215_actor_has_no_money_rich_pripyat(
  first_speaker: XR_game_object,
  second_speaker: XR_game_object
): boolean {
  return getActor()!.money() < 6000;
}

/**
 * todo;
 */
export function zat_b215_relocate_money_poor(first_speaker: XR_game_object, second_speaker: XR_game_object): void {
  takeMoneyFromActor(first_speaker, second_speaker, 1000);
}

/**
 * todo;
 */
export function zat_b215_relocate_money_poor_pripyat(
  first_speaker: XR_game_object,
  second_speaker: XR_game_object
): void {
  takeMoneyFromActor(first_speaker, second_speaker, 4000);
}

/**
 * todo;
 */
export function zat_b215_relocate_money_rich(first_speaker: XR_game_object, second_speaker: XR_game_object): void {
  takeMoneyFromActor(first_speaker, second_speaker, 3000);
}

/**
 * todo;
 */
export function zat_b215_relocate_money_rich_pripyat(
  first_speaker: XR_game_object,
  second_speaker: XR_game_object
): void {
  takeMoneyFromActor(first_speaker, second_speaker, 6000);
}

/**
 * todo;
 */
export function zat_b44_actor_has_pda_global(first_speaker: XR_game_object, second_speaker: XR_game_object): boolean {
  return (
    getActor()!.object(quest_items.zat_b39_joker_pda) !== null ||
    getActor()!.object(quest_items.zat_b44_barge_pda) !== null
  );
}

/**
 * todo;
 */
export function zat_b44_actor_has_not_pda_global(
  first_speaker: XR_game_object,
  second_speaker: XR_game_object
): boolean {
  return (
    getActor()!.object(quest_items.zat_b39_joker_pda) === null ||
    getActor()!.object(quest_items.zat_b44_barge_pda) === null
  );
}

/**
 * todo;
 */
export function zat_b44_actor_has_pda_barge(first_speaker: XR_game_object, second_speaker: XR_game_object): boolean {
  return getActor()!.object(quest_items.zat_b44_barge_pda) !== null;
}

/**
 * todo;
 */
export function zat_b44_actor_has_pda_joker(first_speaker: XR_game_object, second_speaker: XR_game_object): boolean {
  return getActor()!.object(quest_items.zat_b39_joker_pda) !== null;
}

/**
 * todo;
 */
export function zat_b44_actor_has_pda_both(first_speaker: XR_game_object, second_speaker: XR_game_object): boolean {
  return (
    getActor()!.object(quest_items.zat_b39_joker_pda) !== null &&
    getActor()!.object(quest_items.zat_b44_barge_pda) !== null
  );
}

/**
 * todo;
 */
export function zat_b44_transfer_pda_barge(first_speaker: XR_game_object, second_speaker: XR_game_object): void {
  takeItemsFromActor(first_speaker, second_speaker, quest_items.zat_b44_barge_pda);
}

/**
 * todo;
 */
export function zat_b44_transfer_pda_joker(first_speaker: XR_game_object, second_speaker: XR_game_object): void {
  takeItemsFromActor(first_speaker, second_speaker, quest_items.zat_b39_joker_pda);
}

/**
 * todo;
 */
export function zat_b44_transfer_pda_both(first_speaker: XR_game_object, second_speaker: XR_game_object): void {
  takeItemsFromActor(first_speaker, second_speaker, quest_items.zat_b44_barge_pda);
  takeItemsFromActor(first_speaker, second_speaker, quest_items.zat_b39_joker_pda);
}

/**
 * todo;
 */
export function zat_b44_frends_dialog_enabled(first_speaker: XR_game_object, second_speaker: XR_game_object): boolean {
  const a =
    hasAlifeInfo(info_portions.zat_b3_tech_have_couple_dose) && hasAlifeInfo(info_portions.zat_b3_tech_discount_1);
  const b = zat_b44_actor_has_pda_global(first_speaker, second_speaker);

  return a || b;
}

/**
 * todo;
 */
export function zat_b53_if_actor_has_detector_advanced(
  first_speaker: XR_game_object,
  second_speaker: XR_game_object
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
export function zat_b53_transfer_medkit_to_npc(first_speaker: XR_game_object, second_speaker: XR_game_object): void {
  let section: Optional<TDrugItem> = null;
  const actor: XR_game_object = getActor() as XR_game_object;

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
  relocate_item(actor, "out", section, 1);
  actor.change_character_reputation(10);
}

/**
 * todo;
 */
export function is_zat_b106_hunting_time(first_speaker: XR_game_object, second_speaker: XR_game_object): boolean {
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
export function is_not_zat_b106_hunting_time(first_speaker: XR_game_object, second_speaker: XR_game_object): boolean {
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
  first_speaker: XR_game_object,
  second_speaker: XR_game_object
): boolean {
  return !zat_b53_if_actor_has_detector_advanced(first_speaker, second_speaker);
}

/**
 * todo;
 */
export function zat_b53_transfer_detector_advanced_to_actor(
  first_speaker: XR_game_object,
  second_speaker: XR_game_object
): void {
  giveItemsToActor(second_speaker, first_speaker, detectors.detector_advanced);
}

/**
 * todo;
 */
export function zat_b53_transfer_fireball_to_actor(
  first_speaker: XR_game_object,
  second_speaker: XR_game_object
): void {
  giveItemsToActor(second_speaker, first_speaker, artefacts.af_fireball);
}

/**
 * todo;
 */
export function zat_b53_transfer_medkit_to_actor(first_speaker: XR_game_object, second_speaker: XR_game_object): void {
  giveItemsToActor(second_speaker, first_speaker, drugs.medkit);
}

/**
 * todo;
 */
export function zat_b106_soroka_reward(first_speaker: XR_game_object, second_speaker: XR_game_object): void {
  if (
    hasAlifeInfo(info_portions.jup_b25_flint_blame_done_to_duty) ||
    hasAlifeInfo(info_portions.jup_b25_flint_blame_done_to_freedom)
  ) {
    giveMoneyToActor(1000);
  } else {
    giveMoneyToActor(3000);
  }
}

/**
 * todo;
 */
export function zat_b103_actor_has_needed_food(first_speaker: XR_game_object, second_speaker: XR_game_object): boolean {
  const item_sections = [food.bread, food.kolbasa, food.conserva] as unknown as LuaArray<TFoodItem>;

  let count = 0;

  const actor: XR_game_object = getActor() as XR_game_object;

  for (const [k, item_section] of item_sections) {
    getActor()!.iterate_inventory((temp, item) => {
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
export function zat_b106_transfer_weap_to_actor(first_speaker: XR_game_object, second_speaker: XR_game_object): void {
  giveItemsToActor(first_speaker, second_speaker, weapons.wpn_spas12);
}

/**
 * todo;
 */
export function zat_b106_give_reward(first_speaker: XR_game_object, second_speaker: XR_game_object): void {
  getTreasureManager().give_treasure("zat_hiding_place_50");
}

/**
 * todo;
 */
export function zat_b3_tech_drinks_precond(first_speaker: XR_game_object, second_speaker: XR_game_object): boolean {
  if (hasAlifeInfo(info_portions.zat_b3_gauss_repaired) && !hasAlifeInfo(info_portions.zat_b3_tech_drink_no_more)) {
    return true;
  } else if (!hasAlifeInfo(info_portions.zat_b3_tech_see_produce_62)) {
    return true;
  }

  return false;
}

/**
 * todo;
 */
export function zat_b106_soroka_gone(first_speaker: XR_game_object, second_speaker: XR_game_object): boolean {
  return (
    hasAlifeInfo(info_portions.jup_b25_flint_blame_done_to_duty) ||
    hasAlifeInfo(info_portions.jup_b25_flint_blame_done_to_freedom)
  );
}

/**
 * todo;
 */
export function zat_b106_soroka_not_gone(first_speaker: XR_game_object, second_speaker: XR_game_object): boolean {
  return !zat_b106_soroka_gone(first_speaker, second_speaker);
}

/**
 * todo;
 */
export function zat_b22_actor_has_proof(first_speaker: XR_game_object, second_speaker: XR_game_object): boolean {
  return actorHasItem(info_portions.zat_b22_medic_pda);
}

/**
 * todo;
 */
export function zat_b22_transfer_proof(first_speaker: XR_game_object, second_speaker: XR_game_object): void {
  takeItemsFromActor(first_speaker, second_speaker, info_portions.zat_b22_medic_pda);
}

/**
 * todo;
 */
export function zat_b5_stalker_transfer_money(first_speaker: XR_game_object, second_speaker: XR_game_object): void {
  giveMoneyToActor(2500);
  getTreasureManager().give_treasure("zat_hiding_place_7");
}

/**
 * todo;
 */
export function zat_b5_dealer_full_revard(first_speaker: XR_game_object, second_speaker: XR_game_object): void {
  giveMoneyToActor(6000);
}

/**
 * todo;
 */
export function zat_b5_dealer_easy_revard(first_speaker: XR_game_object, second_speaker: XR_game_object): void {
  giveMoneyToActor(3000);
}

/**
 * todo;
 */
export function zat_b5_bandits_revard(first_speaker: XR_game_object, second_speaker: XR_game_object): void {
  giveMoneyToActor(5000);
  getTreasureManager().give_treasure("zat_hiding_place_20");
}

/**
 * todo;
 */
export function zat_a23_actor_has_access_card(first_speaker: XR_game_object, second_speaker: XR_game_object): boolean {
  return getActor()!.object(quest_items.zat_a23_access_card) !== null;
}

/**
 * todo;
 */
export function zat_a23_transfer_access_card_to_tech(
  first_speaker: XR_game_object,
  second_speaker: XR_game_object
): void {
  takeItemsFromActor(first_speaker, second_speaker, quest_items.zat_a23_access_card);
  giveItemsToActor(second_speaker, first_speaker, "medkit_scientic", 3);
}

/**
 * todo;
 */
// --// --- b57 new // --// --
export function zat_b57_stalker_reward_to_actor_detector(
  first_speaker: XR_game_object,
  second_speaker: XR_game_object
): void {
  giveItemsToActor(first_speaker, second_speaker, detectors.detector_elite);
  getTreasureManager().give_treasure("zat_hiding_place_54");
}

/**
 * todo;
 */
export function actor_has_gas(first_speaker: XR_game_object, second_speaker: XR_game_object): boolean {
  return getActor()!.object(quest_items.zat_b57_gas) !== null;
}

/**
 * todo;
 */
export function actor_has_not_gas(first_speaker: XR_game_object, second_speaker: XR_game_object): boolean {
  return !actor_has_gas(first_speaker, second_speaker);
}

/**
 * todo;
 */
export function zat_b57_actor_has_money(first_speaker: XR_game_object, second_speaker: XR_game_object): boolean {
  return getActor()!.money() >= 2000;
}

/**
 * todo;
 */
export function zat_b57_actor_hasnt_money(first_speaker: XR_game_object, second_speaker: XR_game_object): boolean {
  return !zat_b57_actor_has_money(first_speaker, second_speaker);
}

/**
 * todo;
 */
export function zat_b57_transfer_gas_money(first_speaker: XR_game_object, second_speaker: XR_game_object): void {
  takeMoneyFromActor(first_speaker, second_speaker, 2000);
}
