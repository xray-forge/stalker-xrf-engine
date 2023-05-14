import { alife, level, XR_alife_simulator, XR_cse_alife_creature_abstract, XR_game_object } from "xray16";

import { getObjectByStoryId, getServerObjectByStoryId, registry } from "@/engine/core/database";
import { Squad } from "@/engine/core/objects";
import { abort } from "@/engine/core/utils/assertion";
import { extern, getExtern } from "@/engine/core/utils/binding";
import { isObjectInZone } from "@/engine/core/utils/check/check";
import { hasAlifeInfo } from "@/engine/core/utils/info_portion";
import { LuaLogger } from "@/engine/core/utils/logging";
import { distanceBetween } from "@/engine/core/utils/vector";
import { infoPortions, TInfoPortion } from "@/engine/lib/constants/info_portions";
import { zones } from "@/engine/lib/constants/zones";
import { AnyCallablesModule, LuaArray, Optional, TDistance, TName } from "@/engine/lib/types";
import { zat_b29_af_table, zat_b29_infop_bring_table } from "@/engine/scripts/declarations/dialogs/dialogs_zaton";

const logger: LuaLogger = new LuaLogger($filename);

/**
 * todo;
 */
extern(
  "xr_conditions.zat_b29_anomaly_has_af",
  (actor: XR_game_object, npc: XR_game_object, p: Optional<string>): boolean => {
    const az_name = p && p[0];
    let af_name: Optional<string> = null;

    const anomal_zone = registry.anomalyZones.get(az_name as TName);

    if (az_name === null || anomal_zone === null || anomal_zone.spawnedArtefactsCount < 1) {
      return false;
    }

    for (const i of $range(16, 23)) {
      if (hasAlifeInfo(zat_b29_infop_bring_table.get(i))) {
        af_name = zat_b29_af_table.get(i);
        break;
      }
    }

    for (const [artefactId] of registry.artefacts.ways) {
      if (alife().object(tonumber(artefactId)!) && af_name === alife().object(tonumber(artefactId)!)!.section_name()) {
        registry.actor.give_info_portion(az_name);

        return true;
      }
    }

    return false;
  }
);

/**
 * todo;
 */
extern("xr_conditions.jup_b221_who_will_start", (actor: XR_game_object, npc: XR_game_object, p: [string]): boolean => {
  const reachable_theme: LuaArray<number> = new LuaTable();
  const infoPortionsList: LuaArray<TInfoPortion> = $fromArray<TInfoPortion>([
    infoPortions.jup_b25_freedom_flint_gone,
    infoPortions.jup_b25_flint_blame_done_to_duty,
    infoPortions.jup_b4_monolith_squad_in_duty,
    infoPortions.jup_a6_duty_leader_bunker_guards_work,
    infoPortions.jup_a6_duty_leader_employ_work,
    infoPortions.jup_b207_duty_wins,
    infoPortions.jup_b207_freedom_know_about_depot,
    infoPortions.jup_b46_duty_founder_pda_to_freedom,
    infoPortions.jup_b4_monolith_squad_in_freedom,
    infoPortions.jup_a6_freedom_leader_bunker_guards_work,
    infoPortions.jup_a6_freedom_leader_employ_work,
    infoPortions.jup_b207_freedom_wins,
  ]);

  for (const [k, v] of infoPortionsList) {
    const factionsList: LuaArray<string> = new LuaTable();

    if (k <= 6) {
      factionsList.set(1, "duty");
      factionsList.set(2, "0");
    } else {
      factionsList.set(1, "freedom");
      factionsList.set(2, "6");
    }

    if (
      hasAlifeInfo(v) &&
      !hasAlifeInfo(
        ("jup_b221_" +
          factionsList.get(1) +
          "_main_" +
          tostring(k - tonumber(factionsList.get(2))!) +
          "_played") as TInfoPortion
      )
    ) {
      table.insert(reachable_theme, k);
    }
  }

  if ((p && p[0]) === null) {
    abort("No such parameters in function 'jup_b221_who_will_start'");
  }

  if (tostring(p[0]) === "ability") {
    return reachable_theme.length() !== 0;
  } else if (tostring(p[0]) === "choose") {
    return reachable_theme.get(math.random(1, reachable_theme.length())) <= 6;
  } else {
    abort("Wrong parameters in function 'jup_b221_who_will_start'");
  }
});

/**
 * todo;
 */
extern("xr_conditions.pas_b400_actor_far_forward", (actor: XR_game_object, npc: XR_game_object): boolean => {
  const forwardObject = getObjectByStoryId("pas_b400_fwd");

  if (forwardObject) {
    if (distanceBetween(forwardObject, registry.actor) > distanceBetween(forwardObject, npc)) {
      return false;
    }
  } else {
    return false;
  }

  const distance = 70 * 70;
  const self_dist = npc.position().distance_to_sqr(actor.position());

  if (self_dist < distance) {
    return false;
  }

  const squad: Squad = alife().object(alife().object<XR_cse_alife_creature_abstract>(npc.id())!.group_id)!;

  for (const squadMember in squad.squad_members()) {
    // todo: Mistake or typedef upd needed.
    const other_dist = (squadMember as any).object.position.distance_to_sqr(actor.position());

    if (other_dist < distance) {
      return false;
    }
  }

  return true;
});

/**
 * todo;
 */
extern("xr_conditions.pas_b400_actor_far_backward", (actor: XR_game_object, npc: XR_game_object): boolean => {
  const backwardObject: Optional<XR_game_object> = getObjectByStoryId("pas_b400_bwd");

  if (backwardObject !== null) {
    if (distanceBetween(backwardObject, registry.actor) > distanceBetween(backwardObject, npc)) {
      return false;
    }
  } else {
    return false;
  }

  const distance = 70 * 70;
  const self_dist = npc.position().distance_to_sqr(actor.position());

  if (self_dist < distance) {
    return false;
  }

  const sim: XR_alife_simulator = alife();
  const squad: Squad = sim.object<Squad>(sim.object<XR_cse_alife_creature_abstract>(npc.id())!.group_id)!;

  for (const squadMember of squad.squad_members()) {
    const other_dist = squadMember.object.position.distance_to_sqr(actor.position());

    if (other_dist < distance) {
      return false;
    }
  }

  return true;
});

/**
 * todo;
 */
extern("xr_conditions.pri_a28_actor_is_far", (actor: XR_game_object, npc: XR_game_object): boolean => {
  const distance: TDistance = 150 * 150;
  const squad: Optional<Squad> = getServerObjectByStoryId("pri_a16_military_squad")!;

  if (squad === null) {
    abort("Unexpected actor far check - no squad existing.");
  }

  for (const squadMember of squad.squad_members()) {
    const objectDistanceToActor: TDistance = squadMember.object.position.distance_to_sqr(actor.position());

    if (objectDistanceToActor < distance) {
      return false;
    }
  }

  return true;
});

/**
 * todo;
 */
extern("xr_conditions.jup_b25_senya_spawn_condition", (): boolean => {
  return (
    (hasAlifeInfo(infoPortions.jup_b16_oasis_found) ||
      hasAlifeInfo(infoPortions.zat_b57_bloodsucker_lair_clear) ||
      hasAlifeInfo(infoPortions.jup_b6_complete_end) ||
      hasAlifeInfo(infoPortions.zat_b215_gave_maps)) &&
    hasAlifeInfo(infoPortions.zat_b106_search_soroka)
  );
});

/**
 * todo;
 */
extern("xr_conditions.jup_b25_flint_gone_condition", (): boolean => {
  return (
    hasAlifeInfo(infoPortions.jup_b25_flint_blame_done_to_duty) ||
    hasAlifeInfo(infoPortions.jup_b25_flint_blame_done_to_freedom) ||
    hasAlifeInfo(infoPortions.zat_b106_found_soroka_done)
  );
});

/**
 * todo;
 */
extern("xr_conditions.zat_b103_actor_has_needed_food", (actor: XR_game_object, npc: XR_game_object): boolean => {
  return (
    getExtern<AnyCallablesModule>("dialogs_zaton").zat_b103_actor_has_needed_food(actor, npc) ||
    hasAlifeInfo(infoPortions.zat_b103_merc_task_done)
  );
});

/**
 * todo;
 */
extern("xr_conditions.zat_b29_rivals_dialog_precond", (actor: XR_game_object, npc: XR_game_object): boolean => {
  const squadsList: LuaArray<TName> = $fromArray<TName>([
    "zat_b29_stalker_rival_default_1_squad",
    "zat_b29_stalker_rival_default_2_squad",
    "zat_b29_stalker_rival_1_squad",
    "zat_b29_stalker_rival_2_squad",
  ]);
  const zonesList: LuaArray<TName> = $fromArray([
    zones.zat_b29_sr_1,
    "zat_b29_sr_2",
    "zat_b29_sr_3",
    "zat_b29_sr_4",
    "zat_b29_sr_5",
  ]);

  let f_squad: boolean = false;

  for (const [k, v] of squadsList) {
    if (alife().object(alife().object<XR_cse_alife_creature_abstract>(npc.id())!.group_id)!.section_name() === v) {
      f_squad = true;
      break;
    }
  }

  if (!f_squad) {
    return false;
  }

  for (const [k, v] of zonesList) {
    if (isObjectInZone(npc, registry.zones.get(v))) {
      return true;
    }
  }

  return false;
});

/**
 * todo;
 */
extern("xr_conditions.jup_b202_actor_treasure_not_in_steal", (actor: XR_game_object, npc: XR_game_object) => {
  const before: boolean =
    !hasAlifeInfo(infoPortions.jup_b52_actor_items_can_be_stolen) &&
    !hasAlifeInfo(infoPortions.jup_b202_actor_items_returned);
  const after: boolean =
    hasAlifeInfo(infoPortions.jup_b52_actor_items_can_be_stolen) &&
    hasAlifeInfo(infoPortions.jup_b202_actor_items_returned);

  return before || after;
});

/**
 * todo;
 */
extern("xr_conditions.jup_b47_npc_online", (actor: XR_game_object, npc: XR_game_object, params: [string]) => {
  const storyObject: Optional<XR_game_object> = getObjectByStoryId(params[0]);

  if (storyObject === null) {
    return false;
  }

  return alife().object(storyObject.id()) !== null;
});

/**
 * todo;
 */
extern("xr_conditions.zat_b7_is_night", (): boolean => {
  return registry.actor !== null && (level.get_time_hours() >= 23 || level.get_time_hours() < 5);
});

/**
 * todo;
 */
extern("xr_conditions.zat_b7_is_late_attack_time", (): boolean => {
  return registry.actor !== null && (level.get_time_hours() >= 23 || level.get_time_hours() < 9);
});

/**
 * todo;
 */
extern("xr_conditions.jup_b202_inventory_box_empty", (actor: XR_game_object, npc: XR_game_object): boolean => {
  return getObjectByStoryId("jup_b202_actor_treasure")!.is_inv_box_empty();
});

/**
 * todo;
 */
extern("xr_conditions.jup_b16_is_zone_active", (actor: XR_game_object, npc: XR_game_object): boolean => {
  return hasAlifeInfo(npc.name() as TInfoPortion);
});

/**
 * todo;
 */
extern("xr_conditions.is_jup_a12_mercs_time", (): boolean => {
  return registry.actor !== null && level.get_time_hours() >= 1 && level.get_time_hours() < 5;
});
