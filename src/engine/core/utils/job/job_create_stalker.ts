import { level, patrol } from "xray16";

import { registry } from "@/engine/core/database";
import { SurgeManager } from "@/engine/core/managers/world/SurgeManager";
import { SmartTerrain } from "@/engine/core/objects";
import { isInTimeInterval } from "@/engine/core/utils/game";
import { IWaypointData, parseWaypointData } from "@/engine/core/utils/ini";
import { isAccessibleJob, isJobInRestrictor } from "@/engine/core/utils/job/job_check";
import { IJobDescriptor, IJobListDescriptor } from "@/engine/core/utils/job/job_types";
import { communities } from "@/engine/lib/constants/communities";
import {
  AnyObject,
  ClientObject,
  Patrol,
  ServerHumanObject,
  ServerObject,
  TCount,
  TIndex,
  TName,
} from "@/engine/lib/types";

/**
 * todo;
 */
export function createStalkerJobs(smartTerrain: SmartTerrain): LuaMultiReturn<[IJobListDescriptor, string]> {
  const stalkerJobs: IJobListDescriptor = { _precondition_is_monster: false, priority: 60, jobs: new LuaTable() };
  let ltx: string =
    "[meet@generic_lager]\n" +
    "close_distance = {=is_wounded} 0, 2\n" +
    "close_anim = {=is_wounded} nil, {!is_squad_commander} nil, {=actor_has_weapon} threat_na, talk_default\n" +
    "close_snd_hello = {=is_wounded} nil, {!is_squad_commander} nil, {=actor_enemy} nil," +
    " {=actor_has_weapon} meet_hide_weapon, meet_hello\n" +
    "close_snd_bye = {=is_wounded} nil, {!is_squad_commander} nil," +
    " {=actor_enemy} nil, {=actor_has_weapon} nil, meet_hello\n" +
    "close_victim = {=is_wounded} nil, {!is_squad_commander} nil, actor\n" +
    "far_distance = 0\n" +
    "far_anim = nil\n" +
    "far_snd = nil\n" +
    "far_victim = nil\n" +
    "use = {=is_wounded} false, {!is_squad_commander} false, {=actor_enemy} false, {=has_enemy} false," +
    " {=actor_has_weapon} false, {=dist_to_actor_le(3)} true, false\n" +
    "snd_on_use = {=is_wounded} nil, {=actor_enemy} nil, {!is_squad_commander} meet_use_no_talk_leader," +
    " {=actor_has_weapon} meet_use_no_weapon, {=has_enemy} meet_use_no_fight," +
    " {=dist_to_actor_le(3)} meet_use_no_default, nil\n" +
    "meet_dialog = nil\n" +
    "abuse = {=has_enemy} false, true\n" +
    "trade_enable = true\n" +
    "allow_break = true\n" +
    "use_text = nil\n" +
    "[meet@generic_animpoint]\n" +
    "close_distance = 0\n" +
    "close_anim = {!is_squad_commander} nil, nil\n" +
    "close_snd_hello = {!is_squad_commander} nil, nil\n" +
    "close_snd_bye = {!is_squad_commander} nil, nil\n" +
    "close_victim = {!is_squad_commander} nil, nil\n" +
    "far_distance = 0\n" +
    "far_anim = nil\n" +
    "far_snd = nil\n" +
    "far_victim = nil\n" +
    "use = {=is_wounded} false, {!is_squad_commander} false, {=actor_enemy} false, {=has_enemy} false," +
    " {=actor_has_weapon} false, {=dist_to_actor_le(3)} true, false\n" +
    "snd_on_use = {=is_wounded} nil, {=actor_enemy} nil, {!is_squad_commander} meet_use_no_talk_leader," +
    " {=actor_has_weapon} meet_use_no_weapon, {=has_enemy} meet_use_no_fight," +
    " {=dist_to_actor_le(3)} meet_use_no_default, nil\n" +
    "meet_dialog = nil\n" +
    "abuse = {=has_enemy} false, true\n" +
    "trade_enable = true\n" +
    "allow_break = true\n" +
    "meet_on_talking = false\n" +
    "use_text = nil\n";

  // ===================================================================================================================
  // = Point job
  // ===================================================================================================================

  const [stalkerPointJobs, stalkerPointLtx] = createStalkerPointJobs(smartTerrain);

  ltx += stalkerPointLtx;
  table.insert(stalkerJobs.jobs, stalkerPointJobs);

  // ===================================================================================================================
  // = Surge
  // ===================================================================================================================

  const [stalkerSurgeJobs, stalkerSurgeLtx, stalkerSurgeJobsCount] = createStalkerSurgeJobs(smartTerrain);

  if (stalkerSurgeJobsCount > 1) {
    ltx += stalkerSurgeLtx;
    table.insert(stalkerJobs.jobs, stalkerSurgeJobs);
  }

  // ===================================================================================================================
  // = Sleep
  // ===================================================================================================================

  const [stalkerSleepJobs, stalkerSleepLtx, stalkerSleepJobsCount] = createStalkerSleepJobs(smartTerrain);

  if (stalkerSleepJobsCount > 1) {
    ltx += stalkerSleepLtx;
    table.insert(stalkerJobs.jobs, stalkerSleepJobs);
  }

  // ===================================================================================================================
  // = Collector
  // ===================================================================================================================

  const [stalkerCollectorJobs, stalkerCollectorLtx, stalkerCollectorJobsCount] =
    createStalkerCollectorJobs(smartTerrain);

  if (stalkerCollectorJobsCount > 1) {
    ltx += stalkerCollectorLtx;
    table.insert(stalkerJobs.jobs, stalkerCollectorJobs);
  }

  // ===================================================================================================================
  // = Walker
  // ===================================================================================================================

  const [stalkerWalkerJobs, stalkerWalkerLtx, stalkerWalkerJobsCount] = createStalkerWalkerJobs(smartTerrain);

  if (stalkerWalkerJobsCount > 1) {
    ltx += stalkerWalkerLtx;
    table.insert(stalkerJobs.jobs, stalkerWalkerJobs);
  }

  // ===================================================================================================================
  // = Patrol
  // ===================================================================================================================

  const [stalkerPatrolJobs, stalkerPatrolLtx, stalkerPatrolJobsCount] = createStalkerPatrolJobs(smartTerrain);

  if (stalkerPatrolJobsCount > 1) {
    ltx += stalkerPatrolLtx;
    table.insert(stalkerJobs.jobs, stalkerPatrolJobs);
  }

  // ===================================================================================================================
  // = Animpoint
  // ===================================================================================================================

  const [stalkerAnimpointJobs, stalkerAnimpointLtx, stalkerAnimpointCount] = createStalkerAnimpointJobs(
    smartTerrain,
    stalkerJobs as any
  );

  if (stalkerAnimpointCount > 1) {
    ltx += stalkerAnimpointLtx;
    // insert directly into jobs list
  }

  // ===================================================================================================================
  // = Guard
  // ===================================================================================================================

  const [stalkerGuardJobs, stalkerGuardLtx, stalkerGuardJobsCount] = createStalkerGuardJobs(smartTerrain);

  if (stalkerGuardJobsCount > 1) {
    ltx += stalkerGuardLtx;
    table.insert(stalkerJobs.jobs, stalkerGuardJobs);
  }

  // ===================================================================================================================
  // = Sniper
  // ===================================================================================================================

  const [stalkerSniperJobs, stalkerSniperLtx, stalkerSniperJobsCount] = createStalkerSniperJobs(smartTerrain);

  if (stalkerSniperJobsCount > 1) {
    ltx += stalkerSniperLtx;
    table.insert(stalkerJobs.jobs, stalkerSniperJobs);
  }

  // ===================================================================================================================
  // = Camper
  // ===================================================================================================================

  const [stalkerCamperJobs, stalkerCamperLtx, stalkerCamperJobsCount] = createStalkerCamperJobs(smartTerrain);

  if (stalkerCamperJobsCount > 1) {
    ltx += stalkerCamperLtx;
    table.insert(stalkerJobs.jobs, stalkerCamperJobs);
  }

  return $multi(stalkerJobs, ltx);
}

/**
 * todo;
 */
export function createStalkerPointJobs(
  smartTerrain: SmartTerrain
): LuaMultiReturn<[IJobListDescriptor, string, TCount]> {
  const smartTerrainName: TName = smartTerrain.name();
  const stalkerGenericPoint: IJobListDescriptor = { priority: 3, jobs: new LuaTable() };

  let ltx: string = "";

  for (const it of $range(1, 20)) {
    const name = smartTerrainName + "_point_" + it;

    const t = {
      priority: 3,
      job_id: {
        section: "logic@" + name,
        job_type: "point_job",
      },
    };

    table.insert(stalkerGenericPoint.jobs, t);

    let jobLtx: string =
      "[logic@" +
      name +
      "]\n" +
      "active = cover@" +
      name +
      "\n" +
      "[cover@" +
      name +
      "]\n" +
      "meet = meet@generic_lager\n" +
      "smart = " +
      smartTerrainName +
      "\n" +
      "radius_min = 3\n" +
      "radius_max = 8\n" +
      "use_attack_direction = false\n" +
      "anim = {!npc_community(zombied)} sit, guard\n";

    if (smartTerrain.defendRestrictor !== null) {
      jobLtx += "out_restr = " + smartTerrain.defendRestrictor + "\n";
    }

    if (smartTerrain.smartTerrainActorControl !== null && smartTerrain.smartTerrainActorControl.isIgnoreZone !== null) {
      jobLtx +=
        "combat_ignore_cond = {=npc_in_zone(smart.base_on_actor_control.ignore_zone)} true \n" +
        "combat_ignore_keep_when_attacked = true \n";
    }

    ltx += jobLtx;
  }

  return $multi(stalkerGenericPoint, ltx, 20);
}

/**
 * todo;
 */
export function createStalkerSurgeJobs(
  smartTerrain: SmartTerrain
): LuaMultiReturn<[IJobListDescriptor, string, TCount]> {
  const stalkerSurgeJobs: IJobListDescriptor = { priority: 50, jobs: new LuaTable() };
  const smartTerrainName: TName = smartTerrain.name();

  let ltx: string = "";
  let it: TIndex = 1;

  while (level.patrol_path_exists(smartTerrainName + "_surge_" + it + "_walk")) {
    const wayName = smartTerrainName + "_surge_" + it + "_walk";

    table.insert(stalkerSurgeJobs.jobs, {
      priority: 50,
      job_id: {
        section: "logic@" + wayName,
        job_type: "path_job",
      },
      _precondition_params: {},
      _precondition_function: () => SurgeManager.getInstance().isStarted,
    });

    let jobLtx =
      "[logic@" +
      wayName +
      "]\n" +
      "active = walker@" +
      wayName +
      "\n" +
      "[walker@" +
      wayName +
      "]\n" +
      "sound_idle = state\n" +
      "use_camp = true\n" +
      "meet = meet@generic_lager\n" +
      "path_walk = surge_" +
      it +
      "_walk\n" +
      "def_state_standing = guard\n" +
      "def_state_moving = patrol\n";

    if (level.patrol_path_exists(smartTerrainName + "_surge_" + it + "_look")) {
      jobLtx = jobLtx + "path_look = surge_" + it + "_look\n";
    }

    if (smartTerrain.defendRestrictor !== null) {
      jobLtx = jobLtx + "out_restr = " + smartTerrain.defendRestrictor + "\n";
    }

    if (
      smartTerrain.smartTerrainActorControl !== null &&
      smartTerrain.smartTerrainActorControl.isIgnoreZone !== null &&
      isJobInRestrictor(smartTerrain, smartTerrain.smartTerrainActorControl.isIgnoreZone, wayName)
    ) {
      jobLtx =
        jobLtx +
        "combat_ignore_cond = {=npc_in_zone(smart.base_on_actor_control.ignore_zone)} true \n" +
        "combat_ignore_keep_when_attacked = true \n";
    }

    ltx += jobLtx;
    it += 1;
  }

  return $multi(stalkerSurgeJobs, ltx, it);
}

/**
 * todo;
 */
export function createStalkerSleepJobs(
  smartTerrain: SmartTerrain
): LuaMultiReturn<[IJobListDescriptor, string, TCount]> {
  const sleepJobs: IJobListDescriptor = { priority: 10, jobs: new LuaTable() };
  const smartTerrainName: TName = smartTerrain.name();

  let ltx: string = "";
  let it: TIndex = 1;

  // todo: Probably only one job applies by should be more?
  while (level.patrol_path_exists(smartTerrainName + "_sleep_" + it)) {
    const wayName: TName = smartTerrainName + "_sleep_" + it;

    table.insert(sleepJobs.jobs, {
      priority: 10,
      job_id: {
        section: "logic@" + wayName,
        job_type: "path_job",
      },
      _precondition_params: {},
      _precondition_function: (
        serverObject: ServerHumanObject,
        smart: SmartTerrain,
        precondParams: AnyObject
      ): boolean => {
        if (serverObject.community() === communities.zombied) {
          return false;
        }

        if (!isInTimeInterval(21, 7)) {
          return false;
        }

        if (smart.alarmStartedAt === null) {
          return true;
        }

        if (smart.safeRestrictor === null) {
          return true;
        }

        if (precondParams.is_safe_job === null) {
          precondParams.is_safe_job = isJobInRestrictor(smart, smart.safeRestrictor, wayName);
        }

        return precondParams.is_safe_job !== false;
      },
    });

    let jobLtx: string =
      "[logic@" +
      wayName +
      "]\n" +
      "active = sleeper@" +
      wayName +
      "\n" +
      "[sleeper@" +
      wayName +
      "]\n" +
      "path_main = sleep_" +
      it +
      "\n";

    if (smartTerrain.safeRestrictor !== null && isJobInRestrictor(smartTerrain, smartTerrain.safeRestrictor, wayName)) {
      jobLtx += "invulnerable = {=npc_in_zone(smart.safe_restr)} true\n";
    }

    if (smartTerrain.defendRestrictor !== null) {
      jobLtx += "out_restr = " + smartTerrain.defendRestrictor + "\n";
    }

    if (
      smartTerrain.smartTerrainActorControl !== null &&
      smartTerrain.smartTerrainActorControl.isIgnoreZone !== null &&
      isJobInRestrictor(smartTerrain, smartTerrain.smartTerrainActorControl.isIgnoreZone, wayName)
    ) {
      jobLtx +=
        "combat_ignore_cond = {=npc_in_zone(smart.base_on_actor_control.ignore_zone)} true \n" +
        "combat_ignore_keep_when_attacked = true \n";
    }

    ltx += jobLtx;
    it += 1;
  }

  return $multi(sleepJobs, ltx, it);
}

/**
 * todo;
 */
export function createStalkerCollectorJobs(
  smartTerrain: SmartTerrain
): LuaMultiReturn<[IJobListDescriptor, string, TCount]> {
  const collectorJobs: IJobListDescriptor = { priority: 25, jobs: new LuaTable() };
  const smartTerrainName: TName = smartTerrain.name();

  let index: TIndex = 1;
  let ltx: string = "";

  // todo: While and single insert?
  while (level.patrol_path_exists(smartTerrainName + "_collector_" + index + "_walk")) {
    const wayName: TName = smartTerrainName + "_collector_" + index + "_walk";

    table.insert(collectorJobs.jobs, {
      priority: 25,
      job_id: {
        section: "logic@" + wayName,
        job_type: "path_job",
      },
      _precondition_params: {},
      _precondition_function: (
        serverObject: ServerHumanObject,
        smart: SmartTerrain,
        precondParams: AnyObject
      ): boolean => {
        if (serverObject.community() === communities.zombied) {
          return false;
        }

        const st = registry.objects.get(serverObject.id);

        if (st === null) {
          return false;
        }

        const npc: ClientObject = st.object!;

        if (npc === null) {
          return false;
        }

        const detectors = ["detector_simple", "detector_advanced", "detector_elite", "detector_scientific"];

        for (const [k, v] of detectors) {
          const obj = npc.object(v);

          if (obj !== null) {
            return true;
          }
        }

        return false;
      },
    });

    let jobLtx =
      "[logic@" +
      wayName +
      "]\n" +
      "active = walker@" +
      wayName +
      "\n" +
      "[walker@" +
      wayName +
      "]\n" +
      "sound_idle = state\n" +
      "meet = meet@generic_lager\n" +
      "path_walk = collector_" +
      index +
      "_walk\n" +
      "def_state_standing = guard\n" +
      "def_state_moving = patrol\n";

    if (level.patrol_path_exists(smartTerrainName + "_collector_" + index + "_look")) {
      jobLtx += "path_look = collector_" + index + "_look\n";
    }

    if (smartTerrain.safeRestrictor !== null && isJobInRestrictor(smartTerrain, smartTerrain.safeRestrictor, wayName)) {
      jobLtx += "invulnerable = {=npc_in_zone(smart.safe_restr)} true\n";
    }

    if (smartTerrain.defendRestrictor !== null) {
      jobLtx += "out_restr = " + smartTerrain.defendRestrictor + "\n";
    }

    if (
      smartTerrain.smartTerrainActorControl !== null &&
      smartTerrain.smartTerrainActorControl.isIgnoreZone !== null &&
      isJobInRestrictor(smartTerrain, smartTerrain.smartTerrainActorControl.isIgnoreZone, wayName)
    ) {
      jobLtx +=
        "combat_ignore_cond = {=npc_in_zone(smart.base_on_actor_control.ignore_zone)} true \n" +
        "combat_ignore_keep_when_attacked = true \n";
    }

    ltx += jobLtx;
    index += 1;
  }

  return $multi(collectorJobs, ltx, index);
}

/**
 * todo;
 */
export function createStalkerWalkerJobs(
  smartTerrain: SmartTerrain
): LuaMultiReturn<[IJobListDescriptor, string, TCount]> {
  const smartTerrainName: TName = smartTerrain.name();
  const stalkerWalker: IJobListDescriptor = { priority: 15, jobs: new LuaTable() };

  let index: TIndex = 1;
  let ltx: string = "";

  while (level.patrol_path_exists(smartTerrainName + "_walker_" + index + "_walk")) {
    const wayName: TName = smartTerrainName + "_walker_" + index + "_walk";

    table.insert(stalkerWalker.jobs, {
      priority: 15,
      job_id: {
        section: "logic@" + wayName,
        job_type: "path_job",
      },
      _precondition_params: {},
      _precondition_function: (serverObject: ServerObject, smart: SmartTerrain, precondParams: AnyObject): boolean => {
        if (smart.alarmStartedAt === null) {
          return true;
        }

        if (smart.safeRestrictor === null) {
          return true;
        }

        if (precondParams.is_safe_job === null) {
          precondParams.is_safe_job = isJobInRestrictor(smart, smart.safeRestrictor, wayName);
        }

        return precondParams.is_safe_job !== false;
      },
    });

    let jobLtx: string =
      "[logic@" +
      wayName +
      "]\n" +
      "active = walker@" +
      wayName +
      "\n" +
      "[walker@" +
      wayName +
      "]\n" +
      "sound_idle = state\n" +
      "meet = meet@generic_lager\n" +
      "path_walk = walker_" +
      index +
      "_walk\n" +
      "def_state_standing = guard\n" +
      "def_state_moving = patrol\n";

    if (level.patrol_path_exists(smartTerrainName + "_walker_" + index + "_look")) {
      jobLtx += "path_look = walker_" + index + "_look\n";
    }

    if (smartTerrain.safeRestrictor !== null && isJobInRestrictor(smartTerrain, smartTerrain.safeRestrictor, wayName)) {
      jobLtx += "invulnerable = {=npc_in_zone(smart.safe_restr)} true\n";
    }

    if (smartTerrain.defendRestrictor !== null) {
      jobLtx += "out_restr = " + smartTerrain.defendRestrictor + "\n";
    }

    if (
      smartTerrain.smartTerrainActorControl !== null &&
      smartTerrain.smartTerrainActorControl.isIgnoreZone !== null &&
      isJobInRestrictor(smartTerrain, smartTerrain.smartTerrainActorControl.isIgnoreZone, wayName)
    ) {
      jobLtx +=
        "combat_ignore_cond = {=npc_in_zone(smart.base_on_actor_control.ignore_zone)} true \n" +
        "combat_ignore_keep_when_attacked = true \n";
    }

    ltx += jobLtx;
    index += 1;
  }

  return $multi(stalkerWalker, ltx, index);
}

/**
 * todo;
 */
export function createStalkerPatrolJobs(
  smartTerrain: SmartTerrain
): LuaMultiReturn<[IJobListDescriptor, string, TCount]> {
  const stalkerPatrolJobs: IJobListDescriptor = { priority: 20, jobs: new LuaTable() };
  const smartTerrainName: TName = smartTerrain.name();

  let ltx: string = "";
  let index: TIndex = 1;

  while (level.patrol_path_exists(smartTerrainName + "_patrol_" + index + "_walk")) {
    const wayName = smartTerrainName + "_patrol_" + index + "_walk";
    const ptr = new patrol(wayName);
    const wpProp = parseWaypointData(wayName, ptr.flags(0), ptr.name(0));
    let jobCount = 3;

    if (wpProp.count !== null) {
      jobCount = wpProp.count as number;
    }

    for (const i of $range(1, jobCount)) {
      table.insert(stalkerPatrolJobs.jobs, {
        priority: 20,
        job_id: {
          section: "logic@" + wayName,
          job_type: "path_job",
        },
        _precondition_params: {},
        _precondition_function: (
          serverObject: ServerHumanObject,
          smart: SmartTerrain,
          precondParams: AnyObject
        ): boolean => {
          if (serverObject.community() === communities.zombied) {
            return false;
          }

          if (smart.alarmStartedAt === null) {
            return true;
          }

          if (smart.safeRestrictor === null) {
            return true;
          }

          if (precondParams.is_safe_job === null) {
            precondParams.is_safe_job = isJobInRestrictor(smart, smart.safeRestrictor, wayName);
          }

          return precondParams.is_safe_job !== false;
        },
      });
    }

    let jobLtx =
      "[logic@" +
      wayName +
      "]\n" +
      "active = patrol@" +
      wayName +
      "\n" +
      "[patrol@" +
      wayName +
      "]\n" +
      "meet = meet@generic_lager\n" +
      "formation = back\n" +
      "path_walk = patrol_" +
      index +
      "_walk\n" +
      "on_signal = }| %=search_gulag_job%\n";

    if (level.patrol_path_exists(smartTerrainName + "_patrol_" + index + "_look")) {
      jobLtx += "path_look = patrol_" + index + "_look\n";
    }

    if (smartTerrain.safeRestrictor !== null && isJobInRestrictor(smartTerrain, smartTerrain.safeRestrictor, wayName)) {
      jobLtx += "invulnerable = {=npc_in_zone(smart.safe_restr)} true\n";
    }

    if (smartTerrain.defendRestrictor !== null) {
      jobLtx += "out_restr = " + smartTerrain.defendRestrictor + "\n";
    }

    ltx += jobLtx;
    index += 1;
  }

  return $multi(stalkerPatrolJobs, ltx, index);
}

/**
 * todo;
 */
export function createStalkerAnimpointJobs(
  smartTerrain: SmartTerrain,
  stalkerJobs: IJobListDescriptor
): LuaMultiReturn<[IJobListDescriptor, string, TCount]> {
  const smartTerrainName: TName = smartTerrain.name();

  let ltx: string = "";
  let index: TIndex = 1;

  while (registry.smartCovers.get(smartTerrainName + "_animpoint_" + index) !== null) {
    const smartcoverName: TName = smartTerrainName + "_animpoint_" + index;

    const t: IJobDescriptor = {
      priority: 15,
      job_id: {
        section: "logic@" + smartcoverName,
        job_type: "smartcover_job",
      },
      _precondition_params: {},
      _precondition_function: (
        serverObject: ServerHumanObject,
        smartTerrain: SmartTerrain,
        precondParams: AnyObject
      ): boolean => {
        return serverObject.community() !== communities.zombied;
      },
    };

    table.insert(stalkerJobs.jobs, t);

    let jobLtx: string =
      "[logic@" +
      smartcoverName +
      "]\n" +
      "active = animpoint@" +
      smartcoverName +
      "\n" +
      "[animpoint@" +
      smartcoverName +
      "]\n" +
      "meet = meet@generic_animpoint\n" +
      "cover_name = " +
      smartcoverName +
      "\n";

    if (smartTerrain.defendRestrictor !== null) {
      jobLtx += "out_restr = " + smartTerrain.defendRestrictor + "\n";
    }

    // todo: Bad path name?
    if (
      smartTerrain.safeRestrictor !== null &&
      isJobInRestrictor(smartTerrain, smartTerrain.safeRestrictor, null as any)
    ) {
      jobLtx += "invulnerable = {=npc_in_zone(smart.safe_restr)} true\n";
    }

    if (smartTerrain.smartTerrainActorControl !== null && smartTerrain.smartTerrainActorControl.isIgnoreZone !== null) {
      jobLtx +=
        "combat_ignore_cond = {=npc_in_zone(smart.base_on_actor_control.ignore_zone)} true \n" +
        "combat_ignore_keep_when_attacked = true \n";
    }

    ltx += jobLtx;
    index += 1;
  }

  return $multi(stalkerJobs, ltx, index);
}

/**
 * todo;
 */
export function createStalkerGuardJobs(smartTerrain: SmartTerrain): LuaMultiReturn<[any, string, TCount]> {
  const stalkerGuard = { priority: 25, jobs: new LuaTable() };
  const smartTerrainName: TName = smartTerrain.name();

  let ltx: string = "";
  let index: TIndex = 1;

  while (level.patrol_path_exists(smartTerrainName + "_guard_" + index + "_walk")) {
    const wayName: TName = smartTerrainName + "_guard_" + index + "_walk";

    table.insert(stalkerGuard.jobs, {
      priority: 25,
      job_id: {
        section: "logic@" + wayName,
        job_type: "path_job",
      },
      _precondition_params: {},
      _precondition_function: (
        serverObject: ServerHumanObject,
        smart: SmartTerrain,
        precondParams: AnyObject
      ): boolean => {
        if (smart.alarmStartedAt === null) {
          return true;
        }

        if (smart.safeRestrictor === null) {
          return true;
        }

        if (precondParams.is_safe_job === null) {
          precondParams.is_safe_job = isJobInRestrictor(smart, smart.safeRestrictor, wayName);
        }

        return precondParams.is_safe_job !== false;
      },
    });

    let jobLtx =
      "[logic@" +
      wayName +
      "]\n" +
      "active = walker@" +
      wayName +
      "\n" +
      "[walker@" +
      wayName +
      "]\n" +
      "meet = meet@generic_lager\n" +
      "path_walk = guard_" +
      index +
      "_walk\n" +
      "path_look = guard_" +
      index +
      "_look\n";

    if (smartTerrain.safeRestrictor !== null && isJobInRestrictor(smartTerrain, smartTerrain.safeRestrictor, wayName)) {
      jobLtx += "invulnerable = {=npc_in_zone(smart.safe_restr)} true\n";
    }

    if (smartTerrain.defendRestrictor !== null) {
      jobLtx += "out_restr = " + smartTerrain.defendRestrictor + "\n";
    }

    let job1Ltx: string =
      "[walker1@" +
      wayName +
      "]\n" +
      "meet = meet@generic_lager\n" +
      "path_walk = guard_" +
      index +
      "_walk\n" +
      "path_look = guard_" +
      index +
      "_look\n" +
      "def_state_standing = wait_na\n" +
      "on_info = {!is_obj_on_job(logic@follower_" +
      wayName +
      ":3)} walker@" +
      wayName +
      "\n" +
      "on_info2 = {=distance_to_obj_on_job_le(logic@follower_" +
      wayName +
      ":3)} remark@" +
      wayName +
      "\n";

    if (smartTerrain.safeRestrictor !== null && isJobInRestrictor(smartTerrain, smartTerrain.safeRestrictor, wayName)) {
      job1Ltx += "invulnerable = {=npc_in_zone(smart.safe_restr)} true\n";
    }

    if (smartTerrain.defendRestrictor !== null) {
      job1Ltx += "out_restr = " + smartTerrain.defendRestrictor + "\n";
    }

    job1Ltx += "[remark@" + wayName + "]\n" + "anim = wait_na\n" + "target = logic@follower_" + wayName + "\n";

    if (smartTerrain.defendRestrictor !== null) {
      job1Ltx += "out_restr = " + smartTerrain.defendRestrictor + "\n";
    }

    table.insert(stalkerGuard.jobs, {
      priority: 24,
      job_id: {
        section: "logic@follower_" + wayName,
        job_type: "path_job",
      },
      _precondition_params: { changing_job: "logic@" + wayName },
      _precondition_function: (
        serverObject: ServerHumanObject,
        smartTerrain: SmartTerrain,
        precondParams: AnyObject,
        npcInfo: AnyObject
      ): boolean => {
        return npcInfo.need_job === precondParams.changing_job;
      },
    });

    let followerLtx: string =
      "[logic@follower_" +
      wayName +
      "]\n" +
      "active = walker@follow_" +
      wayName +
      "\n" +
      "[walker@follow_" +
      wayName +
      "]\n" +
      "meet = meet@generic_lager\n" +
      "path_walk = guard_" +
      index +
      "_walk\n" +
      "path_look = guard_" +
      index +
      "_look\n" +
      "on_info = {=distance_to_obj_on_job_le(logic@" +
      wayName +
      ":3)} remark@follower_" +
      wayName +
      "\n";

    if (smartTerrain.defendRestrictor !== null) {
      followerLtx += "out_restr = " + smartTerrain.defendRestrictor + "\n";
    }

    followerLtx +=
      "[remark@follower_" +
      wayName +
      "]\n" +
      "anim = wait_na\n" +
      "target = logic@" +
      wayName +
      "\n" +
      "on_timer = 2000 | %=switch_to_desired_job%\n";

    if (smartTerrain.defendRestrictor !== null) {
      followerLtx += "out_restr = " + smartTerrain.defendRestrictor + "\n";
    }

    ltx += jobLtx + job1Ltx + followerLtx;
    index += 1;
  }

  return $multi(stalkerGuard, ltx, index);
}

/**
 * todo;
 */
export function createStalkerSniperJobs(
  smartTerrain: SmartTerrain
): LuaMultiReturn<[IJobListDescriptor, string, TCount]> {
  const stalkerDefSniper: IJobListDescriptor = { priority: 30, jobs: new LuaTable() };
  const smartTerrainName: TName = smartTerrain.name();

  let ltx: string = "";
  let index: TIndex = 1;

  while (level.patrol_path_exists(smartTerrainName + "_sniper_" + index + "_walk")) {
    const wayName: TName = smartTerrainName + "_sniper_" + index + "_walk";
    const ptr: Patrol = new patrol(wayName);
    const wpProp: IWaypointData = parseWaypointData(wayName, ptr.flags(0), ptr.name(0));
    let state = "hide";

    if (wpProp.state !== null) {
      if (wpProp.state === "stand") {
        state = "threat";
      }
    }

    table.insert(stalkerDefSniper.jobs, {
      priority: 30,
      job_id: {
        section: "logic@" + wayName,
        job_type: "path_job",
      },
      _precondition_params: { way_name: wayName },
      _precondition_function: (
        serverObject: ServerHumanObject,
        smart: SmartTerrain,
        precondParams: AnyObject
      ): boolean => {
        if (serverObject.community() === communities.zombied) {
          return false;
        }

        return isAccessibleJob(serverObject, precondParams.way_name);
      },
    });

    let jobLtx: string =
      "[logic@" +
      wayName +
      "]\n" +
      "active = camper@" +
      wayName +
      "\n" +
      "[camper@" +
      wayName +
      "]\n" +
      "meet = meet@generic_lager\n" +
      "path_walk = sniper_" +
      index +
      "_walk\n" +
      "path_look = sniper_" +
      index +
      "_look\n" +
      "sniper = true\n" +
      "def_state_campering =" +
      state +
      "\n" +
      "def_state_campering_fire =" +
      state +
      "_fire\n";

    if (smartTerrain.defendRestrictor !== null) {
      jobLtx += "out_restr = " + smartTerrain.defendRestrictor + ",\n";
    }

    ltx += jobLtx;
    index += 1;
  }

  return $multi(stalkerDefSniper, ltx, index);
}

/**
 * todo;
 */
export function createStalkerCamperJobs(
  smartTerrain: SmartTerrain
): LuaMultiReturn<[IJobListDescriptor, string, TCount]> {
  const stalkerDefCamper: IJobListDescriptor = { priority: 45, jobs: new LuaTable() };
  const smartTerrainName: TName = smartTerrain.name();

  let ltx: string = "";
  let index: TIndex = 1;

  while (level.patrol_path_exists(smartTerrainName + "_camper_" + index + "_walk")) {
    const wayName: TName = smartTerrainName + "_camper_" + index + "_walk";
    const ptr: Patrol = new patrol(wayName);
    const wpProp: IWaypointData = parseWaypointData(wayName, ptr.flags(0), ptr.name(0));
    let state = "hide";
    let radius = 0;

    if (wpProp.state !== null) {
      if (wpProp.state === "stand") {
        state = "threat";
      }
    }

    if (wpProp.radius !== null) {
      radius = wpProp.radius as number;
    }

    table.insert(stalkerDefCamper.jobs, {
      priority: 45,
      job_id: {
        section: "logic@" + wayName,
        job_type: "path_job",
      },
      _precondition_params: { way_name: wayName },
      _precondition_function: (serverObject: ServerHumanObject, smart: SmartTerrain, precond_params: AnyObject) => {
        return isAccessibleJob(serverObject, precond_params.way_name);
      },
    });

    let jobLtx: string =
      "[logic@" +
      wayName +
      "]\n" +
      "active = camper@" +
      wayName +
      "\n" +
      "[camper@" +
      wayName +
      "]\n" +
      "meet = meet@generic_lager\n" +
      "radius = " +
      tostring(radius) +
      "\n" +
      "path_walk = camper_" +
      index +
      "_walk\n" +
      "def_state_moving = rush\n" +
      "def_state_campering =" +
      state +
      "\n" +
      "def_state_campering_fire =" +
      state +
      "_fire\n";

    if (level.patrol_path_exists(smartTerrainName + "_camper_" + index + "_look")) {
      jobLtx += "path_look = camper_" + index + "_look\n";
    }

    if (smartTerrain.defendRestrictor !== null) {
      jobLtx += "out_restr = " + smartTerrain.defendRestrictor + ",\n";
    }

    ltx += jobLtx;
    index += 1;
  }

  return $multi(stalkerDefCamper, ltx, index);
}
