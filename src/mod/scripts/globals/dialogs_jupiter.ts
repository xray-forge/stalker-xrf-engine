/* eslint @typescript-eslint/explicit-function-return-type: "error" */

import { alife, game_object, XR_cse_alife_creature_abstract, XR_game_object } from "xray16";

import { info_portions, TInfoPortion } from "@/mod/globals/info_portions";
import { ammo } from "@/mod/globals/items/ammo";
import { artefacts, TArtefact } from "@/mod/globals/items/artefacts";
import { detectors } from "@/mod/globals/items/detectors";
import { drugs } from "@/mod/globals/items/drugs";
import { helmets, THelmet } from "@/mod/globals/items/helmets";
import { outfits, TOutfit } from "@/mod/globals/items/outfits";
import { weapons } from "@/mod/globals/items/weapons";
import { AnyCallablesModule, AnyObject, LuaArray, Optional } from "@/mod/lib/types";
import { anomalyByName, getActor, IStoredObject } from "@/mod/scripts/core/db";
import { get_npcs_relation } from "@/mod/scripts/core/game_relations";
import { getTreasureManager, ITreasureManager } from "@/mod/scripts/core/TreasureManager";
import { disableInfo, giveInfo, hasAlifeInfo } from "@/mod/scripts/utils/actor";
import { LuaLogger } from "@/mod/scripts/utils/logging";
import {
  getActorSpeaker,
  getNpcSpeaker,
  giveItemsToActor,
  giveMoneyToActor,
  relocateQuestItemSection,
  takeItemsFromActor,
  takeMoneyFromActor,
} from "@/mod/scripts/utils/quests";

const logger: LuaLogger = new LuaLogger("dialogs_jupiter");

// -- b208
export function jup_b208_give_reward(first_speaker: XR_game_object, second_speaker: XR_game_object): void {
  giveMoneyToActor(5000);

  const treasureManager: ITreasureManager = getTreasureManager();

  treasureManager.give_treasure("jup_hiding_place_18");
  treasureManager.give_treasure("jup_hiding_place_35");
  treasureManager.give_treasure("jup_hiding_place_45");
}

// -- a9
export function jupiter_a9_actor_hasnt_all_mail_items(
  first_speaker: XR_game_object,
  second_speaker: XR_game_object
): boolean {
  return !jupiter_a9_actor_has_all_mail_items(first_speaker, second_speaker);
}

export function jupiter_a9_actor_has_all_mail_items(
  first_speaker: XR_game_object,
  second_speaker: XR_game_object
): boolean {
  const actor: XR_game_object = getActor() as XR_game_object;

  return (
    actor.object("jup_a9_conservation_info") !== null &&
    actor.object("jup_a9_power_info") !== null &&
    actor.object("jup_a9_way_info") !== null
  );
}

export function jupiter_a9_actor_has_any_items(first_speaker: XR_game_object, second_speaker: XR_game_object): boolean {
  const actor: XR_game_object = getActor() as XR_game_object;

  return (
    actor.object("jup_a9_delivery_info") !== null ||
    actor.object("jup_a9_evacuation_info") !== null ||
    actor.object("jup_a9_losses_info") !== null ||
    actor.object("jup_a9_power_info") !== null ||
    actor.object("jup_a9_conservation_info") !== null ||
    actor.object("jup_a9_way_info") !== null ||
    actor.object("jup_a9_meeting_info") !== null
  );
}

export function jupiter_a9_actor_has_any_mail_items(
  first_speaker: XR_game_object,
  second_speaker: XR_game_object
): boolean {
  const actor: XR_game_object = getActor() as XR_game_object;

  return (
    actor.object("jup_a9_conservation_info") !== null ||
    actor.object("jup_a9_power_info") !== null ||
    actor.object("jup_a9_way_info") !== null
  );
}

export function jupiter_a9_actor_has_any_secondary_items(
  first_speaker: XR_game_object,
  second_speaker: XR_game_object
): boolean {
  const actor: XR_game_object = getActor() as XR_game_object;

  return (
    actor.object("jup_a9_delivery_info") !== null ||
    actor.object("jup_a9_evacuation_info") !== null ||
    actor.object("jup_a9_losses_info") !== null ||
    actor.object("jup_a9_meeting_info") !== null
  );
}

export function jupiter_a9_actor_hasnt_any_mail_items(
  first_speaker: XR_game_object,
  second_speaker: XR_game_object
): boolean {
  const actor: XR_game_object = getActor() as XR_game_object;

  return (
    actor.object("jup_a9_conservation_info") === null ||
    actor.object("jup_a9_power_info") === null ||
    actor.object("jup_a9_way_info") === null
  );
}

export function jupiter_a9_freedom_leader_jupiter_delivery(
  first_speaker: XR_game_object,
  second_speaker: XR_game_object
): void {
  giveMoneyToActor(500);
}

export function jupiter_a9_freedom_leader_jupiter_evacuation(
  first_speaker: XR_game_object,
  second_speaker: XR_game_object
): void {
  giveMoneyToActor(500);
}

export function jupiter_a9_freedom_leader_jupiter_losses(
  first_speaker: XR_game_object,
  second_speaker: XR_game_object
): void {
  giveMoneyToActor(500);
}

export function jupiter_a9_freedom_leader_jupiter_meeting(
  first_speaker: XR_game_object,
  second_speaker: XR_game_object
): void {
  giveMoneyToActor(500);
}

export function jupiter_a9_dolg_leader_jupiter_delivery(
  first_speaker: XR_game_object,
  second_speaker: XR_game_object
): void {
  giveMoneyToActor(500);
}

export function jupiter_a9_dolg_leader_jupiter_evacuation(
  first_speaker: XR_game_object,
  second_speaker: XR_game_object
): void {
  giveMoneyToActor(500);
}

export function jupiter_a9_dolg_leader_jupiter_losses(
  first_speaker: XR_game_object,
  second_speaker: XR_game_object
): void {
  giveMoneyToActor(500);
}

export function jupiter_a9_dolg_leader_jupiter_meeting(
  first_speaker: XR_game_object,
  second_speaker: XR_game_object
): void {
  giveMoneyToActor(500);
}

export function jup_a9_owl_stalker_trader_sell_jup_a9_evacuation_info(
  first_speaker: XR_game_object,
  second_speaker: XR_game_object
): void {
  takeItemsFromActor(first_speaker, second_speaker, "jup_a9_evacuation_info");
  giveMoneyToActor(750);
  giveInfo(info_portions.jup_a9_evacuation_info_sold);
}

export function jup_a9_owl_stalker_trader_sell_jup_a9_meeting_info(
  first_speaker: XR_game_object,
  second_speaker: XR_game_object
): void {
  takeItemsFromActor(first_speaker, second_speaker, "jup_a9_meeting_info");
  giveMoneyToActor(750);
  giveInfo(info_portions.jup_a9_meeting_info_sold);
}

export function jup_a9_owl_stalker_trader_sell_jup_a9_losses_info(
  first_speaker: XR_game_object,
  second_speaker: XR_game_object
): void {
  takeItemsFromActor(first_speaker, second_speaker, "jup_a9_losses_info");
  giveMoneyToActor(750);
  giveInfo("jup_a9_losses_info_sold");
}

export function jup_a9_owl_stalker_trader_sell_jup_a9_delivery_info(
  first_speaker: XR_game_object,
  second_speaker: XR_game_object
): void {
  takeItemsFromActor(first_speaker, second_speaker, "jup_a9_delivery_info");
  giveMoneyToActor(750);
  giveInfo("jup_a9_delivery_info_sold");
}

export function jupiter_a9_dolg_leader_jupiter_sell_all_secondary_items(
  first_speaker: XR_game_object,
  second_speaker: XR_game_object
): void {
  if (jup_a9_actor_has_evacuation_info(first_speaker, second_speaker)) {
    actor_relocate_evacuation_info(first_speaker, second_speaker);
    jupiter_a9_dolg_leader_jupiter_evacuation(first_speaker, second_speaker);
  }

  if (jup_a9_actor_has_meeting_info(first_speaker, second_speaker)) {
    actor_relocate_meeting_info(first_speaker, second_speaker);
    jupiter_a9_dolg_leader_jupiter_meeting(first_speaker, second_speaker);
  }

  if (jup_a9_actor_has_losses_info(first_speaker, second_speaker)) {
    actor_relocate_losses_info(first_speaker, second_speaker);
    jupiter_a9_dolg_leader_jupiter_losses(first_speaker, second_speaker);
  }

  if (jup_a9_actor_has_delivery_info(first_speaker, second_speaker)) {
    actor_relocate_delivery_info(first_speaker, second_speaker);
    jupiter_a9_dolg_leader_jupiter_delivery(first_speaker, second_speaker);
  }
}
export function jupiter_a9_freedom_leader_jupiter_sell_all_secondary_items(
  first_speaker: XR_game_object,
  second_speaker: XR_game_object
): void {
  if (jup_a9_actor_has_evacuation_info(first_speaker, second_speaker)) {
    actor_relocate_evacuation_info(first_speaker, second_speaker);
    jupiter_a9_freedom_leader_jupiter_evacuation(first_speaker, second_speaker);
  }

  if (jup_a9_actor_has_meeting_info(first_speaker, second_speaker)) {
    actor_relocate_meeting_info(first_speaker, second_speaker);
    jupiter_a9_freedom_leader_jupiter_meeting(first_speaker, second_speaker);
  }

  if (jup_a9_actor_has_losses_info(first_speaker, second_speaker)) {
    actor_relocate_losses_info(first_speaker, second_speaker);
    jupiter_a9_freedom_leader_jupiter_losses(first_speaker, second_speaker);
  }

  if (jup_a9_actor_has_delivery_info(first_speaker, second_speaker)) {
    actor_relocate_delivery_info(first_speaker, second_speaker);
    jupiter_a9_freedom_leader_jupiter_delivery(first_speaker, second_speaker);
  }
}

export function jup_a9_actor_has_conservation_info(
  first_speaker: XR_game_object,
  second_speaker: XR_game_object
): boolean {
  return getActor()!.object("jup_a9_conservation_info") !== null;
}

export function jup_a9_actor_hasnt_conservation_info(
  first_speaker: XR_game_object,
  second_speaker: XR_game_object
): boolean {
  return !jup_a9_actor_has_conservation_info(first_speaker, second_speaker);
}

export function actor_relocate_conservation_info(first_speaker: XR_game_object, second_speaker: XR_game_object): void {
  takeItemsFromActor(first_speaker, second_speaker, "jup_a9_conservation_info");
}

export function jup_a9_actor_has_power_info(first_speaker: XR_game_object, second_speaker: XR_game_object): boolean {
  return getActor()!.object("jup_a9_power_info") !== null;
}

export function jup_a9_actor_hasnt_power_info(first_speaker: XR_game_object, second_speaker: XR_game_object): boolean {
  return !jup_a9_actor_has_power_info(first_speaker, second_speaker);
}

export function actor_relocate_power_info(first_speaker: XR_game_object, second_speaker: XR_game_object): void {
  takeItemsFromActor(first_speaker, second_speaker, "jup_a9_power_info");
}

export function jup_a9_actor_has_way_info(first_speaker: XR_game_object, second_speaker: XR_game_object): boolean {
  return getActor()!.object("jup_a9_way_info") !== null;
}

export function jup_a9_actor_hasnt_way_info(first_speaker: XR_game_object, second_speaker: XR_game_object): boolean {
  return !jup_a9_actor_has_way_info(first_speaker, second_speaker);
}

export function actor_relocate_way_info(first_speaker: XR_game_object, second_speaker: XR_game_object): void {
  takeItemsFromActor(first_speaker, second_speaker, "jup_a9_way_info");
}

export function jup_a9_actor_has_meeting_info(first_speaker: XR_game_object, second_speaker: XR_game_object): boolean {
  return getActor()!.object("jup_a9_meeting_info") !== null;
}

export function jup_a9_actor_hasnt_meeting_info(
  first_speaker: XR_game_object,
  second_speaker: XR_game_object
): boolean {
  return !jup_a9_actor_has_meeting_info(first_speaker, second_speaker);
}

export function actor_relocate_meeting_info(first_speaker: XR_game_object, second_speaker: XR_game_object): void {
  takeItemsFromActor(first_speaker, second_speaker, "jup_a9_meeting_info");
  giveInfo("jup_a9_meeting_info_sold");
}

export function jup_a9_actor_has_delivery_info(first_speaker: XR_game_object, second_speaker: XR_game_object): boolean {
  return getActor()!.object("jup_a9_delivery_info") !== null;
}

export function jup_a9_actor_hasnt_delivery_info(
  first_speaker: XR_game_object,
  second_speaker: XR_game_object
): boolean {
  return !jup_a9_actor_has_delivery_info(first_speaker, second_speaker);
}

export function jup_a9_actor_has_evacuation_info(
  first_speaker: XR_game_object,
  second_speaker: XR_game_object
): boolean {
  return getActor()!.object("jup_a9_evacuation_info") !== null;
}

export function jup_a9_actor_hasnt_evacuation_info(
  first_speaker: XR_game_object,
  second_speaker: XR_game_object
): boolean {
  return !jup_a9_actor_has_evacuation_info(first_speaker, second_speaker);
}

export function actor_relocate_evacuation_info(first_speaker: XR_game_object, second_speaker: XR_game_object): void {
  takeItemsFromActor(first_speaker, second_speaker, "jup_a9_evacuation_info");
  giveInfo("jup_a9_evacuation_info_sold");
}

export function actor_relocate_delivery_info(first_speaker: XR_game_object, second_speaker: XR_game_object): void {
  takeItemsFromActor(first_speaker, second_speaker, "jup_a9_delivery_info");
  giveInfo("jup_a9_delivery_info_sold");
}

export function jup_a9_actor_has_losses_info(first_speaker: XR_game_object, second_speaker: XR_game_object): boolean {
  return getActor()!.object("jup_a9_losses_info") !== null;
}

export function jup_a9_actor_hasnt_losses_info(first_speaker: XR_game_object, second_speaker: XR_game_object): boolean {
  return !jup_a9_actor_has_losses_info(first_speaker, second_speaker);
}

// --------------------------------------------------
export function actor_relocate_losses_info(first_speaker: XR_game_object, second_speaker: XR_game_object): void {
  takeItemsFromActor(first_speaker, second_speaker, "jup_a9_losses_info");
  giveInfo("jup_a9_losses_info_sold");
}

// -- b206
export function actor_has_plant(first_speaker: XR_game_object, second_speaker: XR_game_object): boolean {
  return getActor()!.object("jup_b206_plant") !== null;
}

export function actor_relocate_plant(first_speaker: XR_game_object, second_speaker: XR_game_object): void {
  takeItemsFromActor(first_speaker, second_speaker, "jup_b206_plant");
}

// -- b212
export function actor_relocate_trapper_reward(first_speaker: XR_game_object, second_speaker: XR_game_object): void {
  giveItemsToActor(first_speaker, second_speaker, "wpn_wincheaster1300_trapper");
}

export function zat_b106_trapper_reward(first_speaker: XR_game_object, second_speaker: XR_game_object): void {
  if (hasAlifeInfo("zat_b106_one_hit")) {
    giveMoneyToActor(3000);
  } else {
    giveMoneyToActor(2000);
  }
}

// -- Jupiter a10, by alex
export function jup_a10_proverka_wpn(first_speaker: XR_game_object, second_speaker: XR_game_object): boolean {
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

  const actor: XR_game_object = getActor() as XR_game_object;

  for (const [k, v] of table) {
    if (actor.item_in_slot(2)?.section() === v || actor.item_in_slot(3)?.section() === v) {
      return true;
    }
  }

  return false;
}

export function jup_a10_proverka_wpn_false(first_speaker: XR_game_object, second_speaker: XR_game_object): boolean {
  return !jup_a10_proverka_wpn(first_speaker, second_speaker);
}

export function jup_a10_actor_has_money(first_speaker: XR_game_object, second_speaker: XR_game_object): boolean {
  const actor: XR_game_object = getActor() as XR_game_object;

  if (hasAlifeInfo(info_portions.jup_a10_debt_wo_percent)) {
    return actor.money() >= 5000;
  } else {
    return actor.money() >= 7000;
  }
}

export function jup_a10_actor_has_not_money(first_speaker: XR_game_object, second_speaker: XR_game_object): boolean {
  return !jup_a10_actor_has_money(first_speaker, second_speaker);
}

export function jup_a10_actor_give_money(first_speaker: XR_game_object, second_speaker: XR_game_object): void {
  if (hasAlifeInfo("jup_a10_debt_wo_percent")) {
    takeMoneyFromActor(first_speaker, second_speaker, 5000);
    giveInfo(info_portions.jup_a10_bandit_take_money);
  } else {
    takeMoneyFromActor(first_speaker, second_speaker, 7000);
    giveInfo(info_portions.jup_a10_bandit_take_all_money);
  }
}

export function jup_a10_vano_give_money(first_speaker: XR_game_object, second_speaker: XR_game_object): void {
  giveMoneyToActor(5000);
}

export function jup_a10_actor_give_outfit_money(first_speaker: XR_game_object, second_speaker: XR_game_object): void {
  takeMoneyFromActor(first_speaker, second_speaker, 5000);
}

export function jup_a10_actor_has_outfit_money(first_speaker: XR_game_object, second_speaker: XR_game_object): boolean {
  return getActor()!.money() >= 5000;
}

export function jup_a10_actor_has_not_outfit_money(
  first_speaker: XR_game_object,
  second_speaker: XR_game_object
): boolean {
  return !jup_a10_actor_has_outfit_money(first_speaker, second_speaker);
}

// -- Jupiter b16, by alex
export function if_actor_has_jup_b16_oasis_artifact(
  first_speaker: XR_game_object,
  second_speaker: XR_game_object
): boolean {
  return first_speaker.object("af_oasis_heart") !== null;
}

export function if_actor_hasnt_jup_b16_oasis_artifact(
  first_speaker: XR_game_object,
  second_speaker: XR_game_object
): boolean {
  return !if_actor_has_jup_b16_oasis_artifact(first_speaker, second_speaker);
}

export function jupiter_b16_reward(first_speaker: XR_game_object, second_speaker: XR_game_object): void {
  giveMoneyToActor(7000);
}

export function give_jup_b16_oasis_artifact(first_speaker: XR_game_object, second_speaker: XR_game_object): void {
  takeItemsFromActor(first_speaker, second_speaker, "af_oasis_heart");
}

export function jup_a12_actor_has_15000_money(first_speaker: XR_game_object, second_speaker: XR_game_object): boolean {
  return getActor()!.money() >= 15000;
}

export function jup_a12_actor_do_not_has_15000_money(
  first_speaker: XR_game_object,
  second_speaker: XR_game_object
): boolean {
  return getActor()!.money() < 15000;
}

const jup_a12_af_table = [
  artefacts.af_fire,
  artefacts.af_gold_fish,
  artefacts.af_glass,
  artefacts.af_ice,
] as unknown as LuaArray<TArtefact>;

export function jup_a12_actor_has_artefacts(first_speaker: XR_game_object, second_speaker: XR_game_object): boolean {
  for (const [k, v] of jup_a12_af_table) {
    if (getActor()!.object(v) !== null) {
      return true;
    }
  }

  return false;
}

export function jup_a12_actor_has_artefact_1(first_speaker: XR_game_object, second_speaker: XR_game_object): boolean {
  return getActor()!.object(jup_a12_af_table.get(1)) !== null;
}

export function jup_a12_actor_has_artefact_2(first_speaker: XR_game_object, second_speaker: XR_game_object): boolean {
  return getActor()!.object(jup_a12_af_table.get(2)) !== null;
}

export function jup_a12_actor_has_artefact_3(first_speaker: XR_game_object, second_speaker: XR_game_object): boolean {
  return getActor()!.object(jup_a12_af_table.get(3)) !== null;
}

export function jup_a12_actor_has_artefact_4(first_speaker: XR_game_object, second_speaker: XR_game_object): boolean {
  return getActor()!.object(jup_a12_af_table.get(4)) !== null;
}
export function jup_a12_actor_do_not_has_artefacts(
  first_speaker: XR_game_object,
  second_speaker: XR_game_object
): boolean {
  const actor: XR_game_object = getActor() as XR_game_object;

  for (const [k, v] of jup_a12_af_table) {
    if (actor.object(v) !== null) {
      return false;
    }
  }

  return true;
}

export function jup_a12_transfer_ransom_from_actor(
  first_speaker: XR_game_object,
  second_speaker: XR_game_object
): void {
  if (hasAlifeInfo(info_portions.jup_a12_ransom_by_money)) {
    takeMoneyFromActor(first_speaker, second_speaker, 15000);

    return;
  }

  const jup_a12_info_table = [
    "jup_a12_af_fire",
    "jup_a12_af_gold_fish",
    "jup_a12_af_glass",
    "jup_a12_af_ice",
  ] as unknown as LuaArray<TInfoPortion>;

  for (const i of $range(1, 4)) {
    if (hasAlifeInfo(jup_a12_info_table.get(i))) {
      takeItemsFromActor(first_speaker, second_speaker, jup_a12_af_table.get(i));

      return;
    }
  }
}

export function jup_a12_transfer_5000_money_to_actor(
  first_speaker: XR_game_object,
  second_speaker: XR_game_object
): void {
  giveMoneyToActor(5000);
  getTreasureManager().give_treasure("jup_hiding_place_40");
  getTreasureManager().give_treasure("jup_hiding_place_34");
}

export function jup_a12_transfer_artefact_to_actor(
  first_speaker: XR_game_object,
  second_speaker: XR_game_object
): void {
  giveItemsToActor(first_speaker, second_speaker, artefacts.af_gold_fish);

  if (hasAlifeInfo(info_portions.jup_a12_stalker_prisoner_free_dialog_done)) {
    getTreasureManager().give_treasure("jup_hiding_place_40");
    getTreasureManager().give_treasure("jup_hiding_place_34");
  }
}

export function jup_a12_transfer_cashier_money_from_actor(
  first_speaker: XR_game_object,
  second_speaker: XR_game_object
): void {
  let amount = math.random(20, 50) * 100;
  const actor: XR_game_object = getActor() as XR_game_object;

  if (actor.money() < amount) {
    amount = actor.money();
  }

  takeMoneyFromActor(first_speaker, second_speaker, amount);
}

export function zat_b30_transfer_detectors(first_speaker: XR_game_object, second_speaker: XR_game_object): void {
  takeItemsFromActor(first_speaker, second_speaker, detectors.detector_elite, 3);
}

export function zat_b30_actor_do_not_has_transfer_items(
  first_speaker: XR_game_object,
  second_speaker: XR_game_object
): boolean {
  return !zat_b30_actor_has_transfer_items(first_speaker, second_speaker);
}

export function zat_b30_actor_has_transfer_items(
  first_speaker: XR_game_object,
  second_speaker: XR_game_object
): boolean {
  const actor: XR_game_object = getActor() as XR_game_object;
  let cnt = 0;

  const zat_b30_count = (npc: XR_game_object, item: XR_game_object): void => {
    if (item.section() === "detector_elite") {
      cnt = cnt + 1;
    }
  };

  actor.iterate_inventory(zat_b30_count, actor);

  return cnt >= 3;
}

// --- Jupiter B32
export function jup_b6_scientist_nuclear_physicist_scan_anomaly_precond(
  first_speaker: XR_game_object,
  second_speaker: XR_game_object
): boolean {
  if (!hasAlifeInfo(info_portions.jup_b6_b32_quest_active)) {
    return false;
  } else if (hasAlifeInfo(info_portions.jup_b6_give_task) && hasAlifeInfo(info_portions.jup_b32_task_addon_start)) {
    return false;
  } else if (hasAlifeInfo(info_portions.jup_b6_task_fail) && hasAlifeInfo(info_portions.jup_b32_task_addon_start)) {
    return false;
  }

  return true;
}

export function jup_b32_task_give_dialog_precond(
  first_speaker: XR_game_object,
  second_speaker: XR_game_object
): boolean {
  return !(hasAlifeInfo(info_portions.jup_b32_task_start) && !hasAlifeInfo("jup_b32_task_end"));
}

export function jup_b32_transfer_scanners(first_speaker: XR_game_object, second_speaker: XR_game_object): void {
  giveItemsToActor(first_speaker, second_speaker, info_portions.jup_b32_scanner_device, 3);
}

export function jup_b32_transfer_scanners_2(first_speaker: XR_game_object, second_speaker: XR_game_object): void {
  giveItemsToActor(first_speaker, second_speaker, info_portions.jup_b32_scanner_device, 2);
}

export function jup_b32_give_reward_to_actor(first_speaker: XR_game_object, second_speaker: XR_game_object): void {
  giveMoneyToActor(5000);
}

// --- Jupiter 209
export function jup_b209_get_monster_scanner(first_speaker: XR_game_object, second_speaker: XR_game_object): void {
  giveItemsToActor(first_speaker, second_speaker, "jup_b209_monster_scanner", 1);
}

export function jup_b209_return_monster_scanner(first_speaker: XR_game_object, second_speaker: XR_game_object): void {
  takeItemsFromActor(first_speaker, second_speaker, "jup_b209_monster_scanner", 1);
}

export function jup_b32_anomaly_do_not_has_af(first_speaker: XR_game_object, second_speaker: XR_game_object): boolean {
  if (hasAlifeInfo("jup_b32_anomaly_true")) {
    disableInfo("jup_b32_anomaly_true");

    return false;
  }

  const az_table = [
    "jup_b32_anomal_zone",
    "jup_b201_anomal_zone",
    "jup_b209_anomal_zone",
    "jup_b211_anomal_zone",
    "jup_b10_anomal_zone",
  ] as unknown as LuaArray<string>;
  const infop_table = [
    "jup_b32_anomaly_1",
    "jup_b32_anomaly_2",
    "jup_b32_anomaly_3",
    "jup_b32_anomaly_4",
    "jup_b32_anomaly_5",
  ] as unknown as LuaArray<string>;

  let index = 0;

  for (const i of $range(1, infop_table.length())) {
    if (hasAlifeInfo(infop_table.get(i))) {
      index = i;
      break;
    }
  }

  if (index === 0) {
    return true;
  }

  const anomal_zone: IStoredObject = anomalyByName.get(az_table.get(index));

  if (anomal_zone === null) {
    disableInfo(infop_table.get(index));

    return true;
  }

  if (anomal_zone.spawned_count > 0) {
    return false;
  }

  disableInfo(infop_table.get(index));

  return true;
}

// --- Jupiter 207
export function jup_b207_generic_decrypt_need_dialog_precond(
  first_speaker: XR_game_object,
  second_speaker: XR_game_object
): boolean {
  const actor: XR_game_object = getActor() as XR_game_object;

  if (actor.object("jup_b9_blackbox") !== null) {
    return true;
  }

  if (
    get_global<AnyCallablesModule>("xr_conditions").check_npc_name(first_speaker, second_speaker, ["mechanic"]) ||
    get_global<AnyCallablesModule>("xr_conditions").check_npc_name(first_speaker, second_speaker, ["tech"])
  ) {
    return false;
  }

  return false;
}

export function jup_b207_actor_has_dealers_pda(first_speaker: XR_game_object, second_speaker: XR_game_object): boolean {
  return getActor()!.object("device_pda_zat_b5_dealer") !== null;
}

export function jup_b207_sell_dealers_pda(first_speaker: XR_game_object, second_speaker: XR_game_object): void {
  takeItemsFromActor(first_speaker, second_speaker, "device_pda_zat_b5_dealer");
  giveMoneyToActor(4000);
  giveInfo("jup_b207_dealers_pda_sold");
}

export function jup_b207_give_dealers_pda(first_speaker: XR_game_object, second_speaker: XR_game_object): void {
  takeItemsFromActor(first_speaker, second_speaker, "device_pda_zat_b5_dealer");
}

export function jup_b207_actor_has_merc_pda_with_contract(
  first_speaker: XR_game_object,
  second_speaker: XR_game_object
): boolean {
  return getActor()!.object("jup_b207_merc_pda_with_contract") !== null;
}

export function jup_b207_sell_merc_pda_with_contract(
  first_speaker: XR_game_object,
  second_speaker: XR_game_object
): void {
  const amount = 1000;

  takeItemsFromActor(first_speaker, second_speaker, "jup_b207_merc_pda_with_contract");
  giveMoneyToActor(amount);
  giveInfo("jup_b207_merc_pda_with_contract_sold");
}

export function jup_b207_transfer_blackmail_reward(
  first_speaker: XR_game_object,
  second_speaker: XR_game_object
): void {
  takeItemsFromActor(first_speaker, second_speaker, "jup_b207_merc_pda_with_contract");
}

export function jup_b207_transfer_blackmail_reward_for_pda(
  first_speaker: XR_game_object,
  second_speaker: XR_game_object
): void {
  takeItemsFromActor(first_speaker, second_speaker, "jup_b207_merc_pda_with_contract");
  giveItemsToActor(first_speaker, second_speaker, "wpn_abakan");
}

// ---B1----
export function give_jup_b1_art(first_speaker: XR_game_object, second_speaker: XR_game_object): void {
  takeItemsFromActor(first_speaker, second_speaker, "jup_b1_half_artifact");
}

export function if_actor_has_jup_b1_art(first_speaker: XR_game_object, second_speaker: XR_game_object): boolean {
  return getActor()!.object("jup_b1_half_artifact") !== null;
}

export function jup_b1_actor_do_not_have_good_suit(
  first_speaker: XR_game_object,
  second_speaker: XR_game_object
): boolean {
  return !jup_b1_actor_have_good_suit(first_speaker, second_speaker);
}

export function jup_b1_reward_actor(first_speaker: XR_game_object, second_speaker: XR_game_object): void {
  giveMoneyToActor(6000);
}

// ---B6----

export function jup_b6_actor_outfit_cs(first_speaker: XR_game_object, second_speaker: XR_game_object): boolean {
  const actor: XR_game_object = getActor() as XR_game_object;

  if (actor.item_in_slot(7) !== null && actor.item_in_slot(7)!.section() === "cs_heavy_outfit") {
    return true;
  }

  return false;
}

export function jup_b6_first_reward_for_actor(first_speaker: XR_game_object, second_speaker: XR_game_object): void {
  giveMoneyToActor(2500);
}

export function jup_b6_second_reward_for_actor(first_speaker: XR_game_object, second_speaker: XR_game_object): void {
  giveMoneyToActor(2500);
}

export function jup_b6_all_reward_for_actor(first_speaker: XR_game_object, second_speaker: XR_game_object): void {
  giveMoneyToActor(5000);
}

export function jup_b6_first_reward_for_actor_extra(
  first_speaker: XR_game_object,
  second_speaker: XR_game_object
): void {
  giveMoneyToActor(3500);
}

export function jup_b6_second_reward_for_actor_extra(
  first_speaker: XR_game_object,
  second_speaker: XR_game_object
): void {
  giveMoneyToActor(3500);
}

export function jup_b6_all_reward_for_actor_extra(first_speaker: XR_game_object, second_speaker: XR_game_object): void {
  giveMoneyToActor(7000);
}

export function jup_b6_reward_actor_by_detector(first_speaker: XR_game_object, second_speaker: XR_game_object): void {
  giveItemsToActor(first_speaker, second_speaker, "detector_elite");
}

export function jup_b1_actor_have_good_suit(first_speaker: XR_game_object, second_speaker: XR_game_object) {
  const suits_tbl = {
    [outfits.scientific_outfit]: true,
    [outfits.military_outfit]: true,
    [outfits.dolg_heavy_outfit]: true,
    [outfits.exo_outfit]: true,
    [outfits.svoboda_light_outfit]: true,
    [outfits.svoboda_heavy_outfit]: true,
    [outfits.cs_heavy_outfit]: true,
  } as unknown as LuaTable<TOutfit, boolean>;

  const helmets_tbl = {
    [helmets.helm_battle]: true,
    [helmets.helm_tactic]: true,
    [helmets.helm_protective]: true,
  } as unknown as LuaTable<THelmet, boolean>;

  const actor: XR_game_object = getActor() as XR_game_object;

  if (actor.item_in_slot(7) !== null && suits_tbl.get(actor.section())) {
    return true;
  }

  if (actor.item_in_slot(12) !== null && helmets_tbl.get(actor.item_in_slot(12)!.section())) {
    return true;
  }

  return false;
}

export function jup_b6_actor_can_not_start(first_speaker: XR_game_object, second_speaker: XR_game_object): boolean {
  return !jup_b6_actor_can_start(first_speaker, second_speaker);
}

export function jup_b6_actor_can_start(first_speaker: XR_game_object, second_speaker: XR_game_object): boolean {
  if (
    hasAlifeInfo(info_portions.jup_b1_squad_is_dead) &&
    !(
      hasAlifeInfo(info_portions.jup_b6_freedom_employed) ||
      hasAlifeInfo(info_portions.jup_b6_duty_employed) ||
      hasAlifeInfo(info_portions.jup_b6_gonta_employed) ||
      hasAlifeInfo(info_portions.jup_b6_exprisoner_work_on_sci)
    )
  ) {
    return false;
  }

  return true;
}

export function jup_b1_stalker_squad_thanks(first_speaker: XR_game_object, second_speaker: XR_game_object): void {
  giveItemsToActor(first_speaker, second_speaker, "medkit_scientic", 3);
  giveItemsToActor(first_speaker, second_speaker, "antirad", 5);
  giveItemsToActor(first_speaker, second_speaker, "drug_psy_blockade", 2);
  giveItemsToActor(first_speaker, second_speaker, "drug_antidot", 2);
  giveItemsToActor(first_speaker, second_speaker, "drug_radioprotector", 2);
  giveItemsToActor(first_speaker, second_speaker, "drug_anabiotic");
  giveItemsToActor(first_speaker, second_speaker, "helm_protective");
}

export function jup_b202_actor_has_medkit(first_speaker: XR_game_object, second_speaker: XR_game_object): boolean {
  const actor = getActorSpeaker(first_speaker, second_speaker);

  return (
    actor.object("medkit") !== null || actor.object("medkit_army") !== null || actor.object("medkit_scientic") !== null
  );
}

export function jup_b202_hit_bandit_from_actor(first_speaker: XR_game_object, second_speaker: XR_game_object): void {
  const npc = getNpcSpeaker(first_speaker, second_speaker);
  const actor = getActorSpeaker(first_speaker, second_speaker);

  giveInfo("jup_b202_bandit_hited");
  giveInfo("jup_b202_bandit_hited_by_actor");
  get_global<AnyCallablesModule>("xr_effects").set_squad_goodwill(actor, npc, ["jup_b202_bandit_squad", "enemy"]);
  // --xr_effects.hit_npc_from_actor(actor,npc,{"jup_b202_bandit"})
}

export function jup_b202_medic_dialog_precondition(
  first_speaker: XR_game_object,
  second_speaker: XR_game_object
): boolean {
  if (hasAlifeInfo("jup_b218_gather_squad_complete")) {
    return !hasAlifeInfo("jup_b202_polustanok");
  } else {
    return !hasAlifeInfo("jup_b52_medic_testimony");
  }
}

export function jup_b6_stalker_dialog_precond(first_speaker: XR_game_object, second_speaker: XR_game_object): boolean {
  const npc: XR_game_object = getNpcSpeaker(first_speaker, second_speaker);
  const npcAlife: Optional<XR_cse_alife_creature_abstract> = alife().object<XR_cse_alife_creature_abstract>(npc.id());

  if (!npcAlife) {
    return false;
  }

  if (alife().object(npcAlife.group_id) === null) {
    return false;
  }

  const squad_name = alife().object(npcAlife.group_id)!.section_name();

  if (squad_name !== null && squad_name !== "") {
    if (!hasAlifeInfo(info_portions.jup_b1_squad_is_dead) && squad_name === info_portions.jup_b1_stalker_squad) {
      return true;
    } else if (
      hasAlifeInfo(info_portions.jup_b6_freedom_employed) &&
      squad_name === info_portions.jup_b6_stalker_freedom_squad
    ) {
      return true;
    } else if (
      hasAlifeInfo(info_portions.jup_b6_duty_employed) &&
      squad_name === info_portions.jup_b6_stalker_duty_squad
    ) {
      return true;
    } else if (
      hasAlifeInfo(info_portions.jup_b6_gonta_employed) &&
      squad_name === info_portions.jup_b6_stalker_gonta_squad
    ) {
      return true;
    } else if (
      hasAlifeInfo(info_portions.jup_b6_exprisoner_work_on_sci) &&
      squad_name === info_portions.jup_b6_stalker_exprisoner_squad
    ) {
      return true;
    }
  }

  return false;
}

// -- Jupiter B217 functions -------------------------------------------------
export function jup_b217_actor_got_toolkit(first_speaker: XR_game_object, second_speaker: XR_game_object): boolean {
  const actor: XR_game_object = getActorSpeaker(first_speaker, second_speaker) as XR_game_object;

  const is_toolkit = (npc: XR_game_object, item: XR_game_object): void => {
    const section = item.section();

    if (
      (section === "toolkit_1" && !hasAlifeInfo(info_portions.jup_b217_tech_instrument_1_brought)) ||
      (section === "toolkit_2" && !hasAlifeInfo(info_portions.jup_b217_tech_instrument_2_brought)) ||
      (section === "toolkit_3" && !hasAlifeInfo(info_portions.jup_b217_tech_instrument_3_brought))
    ) {
      (actor as AnyObject).toolkit = section;

      return;
    }
  };

  actor.iterate_inventory(is_toolkit, actor);

  if ((actor as AnyObject).toolkit !== null) {
    return true;
  }

  return false;
}

// ----------------------  b200
export function jupiter_b200_tech_materials_relocate(
  first_speaker: XR_game_object,
  second_speaker: XR_game_object
): void {
  const need_items = {
    ["jup_b200_tech_materials_wire"]: true,
    ["jup_b200_tech_materials_acetone"]: true,
    ["jup_b200_tech_materials_textolite"]: true,
    ["jup_b200_tech_materials_transistor"]: true,
    ["jup_b200_tech_materials_capacitor"]: true,
  } as unknown as LuaTable<string, boolean>;

  const actor: XR_game_object = getActor() as XR_game_object;
  const items_to_relocate: LuaTable<string, number> = new LuaTable();
  let count: number = 0;

  const relocate_and_inc_count = (npc: XR_game_object, item: XR_game_object): void => {
    if (need_items.get(item.section())) {
      const section: string = item.section();

      count = count + 1;

      if (items_to_relocate.get(section) === null) {
        items_to_relocate.set(section, 1);
      } else {
        items_to_relocate.set(section, items_to_relocate.get(section) + 1);
      }
    }
  };

  actor.iterate_inventory(relocate_and_inc_count, actor);

  get_global<AnyCallablesModule>("xr_effects").inc_counter(actor, null, [
    "jup_b200_tech_materials_brought_counter",
    tostring(count),
  ]);

  for (const [k, v] of items_to_relocate) {
    takeItemsFromActor(first_speaker, second_speaker, k, v);
  }
}

// ----------------------  b4 ----------------------
export function npc_in_b4_smart(first_speaker: XR_game_object, second_speaker: XR_game_object): void {
  return get_global<AnyCallablesModule>("dialogs").is_npc_in_current_smart(first_speaker, second_speaker, "jup_b4");
}

// ----------------------  b202 ----------------------
export function jup_b202_transfer_medkit(first_speaker: XR_game_object, second_speaker: XR_game_object): void {
  const actor: XR_game_object = getActor() as XR_game_object;

  if (actor.object(drugs.medkit) !== null) {
    takeItemsFromActor(first_speaker, second_speaker, drugs.medkit);
  } else if (actor.object(drugs.medkit_army) !== null) {
    takeItemsFromActor(first_speaker, second_speaker, drugs.medkit_army);
  } else if (actor.object(drugs.medkit_scientic) !== null) {
    takeItemsFromActor(first_speaker, second_speaker, drugs.medkit_scientic);
  }
}

// ----------------------  b220 ----------------------
export function jupiter_b220_all_hunted(first_speaker: XR_game_object, second_speaker: XR_game_object): boolean {
  if (
    hasAlifeInfo(info_portions.jup_b220_trapper_bloodsucker_lair_hunted_told) &&
    hasAlifeInfo(info_portions.jup_b220_trapper_zaton_chimera_hunted_told) &&
    hasAlifeInfo(info_portions.jup_b211_swamp_bloodsuckers_hunt_done) &&
    hasAlifeInfo(info_portions.jup_b208_burers_hunt_done) &&
    hasAlifeInfo(info_portions.jup_b212_jupiter_chimera_hunt_done)
  ) {
    return false;
  }

  return true;
}

/**
 * todo;
 */
export function jupiter_b220_no_one_hunted(first_speaker: XR_game_object, second_speaker: XR_game_object): boolean {
  if (
    hasAlifeInfo(info_portions.jup_b220_trapper_about_himself_told) &&
    hasAlifeInfo(info_portions.zat_b57_den_of_the_bloodsucker_tell_stalkers_about_destroy_lair_give) &&
    !hasAlifeInfo(info_portions.jup_b220_trapper_bloodsucker_lair_hunted_told)
  ) {
    return false;
  } else if (
    hasAlifeInfo(info_portions.zat_b106_chimera_dead) &&
    !hasAlifeInfo(info_portions.jup_b220_trapper_zaton_chimera_hunted_told)
  ) {
    return false;
  } else if (
    hasAlifeInfo(info_portions.jup_b6_all_hunters_are_dead) &&
    !hasAlifeInfo(info_portions.jup_b211_swamp_bloodsuckers_hunt_done)
  ) {
    return false;
  } else if (
    hasAlifeInfo(info_portions.jup_b208_burers_dead) &&
    !hasAlifeInfo(info_portions.jup_b208_burers_hunt_done)
  ) {
    return false;
  } else if (
    hasAlifeInfo(info_portions.jup_b212_jupiter_chimera_dead) &&
    !hasAlifeInfo(info_portions.jup_b212_jupiter_chimera_hunt_done)
  ) {
    return false;
  }

  return true;
}

const money_count_table = [3000, 2850, 2700, 2550, 2400, 2250, 2100, 1950, 1800, 1650] as unknown as LuaArray<number>;

export function jup_b9_actor_has_money(first_speaker: XR_game_object, second_speaker: XR_game_object): boolean {
  let money_count: number = 0;

  for (const it of $range(1, 9)) {
    if (hasAlifeInfo("jup_b200_tech_materials_brought_counter_" + it)) {
      money_count = money_count_table.get(it);
    }
  }

  return getActor()!.money() >= money_count;
}

export function jupiter_b9_relocate_money(first_speaker: XR_game_object, second_speaker: XR_game_object): void {
  let money_count: number = 0;

  for (const it of $range(1, 9)) {
    if (hasAlifeInfo("jup_b200_tech_materials_brought_counter_" + it)) {
      money_count = money_count_table.get(it);
    }
  }

  takeMoneyFromActor(first_speaker, second_speaker, money_count);
}

export function give_jup_b9_blackbox(first_speaker: XR_game_object, second_speaker: XR_game_object): void {
  takeItemsFromActor(first_speaker, second_speaker, "jup_b9_blackbox");
}

export function jup_b9_actor_has_not_money(first_speaker: XR_game_object, second_speaker: XR_game_object): boolean {
  return !jup_b9_actor_has_money(first_speaker, second_speaker);
}

export function if_actor_has_jup_b9_blackbox(first_speaker: XR_game_object, second_speaker: XR_game_object): boolean {
  return getActor()!.object("jup_b9_blackbox") !== null;
}

export function if_actor_has_af_mincer_meat(first_speaker: XR_game_object, second_speaker: XR_game_object): boolean {
  return first_speaker.object(artefacts.af_mincer_meat) !== null;
}

export function if_actor_has_af_fuzz_kolobok(first_speaker: XR_game_object, second_speaker: XR_game_object): boolean {
  return first_speaker.object(artefacts.af_fuzz_kolobok) !== null;
}

export function actor_has_first_or_second_artefact(
  first_speaker: XR_game_object,
  second_speaker: XR_game_object
): boolean {
  return (
    first_speaker.object(artefacts.af_mincer_meat) !== null || first_speaker.object(artefacts.af_fuzz_kolobok) !== null
  );
}

// -- �������� ���������� �� ������� �� �������
export function transfer_af_mincer_meat(first_speaker: XR_game_object, second_speaker: XR_game_object): void {
  takeItemsFromActor(first_speaker, second_speaker, artefacts.af_mincer_meat);
}

// -- Jupiter B15 functions -------------------------------------------------
export function jup_b15_dec_counter(first_speaker: XR_game_object, second_speaker: XR_game_object): boolean {
  const npc: XR_game_object = getNpcSpeaker(first_speaker, second_speaker);
  const actor: XR_game_object = getActorSpeaker(first_speaker, second_speaker);

  return get_global<AnyCallablesModule>("xr_effects").dec_counter(actor, npc, ["jup_b15_full_drunk_count", 1]);
}

export function jup_b46_sell_duty_founder_pda(first_speaker: XR_game_object, second_speaker: XR_game_object): void {
  const actor: XR_game_object = getActorSpeaker(first_speaker, second_speaker);

  if (hasAlifeInfo(info_portions.jup_b46_duty_founder_pda_to_freedom)) {
    giveMoneyToActor(4000);
    relocateQuestItemSection(actor, weapons.wpn_sig550, "in", 1);
    relocateQuestItemSection(actor, ammo["ammo_5.56x45_ss190"], "in", 5);
  } else if (hasAlifeInfo(info_portions.jup_b46_duty_founder_pda_to_duty)) {
    giveMoneyToActor(4000);
    relocateQuestItemSection(actor, weapons.wpn_groza, "in", 1);
    relocateQuestItemSection(actor, ammo.ammo_9x39_ap, "in", 2);
    relocateQuestItemSection(actor, ammo["ammo_vog-25"], "in", 2);
  }
}

// -- Jupiter B46 ------------------------------------------------------------
export function jup_b46_transfer_duty_founder_pda(first_speaker: XR_game_object, second_speaker: XR_game_object): void {
  const npc: XR_game_object = getNpcSpeaker(first_speaker, second_speaker);

  if (getActor()!.object("jup_b46_duty_founder_pda") !== null) {
    relocateQuestItemSection(npc, "jup_b46_duty_founder_pda", "out");
  }
}

export function jup_b46_sell_duty_founder_pda_to_owl(
  first_speaker: XR_game_object,
  second_speaker: XR_game_object
): void {
  takeItemsFromActor(first_speaker, second_speaker, "jup_b46_duty_founder_pda");
  giveMoneyToActor(2500);
  giveInfo(info_portions.jup_b46_duty_founder_pda_sold);
  giveInfo(info_portions.jup_b46_duty_founder_pda_to_stalkers);
}

export function jup_b46_actor_has_founder_pda(first_speaker: XR_game_object, second_speaker: XR_game_object): boolean {
  return getActor()!.object("jup_b46_duty_founder_pda") !== null;
}

// -------------------------- Jupiter b47 --------------------------------------
export function jup_b47_jupiter_docs_enabled(first_speaker: XR_game_object, second_speaker: XR_game_object): boolean {
  const actor: XR_game_object = getActor() as XR_game_object;
  const items_table = [
    "jup_a9_conservation_info",
    "jup_a9_power_info",
    "jup_a9_way_info",
    "jup_a9_evacuation_info",
    "jup_a9_meeting_info",
    "jup_a9_losses_info",
    "jup_a9_delivery_info",
    // --						"jup_b47_jupiter_products_info"
  ];

  let a = false;

  for (const [k, v] of items_table) {
    if (actor.object(v) !== null) {
      a = true;
      break;
    }
  }

  const b =
    !hasAlifeInfo(info_portions.jup_b47_jupiter_products_start) &&
    actor.object(info_portions.jup_b47_jupiter_products_info) !== null;
  const c = hasAlifeInfo(info_portions.jup_b6_scientist_nuclear_physicist_jupiter_docs_talked);

  return (a || b) && !c;
}

export function transfer_af_fuzz_kolobok(first_speaker: XR_game_object, second_speaker: XR_game_object): void {
  takeItemsFromActor(first_speaker, second_speaker, "af_fuzz_kolobok");
}

// -- ����� �� �������� ������ �� �������

export function pay_cost_to_guide_to_pripyat(first_speaker: XR_game_object, second_speaker: XR_game_object): void {
  takeMoneyFromActor(first_speaker, second_speaker, 5000);
}

// -- ��������, ������������������ ������ �� �������� �� �������

export function jup_b43_actor_has_5000_money(first_speaker: XR_game_object, second_speaker: XR_game_object): boolean {
  return getActor()!.money() >= 5000;
}

export function jup_b43_actor_do_not_has_5000_money(
  first_speaker: XR_game_object,
  second_speaker: XR_game_object
): boolean {
  return getActor()!.money() < 5000;
}

// -- ������� �� ���������

export function jup_b43_reward_for_first_artefact(first_speaker: XR_game_object, second_speaker: XR_game_object): void {
  giveMoneyToActor(2500);
}

export function jup_b43_reward_for_second_artefact(
  first_speaker: XR_game_object,
  second_speaker: XR_game_object
): void {
  giveMoneyToActor(3500);
}

export function jup_b43_reward_for_both_artefacts(first_speaker: XR_game_object, second_speaker: XR_game_object): void {
  giveMoneyToActor(6000);
}

// -- Jupiter B218 functions ---------------------------------------------------
export function jup_b218_counter_not_3(first_speaker: XR_game_object, second_speaker: XR_game_object): boolean {
  const npc = getNpcSpeaker(first_speaker, second_speaker);
  const actor = getActorSpeaker(first_speaker, second_speaker);

  return !get_global<AnyCallablesModule>("xr_conditions").counter_equal(actor, npc, [
    "jup_b218_squad_members_count",
    3,
  ]);
}

export function jup_b218_counter_equal_3(first_speaker: XR_game_object, second_speaker: XR_game_object): boolean {
  const npc = getNpcSpeaker(first_speaker, second_speaker);
  const actor = getActorSpeaker(first_speaker, second_speaker);

  return get_global<AnyCallablesModule>("xr_conditions").counter_equal(actor, npc, ["jup_b218_squad_members_count", 3]);
}

export function jup_b218_counter_not_0(first_speaker: XR_game_object, second_speaker: XR_game_object): boolean {
  const npc = getNpcSpeaker(first_speaker, second_speaker);
  const actor = getActorSpeaker(first_speaker, second_speaker);

  return !get_global<AnyCallablesModule>("xr_conditions").counter_equal(actor, npc, [
    "jup_b218_squad_members_count",
    0,
  ]);
}

// --------------------------- Jupiter b25 -------------------------------------
export function jup_b25_frase_count_inc(first_speaker: XR_game_object, second_speaker: XR_game_object): boolean {
  const npc = getNpcSpeaker(first_speaker, second_speaker);
  const actor = getActorSpeaker(first_speaker, second_speaker);

  return get_global<AnyCallablesModule>("xr_effects").inc_counter(actor, npc, ["jup_b25_frase", 1]);
}

export function jup_b32_anomaly_has_af(first_speaker: XR_game_object, second_speaker: XR_game_object): boolean {
  const az_table = [
    "jup_b32_anomal_zone",
    "jup_b201_anomal_zone",
    "jup_b209_anomal_zone",
    "jup_b211_anomal_zone",
    "jup_b10_anomal_zone",
  ] as unknown as LuaArray<string>;
  const infop_table = [
    "jup_b32_anomaly_1",
    "jup_b32_anomaly_2",
    "jup_b32_anomaly_3",
    "jup_b32_anomaly_4",
    "jup_b32_anomaly_5",
  ] as unknown as LuaArray<string>;

  let index = 0;

  for (const it of $range(1, infop_table.length())) {
    if (hasAlifeInfo(infop_table.get(it))) {
      index = it;
      break;
    }
  }

  if (index === 0) {
    return false;
  }

  const anomal_zone = anomalyByName.get(az_table.get(index));

  if (anomal_zone === null) {
    return false;
  }

  if (anomal_zone.spawned_count > 0) {
    disableInfo(infop_table.get(index));
    giveInfo(info_portions.jup_b32_anomaly_true);

    return true;
  }

  return false;
}

// -- Jupiter B4 -------------------------------------------------------------
export function jup_b4_is_actor_not_enemies_to_freedom(
  first_speaker: XR_game_object,
  second_speaker: XR_game_object
): boolean {
  return !jup_b4_is_actor_enemies_to_freedom(first_speaker, second_speaker);
}

export function jup_b4_is_actor_enemies_to_freedom(
  first_speaker: XR_game_object,
  second_speaker: XR_game_object
): boolean {
  return get_npcs_relation(first_speaker, second_speaker) === game_object.enemy;
}

export function jup_b4_is_actor_friend_to_freedom(
  first_speaker: XR_game_object,
  second_speaker: XR_game_object
): boolean {
  return get_npcs_relation(first_speaker, second_speaker) === game_object.friend;
}

export function jup_b4_is_actor_neutral_to_freedom(
  first_speaker: XR_game_object,
  second_speaker: XR_game_object
): boolean {
  return get_npcs_relation(first_speaker, second_speaker) === game_object.neutral;
}

export function jup_b4_is_actor_not_enemies_to_dolg(
  first_speaker: XR_game_object,
  second_speaker: XR_game_object
): boolean {
  return !jup_b4_is_actor_enemies_to_dolg(first_speaker, second_speaker);
}

export function jup_b4_is_actor_enemies_to_dolg(
  first_speaker: XR_game_object,
  second_speaker: XR_game_object
): boolean {
  return get_npcs_relation(first_speaker, second_speaker) === game_object.enemy;
}

export function jup_b4_is_actor_friend_to_dolg(first_speaker: XR_game_object, second_speaker: XR_game_object): boolean {
  return get_npcs_relation(first_speaker, second_speaker) === game_object.friend;
}

export function jup_b4_is_actor_neutral_to_dolg(
  first_speaker: XR_game_object,
  second_speaker: XR_game_object
): boolean {
  return get_npcs_relation(first_speaker, second_speaker) === game_object.neutral;
}

export function jup_b47_jupiter_products_info_enabled(
  first_speaker: XR_game_object,
  second_speaker: XR_game_object
): boolean {
  return getActor()!.object("jup_b47_jupiter_products_info") !== null;
}

export function jup_b47_jupiter_products_info_disabled(
  first_speaker: XR_game_object,
  second_speaker: XR_game_object
): boolean {
  return getActor()!.object("jup_b47_jupiter_products_info") === null;
}

export function jup_b47_jupiter_products_info_revard(
  first_speaker: XR_game_object,
  second_speaker: XR_game_object
): void {
  const npc = getNpcSpeaker(first_speaker, second_speaker);
  const actor = getActorSpeaker(first_speaker, second_speaker);

  relocateQuestItemSection(npc, "jup_b47_jupiter_products_info", "out");
  giveMoneyToActor(7000);
  relocateQuestItemSection(actor, "medkit_scientic", "in", 3);
  relocateQuestItemSection(actor, "antirad", "in", 5);
  relocateQuestItemSection(actor, "drug_psy_blockade", "in", 2);
  relocateQuestItemSection(actor, "drug_antidot", "in", 2);
  relocateQuestItemSection(actor, "drug_radioprotector", "in", 2);
}

export function jup_b47_actor_has_merc_pda(first_speaker: XR_game_object, second_speaker: XR_game_object): boolean {
  return getActor()!.object("jup_b47_merc_pda") !== null;
}

export function jup_b47_actor_has_not_merc_pda(first_speaker: XR_game_object, second_speaker: XR_game_object): boolean {
  return !jup_b47_actor_has_merc_pda(first_speaker, second_speaker);
}

export function jup_b47_merc_pda_revard(first_speaker: XR_game_object, second_speaker: XR_game_object): void {
  const npc = getNpcSpeaker(first_speaker, second_speaker);

  relocateQuestItemSection(npc, "jup_b47_merc_pda", "out");
  giveMoneyToActor(2500);
}

export function jup_b47_actor_can_take_task(first_speaker: XR_game_object, second_speaker: XR_game_object): boolean {
  const a = hasAlifeInfo(info_portions.jup_b6_task_done) && !hasAlifeInfo(info_portions.jup_b6_task_fail);
  const b = hasAlifeInfo(info_portions.jup_b6_task_fail) && !hasAlifeInfo(info_portions.jup_b6_task_done);

  return a || b;
}

export function jup_b47_employ_squad(first_speaker: XR_game_object, second_speaker: XR_game_object): boolean {
  const a =
    hasAlifeInfo(info_portions.jup_b47_bunker_guards_started) &&
    !hasAlifeInfo(info_portions.jup_b47_bunker_guards_done);
  const b = hasAlifeInfo(info_portions.jup_b6_employ_stalker) && !hasAlifeInfo(info_portions.jup_b6_employed_stalker);

  return a || b;
}

export function jup_b47_bunker_guard_revard(first_speaker: XR_game_object, second_speaker: XR_game_object): void {
  const actor = getActorSpeaker(first_speaker, second_speaker);

  giveMoneyToActor(4000);
  relocateQuestItemSection(actor, "drug_psy_blockade", "in", 2);
  relocateQuestItemSection(actor, "drug_antidot", "in", 3);
  relocateQuestItemSection(actor, "drug_radioprotector", "in", 3);
}

export function jup_b47_gauss_rifle_revard(first_speaker: XR_game_object, second_speaker: XR_game_object): void {
  giveMoneyToActor(12000);
}

export function jup_b47_actor_has_hauss_rifle_docs(
  first_speaker: XR_game_object,
  second_speaker: XR_game_object
): boolean {
  return getActor()!.object("zat_a23_gauss_rifle_docs") !== null;
}

// -- Jupiter B10 --------------------------------------------------------------
export function jup_b10_ufo_memory_give_to_npc(first_speaker: XR_game_object, second_speaker: XR_game_object): void {
  takeItemsFromActor(first_speaker, second_speaker, "jup_b10_ufo_memory");
}

export function jup_b10_ufo_memory_give_to_actor(
  first_speaker: XR_game_object,
  second_speaker: XR_game_object
): boolean {
  return first_speaker.object("jup_b10_ufo_memory") !== null;
}

export function jup_b10_ufo_memory_2_give_to_actor(
  first_speaker: XR_game_object,
  second_speaker: XR_game_object
): void {
  giveItemsToActor(first_speaker, second_speaker, "jup_b10_ufo_memory_2");
}

export function jup_b10_ufo_has_money_1000(first_speaker: XR_game_object, second_speaker: XR_game_object): boolean {
  return getActor()!.money() >= 1000;
}

export function jup_b10_ufo_has_money_3000(first_speaker: XR_game_object, second_speaker: XR_game_object): boolean {
  return getActor()!.money() >= 2000;
}

export function jup_b10_ufo_hasnt_money_1000(first_speaker: XR_game_object, second_speaker: XR_game_object): boolean {
  return !jup_b10_ufo_has_money_1000(first_speaker, second_speaker);
}

export function jup_b10_ufo_hasnt_money_3000(first_speaker: XR_game_object, second_speaker: XR_game_object): boolean {
  return !jup_b10_ufo_has_money_3000(first_speaker, second_speaker);
}

export function jup_b10_ufo_relocate_money_1000(first_speaker: XR_game_object, second_speaker: XR_game_object): void {
  takeMoneyFromActor(first_speaker, second_speaker, 1000);
}

export function jup_b10_ufo_relocate_money_3000(first_speaker: XR_game_object, second_speaker: XR_game_object): void {
  takeMoneyFromActor(first_speaker, second_speaker, 2000);
}

export function jup_b10_actor_has_ufo_memory(first_speaker: XR_game_object, second_speaker: XR_game_object): boolean {
  return getActor()!.object("jup_b10_ufo_memory") !== null;
}

// -------------- jup_b211 ---------------------
export function jup_b211_kill_bludsuckers_reward(first_speaker: XR_game_object, second_speaker: XR_game_object): void {
  giveMoneyToActor(3000);
}

export function jup_b19_transfer_conserva_to_actor(
  first_speaker: XR_game_object,
  second_speaker: XR_game_object
): void {
  giveItemsToActor(first_speaker, second_speaker, "conserva");
}
// ----------------------------------
export function jupiter_b6_sell_halfartefact(first_speaker: XR_game_object, second_speaker: XR_game_object): void {
  giveMoneyToActor(2000);
}
// -----------------------------------

export function pri_a15_sokolov_actor_has_note(first_speaker: XR_game_object, second_speaker: XR_game_object): boolean {
  return getActor()!.object("jup_b205_sokolov_note") !== null;
}

export function pri_a15_sokolov_actor_has_not_note(
  first_speaker: XR_game_object,
  second_speaker: XR_game_object
): boolean {
  return !pri_a15_sokolov_actor_has_note(first_speaker, second_speaker);
}
export function pri_a15_sokolov_actor_give_note(first_speaker: XR_game_object, second_speaker: XR_game_object): void {
  takeItemsFromActor(first_speaker, second_speaker, "jup_b205_sokolov_note");
  giveItemsToActor(first_speaker, second_speaker, "medkit_army");
}

export function jup_b47_actor_not_enemy_to_freedom(
  first_speaker: XR_game_object,
  second_speaker: XR_game_object
): boolean {
  const npc = getNpcSpeaker(first_speaker, second_speaker);
  const actor = getActorSpeaker(first_speaker, second_speaker);

  return !get_global<AnyCallablesModule>("xr_conditions").is_faction_enemy_to_actor(actor, npc, ["freedom"]);
}

export function jup_b47_actor_not_enemy_to_dolg(
  first_speaker: XR_game_object,
  second_speaker: XR_game_object
): boolean {
  const npc = getNpcSpeaker(first_speaker, second_speaker);
  const actor = getActorSpeaker(first_speaker, second_speaker);

  return !get_global<AnyCallablesModule>("xr_conditions").is_faction_enemy_to_actor(actor, npc, ["dolg"]);
}

export function jup_b15_actor_sci_outfit(first_speaker: XR_game_object, second_speaker: XR_game_object): boolean {
  return getActor()!.object("scientific_outfit") !== null;
}

export function jup_b15_no_actor_sci_outfit(first_speaker: XR_game_object, second_speaker: XR_game_object): boolean {
  return getActor()!.object("scientific_outfit") === null;
}

export function jup_b19_reward(first_speaker: XR_game_object, second_speaker: XR_game_object): void {
  getTreasureManager().give_treasure("jup_hiding_place_38");
}
