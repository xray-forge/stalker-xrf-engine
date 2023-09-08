import { alife, level } from "xray16";

import { getObjectByStoryId, getServerObjectByStoryId, registry } from "@/engine/core/database";
import { AnomalyZoneBinder } from "@/engine/core/objects/binders";
import { Squad } from "@/engine/core/objects/server";
import { abort } from "@/engine/core/utils/assertion";
import { extern, getExtern } from "@/engine/core/utils/binding";
import { LuaLogger } from "@/engine/core/utils/logging";
import { hasAlifeInfo } from "@/engine/core/utils/object/object_info_portion";
import { getDistanceBetween, isObjectInZone } from "@/engine/core/utils/object/object_location";
import { infoPortions, TInfoPortion } from "@/engine/lib/constants/info_portions";
import {
  AlifeSimulator,
  AnyCallablesModule,
  ClientObject,
  LuaArray,
  Optional,
  ServerCreatureObject,
  TDistance,
  TName,
} from "@/engine/lib/types";
import { zatB29AfTable, zatB29InfopBringTable } from "@/engine/scripts/declarations/dialogs/dialogs_zaton";

const logger: LuaLogger = new LuaLogger($filename);

/**
 * todo;
 */
extern(
  "xr_conditions.zat_b29_anomaly_has_af",
  (actor: ClientObject, object: ClientObject, p: Optional<string>): boolean => {
    const azName: Optional<TName> = p && p[0];
    let afName: Optional<TName> = null;

    const anomalZone: AnomalyZoneBinder = registry.anomalyZones.get(azName as TName);

    if (azName === null || anomalZone === null || anomalZone.spawnedArtefactsCount < 1) {
      return false;
    }

    for (const i of $range(16, 23)) {
      if (hasAlifeInfo(zatB29InfopBringTable.get(i))) {
        afName = zatB29AfTable.get(i);
        break;
      }
    }

    for (const [artefactId] of registry.artefacts.ways) {
      if (alife().object(tonumber(artefactId)!) && afName === alife().object(tonumber(artefactId)!)!.section_name()) {
        registry.actor.give_info_portion(azName);

        return true;
      }
    }

    return false;
  }
);

/**
 * todo;
 */
extern("xr_conditions.jup_b221_who_will_start", (actor: ClientObject, object: ClientObject, p: [string]): boolean => {
  const reachableTheme: LuaArray<number> = new LuaTable();
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
      table.insert(reachableTheme, k);
    }
  }

  if ((p && p[0]) === null) {
    abort("No such parameters in function 'jup_b221_who_will_start'");
  }

  if (tostring(p[0]) === "ability") {
    return reachableTheme.length() !== 0;
  } else if (tostring(p[0]) === "choose") {
    return reachableTheme.get(math.random(1, reachableTheme.length())) <= 6;
  } else {
    abort("Wrong parameters in function 'jup_b221_who_will_start'");
  }
});

/**
 * todo;
 */
extern("xr_conditions.pas_b400_actor_far_forward", (actor: ClientObject, object: ClientObject): boolean => {
  const forwardObject: Optional<ClientObject> = getObjectByStoryId("pas_b400_fwd");

  if (forwardObject) {
    if (getDistanceBetween(forwardObject, registry.actor) > getDistanceBetween(forwardObject, object)) {
      return false;
    }
  } else {
    return false;
  }

  const distance: TDistance = 70 * 70;
  const selfDistance: TDistance = object.position().distance_to_sqr(actor.position());

  if (selfDistance < distance) {
    return false;
  }

  const squad: Squad = alife().object(alife().object<ServerCreatureObject>(object.id())!.group_id)!;

  for (const squadMember of squad.squad_members()) {
    const otherDistance: TDistance = squadMember.object.position.distance_to_sqr(actor.position());

    if (otherDistance < distance) {
      return false;
    }
  }

  return true;
});

/**
 * todo;
 */
extern("xr_conditions.pas_b400_actor_far_backward", (actor: ClientObject, object: ClientObject): boolean => {
  const backwardObject: Optional<ClientObject> = getObjectByStoryId("pas_b400_bwd");

  if (backwardObject !== null) {
    if (getDistanceBetween(backwardObject, registry.actor) > getDistanceBetween(backwardObject, object)) {
      return false;
    }
  } else {
    return false;
  }

  const distance: TDistance = 70 * 70;
  const selfDistance: TDistance = object.position().distance_to_sqr(actor.position());

  if (selfDistance < distance) {
    return false;
  }

  const sim: AlifeSimulator = alife();
  const squad: Squad = sim.object<Squad>(sim.object<ServerCreatureObject>(object.id())!.group_id)!;

  for (const squadMember of squad.squad_members()) {
    const otherDistance: TDistance = squadMember.object.position.distance_to_sqr(actor.position());

    if (otherDistance < distance) {
      return false;
    }
  }

  return true;
});

/**
 * todo;
 */
extern("xr_conditions.pri_a28_actor_is_far", (actor: ClientObject, object: ClientObject): boolean => {
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
extern("xr_conditions.zat_b103_actor_has_needed_food", (actor: ClientObject, object: ClientObject): boolean => {
  return (
    getExtern<AnyCallablesModule>("dialogs_zaton").zat_b103_actor_has_needed_food(actor, object) ||
    hasAlifeInfo(infoPortions.zat_b103_merc_task_done)
  );
});

/**
 * todo;
 */
extern("xr_conditions.zat_b29_rivals_dialog_precond", (actor: ClientObject, object: ClientObject): boolean => {
  const squadsList: LuaArray<TName> = $fromArray<TName>([
    "zat_b29_stalker_rival_default_1_squad",
    "zat_b29_stalker_rival_default_2_squad",
    "zat_b29_stalker_rival_1_squad",
    "zat_b29_stalker_rival_2_squad",
  ]);
  const zonesList: LuaArray<TName> = $fromArray([
    "zat_b29_sr_1",
    "zat_b29_sr_2",
    "zat_b29_sr_3",
    "zat_b29_sr_4",
    "zat_b29_sr_5",
  ]);

  let isSquad: boolean = false;

  for (const [k, v] of squadsList) {
    if (alife().object(alife().object<ServerCreatureObject>(object.id())!.group_id)!.section_name() === v) {
      isSquad = true;
      break;
    }
  }

  if (!isSquad) {
    return false;
  }

  for (const [k, v] of zonesList) {
    if (isObjectInZone(object, registry.zones.get(v))) {
      return true;
    }
  }

  return false;
});

/**
 * todo;
 */
extern("xr_conditions.jup_b202_actor_treasure_not_in_steal", (actor: ClientObject, object: ClientObject) => {
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
extern("xr_conditions.jup_b47_npc_online", (actor: ClientObject, object: ClientObject, params: [string]) => {
  const storyObject: Optional<ClientObject> = getObjectByStoryId(params[0]);

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
extern("xr_conditions.jup_b202_inventory_box_empty", (actor: ClientObject, object: ClientObject): boolean => {
  return getObjectByStoryId("jup_b202_actor_treasure")!.is_inv_box_empty();
});

/**
 * todo;
 */
extern("xr_conditions.jup_b16_is_zone_active", (actor: ClientObject, object: ClientObject): boolean => {
  return hasAlifeInfo(object.name() as TInfoPortion);
});

/**
 * todo;
 */
extern("xr_conditions.is_jup_a12_mercs_time", (): boolean => {
  return registry.actor !== null && level.get_time_hours() >= 1 && level.get_time_hours() < 5;
});
