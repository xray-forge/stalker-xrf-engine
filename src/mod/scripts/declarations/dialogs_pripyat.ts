/* eslint @typescript-eslint/explicit-function-return-type: "error" */

import { XR_game_object } from "xray16";

import { info_portions } from "@/mod/globals/info_portions/info_portions";
import { ammo, TAmmoItem } from "@/mod/globals/items/ammo";
import { artefacts } from "@/mod/globals/items/artefacts";
import { drugs } from "@/mod/globals/items/drugs";
import { food } from "@/mod/globals/items/food";
import { helmets } from "@/mod/globals/items/helmets";
import { outfits } from "@/mod/globals/items/outfits";
import { quest_items } from "@/mod/globals/items/quest_items";
import { weapons } from "@/mod/globals/items/weapons";
import { LuaArray } from "@/mod/lib/types";
import { registry } from "@/mod/scripts/core/database";
import { disableInfo, giveInfo, hasAlifeInfo } from "@/mod/scripts/utils/info_portion";
import { LuaLogger } from "@/mod/scripts/utils/logging";
import { giveItemsToActor, giveMoneyToActor, takeItemsFromActor, takeMoneyFromActor } from "@/mod/scripts/utils/quest";

const log: LuaLogger = new LuaLogger($filename);

/**
 * todo;
 */
export function pri_b301_zulus_reward(first_speaker: XR_game_object, second_speaker: XR_game_object): void {
  giveItemsToActor(first_speaker, second_speaker, weapons.wpn_pkm_zulus);
}

/**
 * todo;
 */
export function pri_a17_reward(first_speaker: XR_game_object, second_speaker: XR_game_object): void {
  if (hasAlifeInfo(info_portions.pri_a17_reward_well)) {
    giveMoneyToActor(7500);
  } else if (hasAlifeInfo(info_portions.pri_a17_reward_norm)) {
    giveMoneyToActor(4000);
  } else if (hasAlifeInfo(info_portions.pri_a17_reward_bad)) {
    giveMoneyToActor(3000);
  }
}

/**
 * todo;
 */
export function actor_has_pri_a17_gauss_rifle(first_speaker: XR_game_object, second_speaker: XR_game_object): boolean {
  return registry.actor.object("pri_a17_gauss_rifle") !== null;
}

/**
 * todo;
 */
export function actor_hasnt_pri_a17_gauss_rifle(
  first_speaker: XR_game_object,
  second_speaker: XR_game_object
): boolean {
  return !actor_has_pri_a17_gauss_rifle(first_speaker, second_speaker);
}

/**
 * todo;
 */
export function transfer_artifact_af_baloon(first_speaker: XR_game_object, second_speaker: XR_game_object): void {
  giveItemsToActor(first_speaker, second_speaker, artefacts.af_baloon);
}

/**
 * todo;
 */
export function pay_cost_to_guide_to_zaton(first_speaker: XR_game_object, second_speaker: XR_game_object): void {
  if (hasAlifeInfo(info_portions.zat_b215_gave_maps)) {
    takeMoneyFromActor(first_speaker, second_speaker, 1000);
  } else {
    takeMoneyFromActor(first_speaker, second_speaker, 3000);
  }
}

/**
 * todo;
 */
export function jup_b43_actor_has_10000_money(first_speaker: XR_game_object, second_speaker: XR_game_object): boolean {
  if (hasAlifeInfo(info_portions.zat_b215_gave_maps)) {
    return registry.actor.money() >= 3000;
  }

  return registry.actor.money() >= 5000;
}

/**
 * todo;
 */
export function jup_b43_actor_do_not_has_10000_money(
  first_speaker: XR_game_object,
  second_speaker: XR_game_object
): boolean {
  return !jup_b43_actor_has_10000_money(first_speaker, second_speaker);
}

/**
 * todo;
 */
export function pay_cost_to_guide_to_jupiter(first_speaker: XR_game_object, second_speaker: XR_game_object): void {
  takeMoneyFromActor(first_speaker, second_speaker, 7000);
}

/**
 * todo;
 */
export function jup_b43_actor_has_7000_money(first_speaker: XR_game_object, second_speaker: XR_game_object): boolean {
  return registry.actor.money() >= 7000;
}

/**
 * todo;
 */
export function jup_b43_actor_do_not_has_7000_money(
  first_speaker: XR_game_object,
  second_speaker: XR_game_object
): boolean {
  return registry.actor.money() < 7000;
}

/**
 * todo;
 */
export function pri_b35_transfer_svd(first_speaker: XR_game_object, second_speaker: XR_game_object): void {
  giveItemsToActor(first_speaker, second_speaker, weapons.wpn_svd);
  giveItemsToActor(first_speaker, second_speaker, ammo["ammo_7.62x54_7h1"]);
}

/**
 * todo;
 */
export function pri_b35_give_actor_reward(first_speaker: XR_game_object, second_speaker: XR_game_object): void {
  const amount = hasAlifeInfo(info_portions.pri_b35_secondary) ? 3 : 1;

  giveItemsToActor(first_speaker, second_speaker, ammo["ammo_7.62x54_7h1"], amount);
}

/**
 * todo;
 */
const medic_items_table = {
  ["basic"]: {
    [food.conserva]: 2,
    [drugs.medkit_army]: 2,
    [drugs.antirad]: 2,
    [drugs.bandage]: 4,
  },
  ["advanced"]: {
    [food.conserva]: 3,
    [drugs.medkit_army]: 3,
    [drugs.antirad]: 3,
    [drugs.bandage]: 5,
  },
  ["elite"]: {
    [food.conserva]: 4,
    [drugs.medkit_army]: 5,
    [drugs.antirad]: 5,
    [drugs.bandage]: 8,
  },
} as unknown as LuaTable<string, LuaTable<string, number>>;

/**
 * todo;
 */
export function pri_a25_medic_give_kit(first_speaker: XR_game_object, second_speaker: XR_game_object): void {
  let kit = "basic";

  if (hasAlifeInfo(info_portions.pri_a25_actor_needs_medikit_advanced_supply)) {
    kit = "advanced";
  } else if (hasAlifeInfo(info_portions.pri_a25_actor_needs_medikit_elite_supply)) {
    kit = "elite";
  }

  for (const [k, v] of medic_items_table) {
    if (k === kit) {
      for (const [kk, vv] of v) {
        giveItemsToActor(first_speaker, second_speaker, kk, vv);
      }

      disableInfo(k);
    }
  }
}

const supp_table = {
  ["supply_ammo_1"]: { ["ammo_9x18_fmj"]: 2, ["ammo_9x18_pmm"]: 1 },
  ["supply_ammo_2"]: { ["ammo_9x19_fmj"]: 2, ["ammo_9x19_pbp"]: 1 },
  ["supply_ammo_3"]: { ["ammo_11.43x23_fmj"]: 2, ["ammo_11.43x23_hydro"]: 1 },
  ["supply_ammo_4"]: { ["ammo_12x70_buck"]: 10, ["ammo_12x76_zhekan"]: 5 },
  ["supply_ammo_5"]: { ["ammo_5.45x39_fmj"]: 2, ["ammo_5.45x39_ap"]: 1 },
  ["supply_ammo_6"]: { ["ammo_5.56x45_ss190"]: 2, ["ammo_5.56x45_ap"]: 1 },
  ["supply_ammo_7"]: { ["ammo_9x39_pab9"]: 1, ["ammo_9x39_ap"]: 1 },
  ["supply_ammo_8"]: { ["ammo_7.62x54_7h1"]: 1 },
  ["supply_ammo_9"]: { ["ammo_pkm_100"]: 1 },
  ["supply_grenade_1"]: { ["grenade_rgd5"]: 3, ["grenade_f1"]: 2 },
  ["supply_grenade_2"]: { ["ammo_vog-25"]: 3 },
  ["supply_grenade_3"]: { ["ammo_m209"]: 3 },
} as unknown as LuaTable<string, LuaTable<TAmmoItem, number>>;

export function pri_a22_army_signaller_supply(first_speaker: XR_game_object, second_speaker: XR_game_object): void {
  for (const [k, v] of supp_table) {
    if (hasAlifeInfo(k)) {
      for (const [kk, vv] of v) {
        giveItemsToActor(first_speaker, second_speaker, kk, vv);
      }

      disableInfo(k);
    }
  }
}

/**
 * todo;
 */
export function pri_a22_give_actor_outfit(first_speaker: XR_game_object, second_speaker: XR_game_object): void {
  giveItemsToActor(first_speaker, second_speaker, outfits.military_outfit);
  giveItemsToActor(first_speaker, second_speaker, helmets.helm_battle);
}

/**
 * todo;
 */
export function pri_b305_actor_has_strelok_notes(): boolean {
  const actor: XR_game_object = registry.actor;

  return (
    actor.object(quest_items.jup_b10_notes_01) !== null ||
    actor.object(quest_items.jup_b10_notes_02) !== null ||
    actor.object(quest_items.jup_b10_notes_03) !== null
  );
}

/**
 * todo;
 */
export function pri_b305_actor_has_strelok_note_1(): boolean {
  const actor: XR_game_object = registry.actor;

  return (
    actor.object(quest_items.jup_b10_notes_01) !== null &&
    actor.object(quest_items.jup_b10_notes_02) === null &&
    actor.object(quest_items.jup_b10_notes_03) === null
  );
}

/**
 * todo;
 */
export function pri_b305_actor_has_strelok_note_2(): boolean {
  const actor: XR_game_object = registry.actor;

  return (
    actor.object(quest_items.jup_b10_notes_02) !== null &&
    actor.object(quest_items.jup_b10_notes_01) === null &&
    actor.object(quest_items.jup_b10_notes_03) === null
  );
}

/**
 * todo;
 */
export function pri_b305_actor_has_strelok_note_3(): boolean {
  const actor: XR_game_object = registry.actor;

  return (
    actor.object(quest_items.jup_b10_notes_03) !== null &&
    actor.object(quest_items.jup_b10_notes_01) === null &&
    actor.object(quest_items.jup_b10_notes_02) === null
  );
}

/**
 * todo;
 */
export function pri_b305_actor_has_strelok_note_12(): boolean {
  const actor: XR_game_object = registry.actor;

  return (
    actor.object(quest_items.jup_b10_notes_01) !== null &&
    actor.object(quest_items.jup_b10_notes_02) !== null &&
    actor.object(quest_items.jup_b10_notes_03) === null
  );
}

/**
 * todo;
 */
export function pri_b305_actor_has_strelok_note_13(): boolean {
  const actor: XR_game_object = registry.actor;

  return (
    actor.object(quest_items.jup_b10_notes_01) !== null &&
    actor.object(quest_items.jup_b10_notes_03) !== null &&
    actor.object(quest_items.jup_b10_notes_02) === null
  );
}

/**
 * todo;
 */
export function pri_b305_actor_has_strelok_note_23(): boolean {
  const actor: XR_game_object = registry.actor;

  return (
    actor.object(quest_items.jup_b10_notes_02) !== null &&
    actor.object(quest_items.jup_b10_notes_03) !== null &&
    actor.object(quest_items.jup_b10_notes_01) === null
  );
}

/**
 * todo;
 */
export function pri_b305_actor_has_strelok_note_all(): boolean {
  const actor: XR_game_object = registry.actor;

  return (
    actor.object(quest_items.jup_b10_notes_01) !== null &&
    actor.object(quest_items.jup_b10_notes_02) !== null &&
    actor.object(quest_items.jup_b10_notes_03) !== null
  );
}

/**
 * todo;
 */
export function pri_b305_sell_strelok_notes(first_speaker: XR_game_object, second_speaker: XR_game_object): void {
  const items_table = [
    quest_items.jup_b10_notes_01,
    quest_items.jup_b10_notes_02,
    quest_items.jup_b10_notes_03,
  ] as unknown as LuaArray<string>;
  const actor: XR_game_object = registry.actor;

  let amount: number = 0;

  for (const [k, v] of items_table) {
    if (actor.object(v) !== null) {
      takeItemsFromActor(first_speaker, second_speaker, v);
      amount = amount + 1;
    }
  }

  if (actor.object(weapons.wpn_gauss) !== null) {
    giveItemsToActor(first_speaker, second_speaker, ammo.ammo_gauss, 2);
  } else {
    giveItemsToActor(first_speaker, second_speaker, drugs.medkit_scientic, 3);
  }

  if (amount > 1) {
    giveItemsToActor(first_speaker, second_speaker, artefacts.af_fire);
  }

  if (amount > 2) {
    giveItemsToActor(first_speaker, second_speaker, artefacts.af_glass);
    giveInfo(info_portions.pri_b305_all_strelok_notes_given);
  }
}

/**
 * todo;
 */
export function pri_a17_sokolov_is_not_at_base(first_speaker: XR_game_object, second_speaker: XR_game_object): boolean {
  return hasAlifeInfo(info_portions.pri_a15_sokolov_out) && hasAlifeInfo(info_portions.pas_b400_sokolov_dead);
}
