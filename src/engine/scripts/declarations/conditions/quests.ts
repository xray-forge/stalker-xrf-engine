import { level } from "xray16";

import type { AnomalyZoneBinder } from "@/engine/core/binders/zones";
import { getObjectByStoryId, getServerObjectByStoryId, registry } from "@/engine/core/database";
import { Squad } from "@/engine/core/objects/squad";
import { abort } from "@/engine/core/utils/assertion";
import { extern, getExtern } from "@/engine/core/utils/binding";
import { giveInfoPortion, hasInfoPortion } from "@/engine/core/utils/info_portion";
import { getDistanceBetween, isObjectInZone } from "@/engine/core/utils/position";
import { infoPortions, TInfoPortion } from "@/engine/lib/constants/info_portions";
import { storyNames } from "@/engine/lib/constants/story_names";
import {
  AlifeSimulator,
  AnyCallablesModule,
  GameObject,
  LuaArray,
  Optional,
  ServerCreatureObject,
  ServerObject,
  TDistance,
  TName,
  TNumberId,
  TSection,
  TStringId,
} from "@/engine/lib/types";
import { zatB29AfTable, zatB29InfopBringTable } from "@/engine/scripts/declarations/dialogs/dialogs_zaton";

/**
 * Check if b29 quest detect that anomalies have artefacts.
 */
extern(
  "xr_conditions.zat_b29_anomaly_has_af",
  (_: GameObject, __: GameObject, [zoneName]: [Optional<TName>]): boolean => {
    const anomaly: Optional<AnomalyZoneBinder> = registry.anomalyZones.get(zoneName as TName);

    if (!zoneName || !anomaly || anomaly.spawnedArtefactsCount < 1) {
      return false;
    }

    let artefactName: Optional<TSection> = null;

    for (const index of $range(16, 23)) {
      if (hasInfoPortion(zatB29InfopBringTable.get(index))) {
        artefactName = zatB29AfTable.get(index);
        break;
      }
    }

    for (const [artefactId] of registry.artefacts.ways) {
      const artefact: Optional<ServerObject> = registry.simulator.object(tonumber(artefactId) as TNumberId);

      if (artefact && artefact.section_name() === artefactName) {
        giveInfoPortion(zoneName);

        return true;
      }
    }

    return false;
  }
);

/**
 * todo;
 */
extern("xr_conditions.jup_b221_who_will_start", (_: GameObject, __: GameObject, p: [string]): boolean => {
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

  for (const [index, infoPortion] of infoPortionsList) {
    const factionsList: LuaArray<string> = new LuaTable();

    if (index <= 6) {
      factionsList.set(1, "duty");
      factionsList.set(2, "0");
    } else {
      factionsList.set(1, "freedom");
      factionsList.set(2, "6");
    }

    if (
      hasInfoPortion(infoPortion) &&
      !hasInfoPortion(
        ("jup_b221_" +
          factionsList.get(1) +
          "_main_" +
          tostring(index - tonumber(factionsList.get(2))!) +
          "_played") as TInfoPortion
      )
    ) {
      table.insert(reachableTheme, index);
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
extern("xr_conditions.pas_b400_actor_far_forward", (actor: GameObject, object: GameObject): boolean => {
  const forwardObject: Optional<GameObject> = getObjectByStoryId("pas_b400_fwd");

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

  const squad: Squad = registry.simulator.object(
    registry.simulator.object<ServerCreatureObject>(object.id())!.group_id
  )!;

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
extern("xr_conditions.pas_b400_actor_far_backward", (actor: GameObject, object: GameObject): boolean => {
  const backwardObject: Optional<GameObject> = getObjectByStoryId("pas_b400_bwd");

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

  const sim: AlifeSimulator = registry.simulator;
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
 * Check if actor is far from military squad.
 */
extern("xr_conditions.pri_a28_actor_is_far", (actor: GameObject, object: GameObject): boolean => {
  const squad: Optional<Squad> = getServerObjectByStoryId("pri_a16_military_squad")!;

  if (!squad) {
    abort("Unexpected actor distance check - no squad existing.");
  }

  for (const squadMember of squad.squad_members()) {
    if (squadMember.object.position.distance_to_sqr(actor.position()) < 150 * 150) {
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
    (hasInfoPortion(infoPortions.jup_b16_oasis_found) ||
      hasInfoPortion(infoPortions.zat_b57_bloodsucker_lair_clear) ||
      hasInfoPortion(infoPortions.jup_b6_complete_end) ||
      hasInfoPortion(infoPortions.zat_b215_gave_maps)) &&
    hasInfoPortion(infoPortions.zat_b106_search_soroka)
  );
});

/**
 * Check if flint was removed from Yanov.
 */
extern("xr_conditions.jup_b25_flint_gone_condition", (): boolean => {
  return (
    hasInfoPortion(infoPortions.jup_b25_flint_blame_done_to_duty) ||
    hasInfoPortion(infoPortions.jup_b25_flint_blame_done_to_freedom) ||
    hasInfoPortion(infoPortions.zat_b106_found_soroka_done)
  );
});

/**
 * todo;
 */
extern("xr_conditions.zat_b103_actor_has_needed_food", (actor: GameObject, object: GameObject): boolean => {
  return (
    getExtern<AnyCallablesModule>("dialogs_zaton").zat_b103_actor_has_needed_food(actor, object) ||
    hasInfoPortion(infoPortions.zat_b103_merc_task_done)
  );
});

/**
 * todo;
 */
extern("xr_conditions.zat_b29_rivals_dialog_precond", (actor: GameObject, object: GameObject): boolean => {
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

  for (const [, v] of squadsList) {
    if (
      registry.simulator
        .object(registry.simulator.object<ServerCreatureObject>(object.id())!.group_id)!
        .section_name() === v
    ) {
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
 * Check if b202 actor treasures are not stolen.
 */
extern("xr_conditions.jup_b202_actor_treasure_not_in_steal", (_: GameObject, __: GameObject) => {
  const before: boolean =
    !hasInfoPortion(infoPortions.jup_b52_actor_items_can_be_stolen) &&
    !hasInfoPortion(infoPortions.jup_b202_actor_items_returned);
  const after: boolean =
    hasInfoPortion(infoPortions.jup_b52_actor_items_can_be_stolen) &&
    hasInfoPortion(infoPortions.jup_b202_actor_items_returned);

  return before || after;
});

/**
 * Check if object with story ID exists.
 */
extern("xr_conditions.jup_b47_npc_online", (_: GameObject, __: GameObject, [storyId]: [TStringId]) => {
  const storyObject: Optional<GameObject> = getObjectByStoryId(storyId);

  if (storyObject) {
    return registry.simulator.object(storyObject.id()) !== null;
  } else {
    return false;
  }
});

/**
 * Check if currently late night quest time.
 */
extern("xr_conditions.zat_b7_is_night", (): boolean => {
  return registry.actor !== null && (level.get_time_hours() >= 23 || level.get_time_hours() < 5);
});

/**
 * Check if currently late attack quest time.
 */
extern("xr_conditions.zat_b7_is_late_attack_time", (): boolean => {
  return registry.actor !== null && (level.get_time_hours() >= 23 || level.get_time_hours() < 9);
});

/**
 * Check if jupiter reward box is empty.
 *
 * Throws, if story box was not spawned.
 */
extern("xr_conditions.jup_b202_inventory_box_empty", (_: GameObject, __: GameObject): boolean => {
  return (getObjectByStoryId(storyNames.jup_b202_actor_treasure) as GameObject).is_inv_box_empty();
});

/**
 * Check if actor has b16 zone info portion.
 */
extern("xr_conditions.jup_b16_is_zone_active", (_: GameObject, object: GameObject): boolean => {
  return hasInfoPortion(object.name() as TInfoPortion);
});

/**
 * Check if currently nighttime suitable for the quest.
 */
extern("xr_conditions.is_jup_a12_mercs_time", (): boolean => {
  return registry.actor !== null && level.get_time_hours() >= 1 && level.get_time_hours() < 5;
});
