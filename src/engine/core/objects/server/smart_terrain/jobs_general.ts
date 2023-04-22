import {
  alife,
  getFS,
  ini_file,
  level,
  patrol,
  XR_alife_simulator,
  XR_cse_alife_creature_abstract,
  XR_cse_alife_human_abstract,
  XR_cse_alife_object,
  XR_game_object,
  XR_ini_file,
  XR_patrol,
} from "xray16";

import { IRegistryObjectState, registry } from "@/engine/core/database";
import { SurgeManager } from "@/engine/core/managers/world/SurgeManager";
import type { SmartTerrain } from "@/engine/core/objects/server/smart_terrain/SmartTerrain";
import { IJobDescriptor, IObjectJobDescriptor, TJobDescriptor } from "@/engine/core/objects/server/smart_terrain/types";
import { initializeObjectSchemeLogic } from "@/engine/core/schemes/base/utils/initializeObjectSchemeLogic";
import { pickSectionFromCondList } from "@/engine/core/utils/ini/config";
import { getSchemeByIniSection, readIniBoolean, readIniNumber, readIniString } from "@/engine/core/utils/ini/getters";
import { LuaLogger } from "@/engine/core/utils/logging";
import { parseConditionsList, parseWaypointData, TConditionList } from "@/engine/core/utils/parse";
import { isInTimeInterval } from "@/engine/core/utils/time";
import { communities } from "@/engine/lib/constants/communities";
import { MAX_U16 } from "@/engine/lib/constants/memory";
import { roots } from "@/engine/lib/constants/roots";
import { SMART_TERRAIN_SECTION } from "@/engine/lib/constants/sections";
import { FALSE } from "@/engine/lib/constants/words";
import {
  AnyCallable,
  AnyObject,
  EJobType,
  EScheme,
  ESchemeType,
  JobTypeByScheme,
  LuaArray,
  Optional,
  TCount,
  TName,
  TNumberId,
  TPath,
  TRate,
  TSection,
} from "@/engine/lib/types";

const logger: LuaLogger = new LuaLogger($filename);

/**
 * todo;
 * todo;
 * todo;
 */
export function loadGulagJobs(smartTerrain: SmartTerrain): LuaMultiReturn<[LuaArray<TJobDescriptor>, string]> {
  const smartTerrainName: TName = smartTerrain.name();
  const jobsList: LuaArray<TJobDescriptor> = new LuaTable();

  let t: AnyObject;

  logger.info("Load job for smart:", smartTerrainName);

  let ltx =
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

  const stalker_jobs = { _precondition_is_monster: false, priority: 60, jobs: [] };
  const stalker_generic_point = { priority: 3, jobs: [] };

  logger.info("Generic point jobs load:", smartTerrainName);

  for (const it of $range(1, 20)) {
    const name = smartTerrainName + "_point_" + it;

    const t = {
      priority: 3,
      job_id: {
        section: "logic@" + name,
        job_type: "point_job",
      },
    };

    table.insert(stalker_generic_point.jobs, t);

    let job_ltx: string =
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
      job_ltx = job_ltx + "out_restr = " + smartTerrain.defendRestrictor + "\n";
    }

    if (smartTerrain.smartTerrainActorControl !== null && smartTerrain.smartTerrainActorControl.isIgnoreZone !== null) {
      job_ltx =
        job_ltx +
        "combat_ignore_cond = {=npc_in_zone(smart.base_on_actor_control.ignore_zone)} true \n" +
        "combat_ignore_keep_when_attacked = true \n";
    }

    ltx = ltx + job_ltx;
  }

  table.insert(stalker_jobs.jobs, stalker_generic_point);

  // ===================================================================================================================
  // = Surge
  // ===================================================================================================================

  logger.info("Surge jobs load:", smartTerrainName);

  const stalker_surge = { priority: 50, jobs: [] as Array<AnyObject> };
  let it = 1;

  while (level.patrol_path_exists(smartTerrainName + "_surge_" + it + "_walk")) {
    const wayName = smartTerrainName + "_surge_" + it + "_walk";

    table.insert(stalker_surge.jobs, {
      priority: 50,
      job_id: {
        section: "logic@" + wayName,
        job_type: "path_job",
      },
      _precondition_params: {},
      _precondition_function: () => SurgeManager.getInstance().isStarted,
    });

    let job_ltx =
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
      job_ltx = job_ltx + "path_look = surge_" + it + "_look\n";
    }

    if (smartTerrain.defendRestrictor !== null) {
      job_ltx = job_ltx + "out_restr = " + smartTerrain.defendRestrictor + "\n";
    }

    if (
      smartTerrain.smartTerrainActorControl !== null &&
      smartTerrain.smartTerrainActorControl.isIgnoreZone !== null &&
      isJobInRestrictor(smartTerrain, smartTerrain.smartTerrainActorControl.isIgnoreZone, wayName)
    ) {
      job_ltx =
        job_ltx +
        "combat_ignore_cond = {=npc_in_zone(smart.base_on_actor_control.ignore_zone)} true \n" +
        "combat_ignore_keep_when_attacked = true \n";
    }

    ltx = ltx + job_ltx;
    it = it + 1;
  }

  if (it > 1) {
    table.insert(stalker_jobs.jobs, stalker_surge);
  }

  // ===================================================================================================================
  // = Sleep
  // ===================================================================================================================

  logger.info("Sleep jobs load:", smartTerrainName);

  const stalker_sleep = { priority: 10, jobs: new LuaTable() };

  it = 1;

  // todo: Probably only one job applies by should be more?
  while (level.patrol_path_exists(smartTerrainName + "_sleep_" + it)) {
    const way_name = smartTerrainName + "_sleep_" + it;

    t = {
      priority: 10,
      job_id: {
        section: "logic@" + way_name,
        job_type: "path_job",
      },
      _precondition_params: {},
      _precondition_function: (
        se_obj: XR_cse_alife_human_abstract,
        smart: SmartTerrain,
        precond_params: AnyObject
      ): boolean => {
        if (se_obj.community() === communities.zombied) {
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

        if (precond_params.is_safe_job === null) {
          precond_params.is_safe_job = isJobInRestrictor(smart, smart.safeRestrictor, way_name);
        }

        return precond_params.is_safe_job !== false;
      },
    };

    table.insert(stalker_sleep.jobs, t);

    let job_ltx =
      "[logic@" +
      way_name +
      "]\n" +
      "active = sleeper@" +
      way_name +
      "\n" +
      "[sleeper@" +
      way_name +
      "]\n" +
      "path_main = sleep_" +
      it +
      "\n";

    if (
      smartTerrain.safeRestrictor !== null &&
      isJobInRestrictor(smartTerrain, smartTerrain.safeRestrictor, way_name)
    ) {
      job_ltx = job_ltx + "invulnerable = {=npc_in_zone(smart.safe_restr)} true\n";
    }

    if (smartTerrain.defendRestrictor !== null) {
      job_ltx = job_ltx + "out_restr = " + smartTerrain.defendRestrictor + "\n";
    }

    if (
      smartTerrain.smartTerrainActorControl !== null &&
      smartTerrain.smartTerrainActorControl.isIgnoreZone !== null &&
      isJobInRestrictor(smartTerrain, smartTerrain.smartTerrainActorControl.isIgnoreZone, way_name)
    ) {
      job_ltx =
        job_ltx +
        "combat_ignore_cond = {=npc_in_zone(smart.base_on_actor_control.ignore_zone)} true \n" +
        "combat_ignore_keep_when_attacked = true \n";
    }

    ltx = ltx + job_ltx;
    it = it + 1;
  }

  if (it > 1) {
    table.insert(stalker_jobs.jobs, stalker_sleep);
  }

  // ===================================================================================================================
  // = Collector
  // ===================================================================================================================

  logger.info("Collector jobs load:", smartTerrainName);

  const stalker_collector = { priority: 25, jobs: [] as Array<AnyObject> };

  it = 1;

  // todo: While and single insert?
  while (level.patrol_path_exists(smartTerrainName + "_collector_" + it + "_walk")) {
    const way_name = smartTerrainName + "_collector_" + it + "_walk";

    t = {
      priority: 25,
      job_id: {
        section: "logic@" + way_name,
        job_type: "path_job",
      },
      _precondition_params: {},
      _precondition_function: (
        se_obj: XR_cse_alife_human_abstract,
        smart: SmartTerrain,
        precond_params: AnyObject
      ): boolean => {
        if (se_obj.community() === communities.zombied) {
          return false;
        }

        const st = registry.objects.get(se_obj.id);

        if (st === null) {
          return false;
        }

        const npc = st.object!;

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
    };

    table.insert(stalker_collector.jobs, t);

    let job_ltx =
      "[logic@" +
      way_name +
      "]\n" +
      "active = walker@" +
      way_name +
      "\n" +
      "[walker@" +
      way_name +
      "]\n" +
      "sound_idle = state\n" +
      "meet = meet@generic_lager\n" +
      "path_walk = collector_" +
      it +
      "_walk\n" +
      "def_state_standing = guard\n" +
      "def_state_moving = patrol\n";

    if (level.patrol_path_exists(smartTerrainName + "_collector_" + it + "_look")) {
      job_ltx = job_ltx + "path_look = collector_" + it + "_look\n";
    }

    if (
      smartTerrain.safeRestrictor !== null &&
      isJobInRestrictor(smartTerrain, smartTerrain.safeRestrictor, way_name)
    ) {
      job_ltx = job_ltx + "invulnerable = {=npc_in_zone(smart.safe_restr)} true\n";
    }

    if (smartTerrain.defendRestrictor !== null) {
      job_ltx = job_ltx + "out_restr = " + smartTerrain.defendRestrictor + "\n";
    }

    if (
      smartTerrain.smartTerrainActorControl !== null &&
      smartTerrain.smartTerrainActorControl.isIgnoreZone !== null &&
      isJobInRestrictor(smartTerrain, smartTerrain.smartTerrainActorControl.isIgnoreZone, way_name)
    ) {
      job_ltx =
        job_ltx +
        "combat_ignore_cond = {=npc_in_zone(smart.base_on_actor_control.ignore_zone)} true \n" +
        "combat_ignore_keep_when_attacked = true \n";
    }

    ltx = ltx + job_ltx;
    it = it + 1;
  }

  if (it > 1) {
    table.insert(stalker_jobs.jobs, stalker_collector);
  }

  // ===================================================================================================================
  // = Walker
  // ===================================================================================================================

  logger.info("Walker jobs load:", smartTerrainName);

  const stalker_walker = { priority: 15, jobs: new LuaTable() };

  it = 1;

  while (level.patrol_path_exists(smartTerrainName + "_walker_" + it + "_walk")) {
    // -- ���������� �������� ���������� ����� �� �������� ����� ����.
    const way_name = smartTerrainName + "_walker_" + it + "_walk";

    // -- ��������� ���������
    t = {
      priority: 15,
      job_id: {
        section: "logic@" + way_name,
        job_type: "path_job",
      },
      _precondition_params: {},
      _precondition_function: (
        se_obj: XR_cse_alife_object,
        smart: SmartTerrain,
        precond_params: AnyObject
      ): boolean => {
        if (smart.alarmStartedAt === null) {
          return true;
        }

        if (smart.safeRestrictor === null) {
          return true;
        }

        if (precond_params.is_safe_job === null) {
          precond_params.is_safe_job = isJobInRestrictor(smart, smart.safeRestrictor, way_name);
        }

        return precond_params.is_safe_job !== false;
      },
    };
    table.insert(stalker_walker.jobs, t);

    let job_ltx =
      "[logic@" +
      way_name +
      "]\n" +
      "active = walker@" +
      way_name +
      "\n" +
      "[walker@" +
      way_name +
      "]\n" +
      "sound_idle = state\n" +
      "meet = meet@generic_lager\n" +
      "path_walk = walker_" +
      it +
      "_walk\n" +
      "def_state_standing = guard\n" +
      "def_state_moving = patrol\n";

    if (level.patrol_path_exists(smartTerrainName + "_walker_" + it + "_look")) {
      job_ltx = job_ltx + "path_look = walker_" + it + "_look\n";
    }

    if (
      smartTerrain.safeRestrictor !== null &&
      isJobInRestrictor(smartTerrain, smartTerrain.safeRestrictor, way_name)
    ) {
      job_ltx = job_ltx + "invulnerable = {=npc_in_zone(smart.safe_restr)} true\n";
    }

    if (smartTerrain.defendRestrictor !== null) {
      job_ltx = job_ltx + "out_restr = " + smartTerrain.defendRestrictor + "\n";
    }

    if (
      smartTerrain.smartTerrainActorControl !== null &&
      smartTerrain.smartTerrainActorControl.isIgnoreZone !== null &&
      isJobInRestrictor(smartTerrain, smartTerrain.smartTerrainActorControl.isIgnoreZone, way_name)
    ) {
      job_ltx =
        job_ltx +
        "combat_ignore_cond = {=npc_in_zone(smart.base_on_actor_control.ignore_zone)} true \n" +
        "combat_ignore_keep_when_attacked = true \n";
    }

    ltx = ltx + job_ltx;
    it = it + 1;
  }

  if (it > 1) {
    table.insert(stalker_jobs.jobs, stalker_walker);
  }

  // ===================================================================================================================
  // = Patrol
  // ===================================================================================================================
  logger.info("Patrol jobs load:", smartTerrainName);

  const stalker_patrol = { priority: 20, jobs: new LuaTable() };

  it = 1;
  while (level.patrol_path_exists(smartTerrainName + "_patrol_" + it + "_walk")) {
    const way_name = smartTerrainName + "_patrol_" + it + "_walk";
    const ptr = new patrol(way_name);
    const wp_prop = parseWaypointData(way_name, ptr.flags(0), ptr.name(0));
    let job_count = 3;

    if (wp_prop.count !== null) {
      job_count = wp_prop.count as number;
    }

    for (const i of $range(1, job_count)) {
      // -- ��������� ���������
      t = {
        priority: 20,
        job_id: {
          section: "logic@" + way_name,
          job_type: "path_job",
        },
        _precondition_params: {},
        _precondition_function: (
          serverObject: XR_cse_alife_human_abstract,
          smart: SmartTerrain,
          precond_params: AnyObject
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

          if (precond_params.is_safe_job === null) {
            precond_params.is_safe_job = isJobInRestrictor(smart, smart.safeRestrictor, way_name);
          }

          return precond_params.is_safe_job !== false;
        },
      };
      table.insert(stalker_patrol.jobs, t);
    }

    let job_ltx =
      "[logic@" +
      way_name +
      "]\n" +
      "active = patrol@" +
      way_name +
      "\n" +
      "[patrol@" +
      way_name +
      "]\n" +
      "meet = meet@generic_lager\n" +
      "formation = back\n" +
      "path_walk = patrol_" +
      it +
      "_walk\n" +
      "on_signal = }| %=search_gulag_job%\n";

    if (level.patrol_path_exists(smartTerrainName + "_patrol_" + it + "_look")) {
      job_ltx = job_ltx + "path_look = patrol_" + it + "_look\n";
    }

    if (
      smartTerrain.safeRestrictor !== null &&
      isJobInRestrictor(smartTerrain, smartTerrain.safeRestrictor, way_name)
    ) {
      job_ltx = job_ltx + "invulnerable = {=npc_in_zone(smart.safe_restr)} true\n";
    }

    if (smartTerrain.defendRestrictor !== null) {
      job_ltx = job_ltx + "out_restr = " + smartTerrain.defendRestrictor + "\n";
    }

    ltx = ltx + job_ltx;
    it = it + 1;
  }

  if (it > 1) {
    table.insert(stalker_jobs.jobs, stalker_patrol);
  }

  // ===================================================================================================================
  // = Animpoint
  // ===================================================================================================================
  logger.info("Animpoint jobs load:", smartTerrainName);
  it = 1;

  while (registry.smartCovers.get(smartTerrainName + "_animpoint_" + it) !== null) {
    const smartcover_name = smartTerrainName + "_animpoint_" + it;

    t = {
      priority: 15,
      job_id: {
        section: "logic@" + smartcover_name,
        job_type: "smartcover_job",
      },
      _precondition_params: {},
      _precondition_function: (
        se_obj: XR_cse_alife_human_abstract,
        smart: SmartTerrain,
        precond_params: AnyObject
      ): boolean => {
        return se_obj.community() !== communities.zombied;
      },
    };
    table.insert(stalker_jobs.jobs, t);

    let job_ltx =
      "[logic@" +
      smartcover_name +
      "]\n" +
      "active = animpoint@" +
      smartcover_name +
      "\n" +
      "[animpoint@" +
      smartcover_name +
      "]\n" +
      "meet = meet@generic_animpoint\n" +
      "cover_name = " +
      smartcover_name +
      "\n";

    if (smartTerrain.defendRestrictor !== null) {
      job_ltx = job_ltx + "out_restr = " + smartTerrain.defendRestrictor + "\n";
    }

    // todo: Bad path name?
    if (
      smartTerrain.safeRestrictor !== null &&
      isJobInRestrictor(smartTerrain, smartTerrain.safeRestrictor, null as any)
    ) {
      job_ltx = job_ltx + "invulnerable = {=npc_in_zone(smart.safe_restr)} true\n";
    }

    if (smartTerrain.smartTerrainActorControl !== null && smartTerrain.smartTerrainActorControl.isIgnoreZone !== null) {
      job_ltx =
        job_ltx +
        "combat_ignore_cond = {=npc_in_zone(smart.base_on_actor_control.ignore_zone)} true \n" +
        "combat_ignore_keep_when_attacked = true \n";
    }

    ltx = ltx + job_ltx;
    it = it + 1;
  }

  // ===================================================================================================================
  // = Guard
  // ===================================================================================================================
  logger.info("Guard jobs load:", smartTerrainName);

  const stalker_guard = { priority: 25, jobs: new LuaTable() };

  it = 1;
  while (level.patrol_path_exists(smartTerrainName + "_guard_" + it + "_walk")) {
    const way_name = smartTerrainName + "_guard_" + it + "_walk";

    t = {
      priority: 25,
      job_id: {
        section: "logic@" + way_name,
        job_type: "path_job",
      },
      _precondition_params: {},
      _precondition_function: (
        se_obj: XR_cse_alife_human_abstract,
        smart: SmartTerrain,
        precond_params: AnyObject
      ): boolean => {
        if (smart.alarmStartedAt === null) {
          return true;
        }

        if (smart.safeRestrictor === null) {
          return true;
        }

        if (precond_params.is_safe_job === null) {
          precond_params.is_safe_job = isJobInRestrictor(smart, smart.safeRestrictor, way_name);
        }

        return precond_params.is_safe_job !== false;
      },
    };
    table.insert(stalker_guard.jobs, t);

    let job_ltx =
      "[logic@" +
      way_name +
      "]\n" +
      "active = walker@" +
      way_name +
      "\n" +
      "[walker@" +
      way_name +
      "]\n" +
      "meet = meet@generic_lager\n" +
      "path_walk = guard_" +
      it +
      "_walk\n" +
      "path_look = guard_" +
      it +
      "_look\n";

    if (
      smartTerrain.safeRestrictor !== null &&
      isJobInRestrictor(smartTerrain, smartTerrain.safeRestrictor, way_name)
    ) {
      job_ltx = job_ltx + "invulnerable = {=npc_in_zone(smart.safe_restr)} true\n";
    }

    if (smartTerrain.defendRestrictor !== null) {
      job_ltx = job_ltx + "out_restr = " + smartTerrain.defendRestrictor + "\n";
    }

    let job1_ltx =
      "[walker1@" +
      way_name +
      "]\n" +
      "meet = meet@generic_lager\n" +
      "path_walk = guard_" +
      it +
      "_walk\n" +
      "path_look = guard_" +
      it +
      "_look\n" +
      "def_state_standing = wait_na\n" +
      "on_info = {!is_obj_on_job(logic@follower_" +
      way_name +
      ":3)} walker@" +
      way_name +
      "\n" +
      "on_info2 = {=distance_to_obj_on_job_le(logic@follower_" +
      way_name +
      ":3)} remark@" +
      way_name +
      "\n";

    if (
      smartTerrain.safeRestrictor !== null &&
      isJobInRestrictor(smartTerrain, smartTerrain.safeRestrictor, way_name)
    ) {
      job1_ltx = job1_ltx + "invulnerable = {=npc_in_zone(smart.safe_restr)} true\n";
    }

    if (smartTerrain.defendRestrictor !== null) {
      job1_ltx = job1_ltx + "out_restr = " + smartTerrain.defendRestrictor + "\n";
    }

    job1_ltx =
      job1_ltx + "[remark@" + way_name + "]\n" + "anim = wait_na\n" + "target = logic@follower_" + way_name + "\n";

    if (smartTerrain.defendRestrictor !== null) {
      job1_ltx = job1_ltx + "out_restr = " + smartTerrain.defendRestrictor + "\n";
    }

    t = {
      priority: 24,
      job_id: {
        section: "logic@follower_" + way_name,
        job_type: "path_job",
      },
      _precondition_params: { changing_job: "logic@" + way_name },
      _precondition_function: (
        se_obj: XR_cse_alife_human_abstract,
        smart: SmartTerrain,
        precond_params: AnyObject,
        npc_info: AnyObject
      ): boolean => {
        return npc_info.need_job === precond_params.changing_job;
      },
    };
    table.insert(stalker_guard.jobs, t);

    let follower_ltx =
      "[logic@follower_" +
      way_name +
      "]\n" +
      "active = walker@follow_" +
      way_name +
      "\n" +
      "[walker@follow_" +
      way_name +
      "]\n" +
      "meet = meet@generic_lager\n" +
      "path_walk = guard_" +
      it +
      "_walk\n" +
      "path_look = guard_" +
      it +
      "_look\n" +
      "on_info = {=distance_to_obj_on_job_le(logic@" +
      way_name +
      ":3)} remark@follower_" +
      way_name +
      "\n";

    if (smartTerrain.defendRestrictor !== null) {
      follower_ltx = follower_ltx + "out_restr = " + smartTerrain.defendRestrictor + "\n";
    }

    follower_ltx =
      follower_ltx +
      "[remark@follower_" +
      way_name +
      "]\n" +
      "anim = wait_na\n" +
      "target = logic@" +
      way_name +
      "\n" +
      "on_timer = 2000 | %=switch_to_desired_job%\n";

    if (smartTerrain.defendRestrictor !== null) {
      follower_ltx = follower_ltx + "out_restr = " + smartTerrain.defendRestrictor + "\n";
    }

    ltx = ltx + job_ltx + job1_ltx + follower_ltx;
    it = it + 1;
  }

  if (it > 1) {
    table.insert(stalker_jobs.jobs, stalker_guard);
  }

  // ===================================================================================================================
  // = Sniper
  // ===================================================================================================================

  logger.info("Sniper jobs load:", smartTerrainName);

  const stalker_def_sniper = { priority: 30, jobs: new LuaTable() };

  it = 1;
  while (level.patrol_path_exists(smartTerrainName + "_sniper_" + it + "_walk")) {
    const way_name = smartTerrainName + "_sniper_" + it + "_walk";
    const ptr = new patrol(way_name);
    const wp_prop = parseWaypointData(way_name, ptr.flags(0), ptr.name(0));
    let state = "hide";

    if (wp_prop.state !== null) {
      if (wp_prop.state === "stand") {
        state = "threat";
      }
    }

    t = {
      priority: 30,
      job_id: {
        section: "logic@" + way_name,
        job_type: "path_job",
      },
      _precondition_params: { way_name: way_name },
      _precondition_function: (
        se_obj: XR_cse_alife_human_abstract,
        smart: SmartTerrain,
        precond_params: AnyObject
      ): boolean => {
        if (se_obj.community() === communities.zombied) {
          return false;
        }

        return isAccessibleJob(se_obj, precond_params.way_name);
      },
    };
    table.insert(stalker_def_sniper.jobs, t);

    let job_ltx =
      "[logic@" +
      way_name +
      "]\n" +
      "active = camper@" +
      way_name +
      "\n" +
      "[camper@" +
      way_name +
      "]\n" +
      "meet = meet@generic_lager\n" +
      "path_walk = sniper_" +
      it +
      "_walk\n" +
      "path_look = sniper_" +
      it +
      "_look\n" +
      "sniper = true\n" +
      "def_state_campering =" +
      state +
      "\n" +
      "def_state_campering_fire =" +
      state +
      "_fire\n";

    if (smartTerrain.defendRestrictor !== null) {
      job_ltx = job_ltx + "out_restr = " + smartTerrain.defendRestrictor + ",\n";
    }

    ltx = ltx + job_ltx;
    it = it + 1;
  }

  if (it > 1) {
    table.insert(stalker_jobs.jobs, stalker_def_sniper);
  }

  // ===================================================================================================================
  // = Camper
  // ===================================================================================================================

  logger.info("Camper jobs load:", smartTerrainName);

  const stalker_def_camper = { priority: 45, jobs: new LuaTable() };

  it = 1;

  while (level.patrol_path_exists(smartTerrainName + "_camper_" + it + "_walk")) {
    const way_name = smartTerrainName + "_camper_" + it + "_walk";
    const ptr = new patrol(way_name);
    const wp_prop = parseWaypointData(way_name, ptr.flags(0), ptr.name(0));
    let state = "hide";
    let radius = 0;

    if (wp_prop.state !== null) {
      if (wp_prop.state === "stand") {
        state = "threat";
      }
    }

    if (wp_prop.radius !== null) {
      radius = wp_prop.radius as number;
    }

    t = {
      priority: 45,
      job_id: {
        section: "logic@" + way_name,
        job_type: "path_job",
      },
      _precondition_params: { way_name: way_name },
      _precondition_function: (se_obj: XR_cse_alife_human_abstract, smart: SmartTerrain, precond_params: AnyObject) => {
        return isAccessibleJob(se_obj, precond_params.way_name);
      },
    };
    table.insert(stalker_def_camper.jobs, t);

    let job_ltx: string =
      "[logic@" +
      way_name +
      "]\n" +
      "active = camper@" +
      way_name +
      "\n" +
      "[camper@" +
      way_name +
      "]\n" +
      "meet = meet@generic_lager\n" +
      "radius = " +
      tostring(radius) +
      "\n" +
      "path_walk = camper_" +
      it +
      "_walk\n" +
      "def_state_moving = rush\n" +
      "def_state_campering =" +
      state +
      "\n" +
      "def_state_campering_fire =" +
      state +
      "_fire\n";

    if (level.patrol_path_exists(smartTerrainName + "_camper_" + it + "_look")) {
      job_ltx = job_ltx + "path_look = camper_" + it + "_look\n";
    }

    if (smartTerrain.defendRestrictor !== null) {
      job_ltx = job_ltx + "out_restr = " + smartTerrain.defendRestrictor + ",\n";
    }

    ltx = ltx + job_ltx;
    it = it + 1;
  }

  if (it > 1) {
    table.insert(stalker_jobs.jobs, stalker_def_camper);
  }

  table.insert(jobsList, stalker_jobs);

  // ===================================================================================================================
  const monster_jobs = { _precondition_is_monster: true, priority: 50, jobs: new LuaTable() };

  // ===================================================================================================================
  // = Mob home
  // ===================================================================================================================

  logger.info("Mob home jobs load:", smartTerrainName);

  for (const it of $range(1, 20)) {
    const name = smartTerrainName + "_home_" + it;
    const home_min_radius = 10;
    const home_mid_radius = 20;
    const home_max_radius = 70;

    t = {
      priority: 40,
      job_id: {
        section: "logic@" + name,
        job_type: "point_job",
      },
    };
    table.insert(monster_jobs.jobs, t);

    // -- ��������� �������� ��������� � ���.
    let job_ltx =
      "[logic@" +
      name +
      "]\n" +
      "active = mob_home@" +
      name +
      "\n" +
      "[mob_home@" +
      name +
      "]\n" +
      "gulag_point = true\n" +
      "home_min_radius = " +
      home_min_radius +
      "\n" +
      "home_mid_radius = " +
      home_mid_radius +
      "\n" +
      "home_max_radius = " +
      home_max_radius +
      "\n";

    if (smartTerrain.defendRestrictor !== null) {
      job_ltx = job_ltx + "out_restr = " + smartTerrain.defendRestrictor + "\n";
    }

    ltx = ltx + job_ltx;
  }

  table.insert(jobsList, monster_jobs);

  // ===================================================================================================================
  const smartTerrainIni: XR_ini_file = smartTerrain.ini;

  if (smartTerrainIni.section_exist(SMART_TERRAIN_SECTION)) {
    logger.info("Exclusive jobs load:", smartTerrainName);
    if (smartTerrainIni.section_exist("exclusive")) {
      const n = smartTerrainIni.line_count("exclusive");

      for (const i of $range(0, n - 1)) {
        const [result, id, value] = smartTerrainIni.r_line("exclusive", i, "", "");

        addExclusiveJob("exclusive", id, smartTerrainIni, jobsList);
      }
    } else {
      let num = 1;

      while (smartTerrainIni.line_exist(SMART_TERRAIN_SECTION, "work" + num)) {
        addExclusiveJob(SMART_TERRAIN_SECTION, "work" + num, smartTerrainIni, jobsList);
        num = num + 1;
      }
    }
  }

  logger.info("Composed job table:", smartTerrainName);

  return $multi(jobsList, ltx);
}

/**
 * Add jobs unique to terrain instance.
 */
function addExclusiveJob(
  section: TSection,
  work_field: TSection,
  smartTerrainIni: XR_ini_file,
  jobsList: LuaArray<TJobDescriptor>
): void {
  const work: Optional<string> = readIniString(smartTerrainIni, section, work_field, false, "");

  if (work === null) {
    return;
  }

  const iniPath: TPath = "scripts\\" + work;

  assert(getFS().exist(roots.gameConfig, iniPath), "There is no configuration file [%s].", iniPath);

  const job_ini_file = new ini_file(iniPath);
  const job_online = readIniString(job_ini_file, "logic@" + work_field, "job_online", false, "", null);
  const new_prior = readIniNumber(job_ini_file, "logic@" + work_field, "prior", false, 45);
  const job_suitable = readIniString(job_ini_file, "logic@" + work_field, "suitable", false, "");
  const is_monster = readIniBoolean(job_ini_file, "logic@" + work_field, "monster_job", false, false);
  const active_section = readIniString(job_ini_file, "logic@" + work_field, "active", false, "");
  const scheme = getSchemeByIniSection(active_section);

  let job_type: EJobType = JobTypeByScheme[scheme] as EJobType;

  if (scheme === EScheme.MOB_HOME) {
    if (readIniBoolean(job_ini_file, active_section, "gulag_point", false, false)) {
      job_type = EJobType.POINT_JOB;
    }
  }

  if (job_suitable === null) {
    const t: IJobDescriptor = {
      priority: new_prior,
      _precondition_is_monster: is_monster,
      job_id: {
        section: "logic@" + work_field,
        ini_path: iniPath,
        online: job_online,
        ini_file: job_ini_file,
        job_type: job_type as TName,
      },
    };

    table.insert(jobsList, t);

    return;
  }

  const conditionsList: TConditionList = parseConditionsList(job_suitable);

  const entry = {
    priority: new_prior,
    _precondition_is_monster: is_monster,
    job_id: {
      section: "logic@" + work_field,
      ini_path: iniPath,
      ini_file: job_ini_file,
      online: job_online,
      job_type: job_type,
    },
    _precondition_params: { condlist: conditionsList },
    _precondition_function: (
      se_obj: XR_cse_alife_human_abstract,
      smart: SmartTerrain,
      precond_params: AnyObject
    ): boolean => {
      const result: Optional<string> = pickSectionFromCondList(registry.actor, se_obj, precond_params.condlist);

      if (result === FALSE || result === null) {
        return false;
      }

      return true;
    },
  };

  table.insert(jobsList, entry);

  table.insert(jobsList, {
    priority: -1,
    _precondition_is_monster: is_monster,
    job_id: {
      section: "logic@" + work_field,
      ini_file: job_ini_file,
      job_type: job_type,
    },
  });
}

/**
 * todo;
 * todo;
 */
export function isJobInRestrictor(smart: SmartTerrain, restrictorName: TName, wayName: string): Optional<boolean> {
  if (restrictorName === null) {
    return null;
  }

  const restrictor: Optional<XR_game_object> = registry.zones.get(restrictorName);

  if (restrictor === null) {
    return null;
  }

  const patrolObject: XR_patrol = new patrol(wayName);
  const count: TCount = patrolObject.count();

  for (const pt of $range(0, count - 1)) {
    if (!restrictor.inside(patrolObject.point(pt))) {
      return false;
    }
  }

  return true;
}

/**
 * todo;
 */
export function isAccessibleJob(serverObject: XR_cse_alife_object, wayName: TName): boolean {
  return registry.objects.get(serverObject.id)?.object !== null;
}

/**
 * todo;
 */
export function jobIterator(
  smartTerrain: SmartTerrain,
  jobs: LuaTable<any, any>,
  objectJobDescriptor: IObjectJobDescriptor,
  selectedJobPriority: TRate
): LuaMultiReturn<[Optional<TNumberId>, TRate, Optional<any>]> {
  let selectedJobId: Optional<TNumberId> = null;
  let currentJobPriority: TRate = selectedJobPriority;
  let selected_job_link = null;

  for (const [k, jobInfo] of jobs) {
    if (currentJobPriority > jobInfo.priority) {
      return $multi(selectedJobId, currentJobPriority, selected_job_link);
    }

    if (isJobAvailableToObject(objectJobDescriptor, jobInfo, smartTerrain)) {
      if (jobInfo.job_id === null) {
        [selectedJobId, currentJobPriority, selected_job_link] = jobIterator(
          smartTerrain,
          jobInfo.jobs,
          objectJobDescriptor,
          selectedJobPriority
        );
      } else {
        if (jobInfo.npc_id === null) {
          return $multi(jobInfo.job_id, jobInfo.priority, jobInfo);
        } else if (jobInfo.job_id === objectJobDescriptor.job_id) {
          return $multi(jobInfo.job_id, jobInfo.priority, jobInfo);
        }
      }
    }
  }

  return $multi(selectedJobId, currentJobPriority, selected_job_link);
}

/**
 * todo;
 */
export function areOnlyMonstersOnJobs(objectInfos: LuaArray<IObjectJobDescriptor>): boolean {
  for (const [, objectInfo] of objectInfos) {
    if (!objectInfo.isMonster) {
      return false;
    }
  }

  return true;
}

/**
 * todo;
 * todo: gulag general update
 */
function isJobAvailableToObject(objectInfo: IObjectJobDescriptor, jobInfo: any, smartTerrain: SmartTerrain): boolean {
  if (smartTerrain.jobDeadTimeById.get(jobInfo.job_id) !== null) {
    return false;
  }

  if (jobInfo._precondition_is_monster !== null && jobInfo._precondition_is_monster !== objectInfo.isMonster) {
    return false;
  }

  if (jobInfo._precondition_function !== null) {
    if (
      !(jobInfo._precondition_function as AnyCallable)(
        objectInfo.se_obj,
        smartTerrain,
        jobInfo._precondition_params,
        objectInfo
      )
    ) {
      return false;
    }
  }

  return true;
}

/**
 * todo;
 */
export function setupSmartJobsAndLogicOnSpawn(
  object: XR_game_object,
  state: IRegistryObjectState,
  serverObject: Optional<XR_cse_alife_creature_abstract>,
  schemeType: ESchemeType,
  isLoaded: boolean
): void {
  logger.info("Setup smart terrain logic on spawn:", object.name(), schemeType);

  const alifeSimulator: Optional<XR_alife_simulator> = alife();

  serverObject = alife()!.object<XR_cse_alife_creature_abstract>(object.id());

  if (alifeSimulator !== null && serverObject !== null) {
    const smartTerrainId: TNumberId = serverObject.m_smart_terrain_id;

    if (smartTerrainId !== null && smartTerrainId !== MAX_U16) {
      const smartTerrain: SmartTerrain = alifeSimulator.object(smartTerrainId) as SmartTerrain;
      const need_setup_logic =
        !isLoaded &&
        smartTerrain.objectJobDescriptors.get(object.id()) &&
        smartTerrain.objectJobDescriptors.get(object.id()).begin_job === true;

      if (need_setup_logic) {
        smartTerrain.setupObjectLogic(object);
      } else {
        initializeObjectSchemeLogic(object, state, isLoaded, registry.actor, schemeType);
      }
    } else {
      initializeObjectSchemeLogic(object, state, isLoaded, registry.actor, schemeType);
    }
  } else {
    initializeObjectSchemeLogic(object, state, isLoaded, registry.actor, schemeType);
  }
}
