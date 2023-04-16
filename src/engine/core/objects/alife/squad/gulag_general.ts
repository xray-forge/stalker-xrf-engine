import {
  getFS,
  ini_file,
  level,
  patrol,
  XR_cse_alife_human_abstract,
  XR_cse_alife_object,
  XR_game_object,
  XR_ini_file,
  XR_patrol,
} from "xray16";

import { registry } from "@/engine/core/database";
import { SurgeManager } from "@/engine/core/managers/world/SurgeManager";
import type { SmartTerrain } from "@/engine/core/objects/alife/smart/SmartTerrain";
import { accessible_job, get_job_restrictor } from "@/engine/core/objects/alife/squad/combat_restrictor";
import { abort } from "@/engine/core/utils/assertion";
import { pickSectionFromCondList } from "@/engine/core/utils/ini/config";
import { getSchemeByIniSection, readIniBoolean, readIniNumber, readIniString } from "@/engine/core/utils/ini/getters";
import { LuaLogger } from "@/engine/core/utils/logging";
import { parseConditionsList, parseWaypointData, TConditionList } from "@/engine/core/utils/parse";
import { isInTimeInterval } from "@/engine/core/utils/time";
import { communities } from "@/engine/lib/constants/communities";
import { roots } from "@/engine/lib/constants/roots";
import { SMART_TERRAIN_SECTION } from "@/engine/lib/constants/sections";
import {
  AnyObject,
  EJobType,
  EScheme,
  JobTypeByScheme,
  Optional,
  TCount,
  TName,
  TPath,
  TSection,
} from "@/engine/lib/types";

const logger: LuaLogger = new LuaLogger($filename);

/**
 * todo;
 * todo;
 * todo;
 */
export function loadGulagJobs(smart: SmartTerrain): LuaMultiReturn<[LuaTable, string]> {
  const smartName: string = smart.name();
  const gname: string = smartName;
  const job_table: LuaTable = new LuaTable();
  let t: AnyObject;

  logger.info("Load job for smart:", smartName);

  let ltx =
    "" +
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

  const stalker_jobs = { _precondition_is_monster: false, _prior: 60, jobs: [] };
  const stalker_generic_point = { _prior: 3, jobs: [] };

  logger.info("Generic point jobs load:", smartName);

  for (const it of $range(1, 20)) {
    const name = gname + "_point_" + it;

    const t = {
      _prior: 3,
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
      gname +
      "\n" +
      "radius_min = 3\n" +
      "radius_max = 8\n" +
      "use_attack_direction = false\n" +
      "anim = {!npc_community(zombied)} sit, guard\n";

    if (smart.defendRestrictor !== null) {
      job_ltx = job_ltx + "out_restr = " + smart.defendRestrictor + "\n";
    }

    if (smart.smartTerrainActorControl !== null && smart.smartTerrainActorControl.ignore_zone !== null) {
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

  logger.info("Surge jobs load:", smartName);

  const stalker_surge = { _prior: 50, jobs: [] as Array<AnyObject> };
  let it = 1;

  while (level.patrol_path_exists(gname + "_surge_" + it + "_walk")) {
    const wayName = gname + "_surge_" + it + "_walk";

    table.insert(stalker_surge.jobs, {
      _prior: 50,
      job_id: {
        section: "logic@" + wayName,
        job_type: "path_job",
      },
      _precondition_params: {},
      _precondition_function: function () {
        return SurgeManager.getInstance().isStarted;
      },
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

    if (level.patrol_path_exists(gname + "_surge_" + it + "_look")) {
      job_ltx = job_ltx + "path_look = surge_" + it + "_look\n";
    }

    if (smart.defendRestrictor !== null) {
      job_ltx = job_ltx + "out_restr = " + smart.defendRestrictor + "\n";
    }

    if (
      smart.smartTerrainActorControl !== null &&
      smart.smartTerrainActorControl.ignore_zone !== null &&
      isJobInRestrictor(smart, smart.smartTerrainActorControl.ignore_zone, wayName)
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

  logger.info("Sleep jobs load:", smartName);

  const stalker_sleep = { _prior: 10, jobs: new LuaTable() };

  it = 1;

  // todo: Probably only one job applies by should be more?
  while (level.patrol_path_exists(gname + "_sleep_" + it)) {
    const way_name = gname + "_sleep_" + it;

    t = {
      _prior: 10,
      job_id: {
        section: "logic@" + way_name,
        job_type: "path_job",
      },
      _precondition_params: {},
      _precondition_function: function (
        se_obj: XR_cse_alife_human_abstract,
        smart: SmartTerrain,
        precond_params: AnyObject
      ) {
        if (se_obj.community() === communities.zombied) {
          return false;
        }

        if (!isInTimeInterval(21, 7)) {
          return false;
        }

        if (smart.smartAlarmStartedAt === null) {
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

    if (smart.safeRestrictor !== null && isJobInRestrictor(smart, smart.safeRestrictor, way_name)) {
      job_ltx = job_ltx + "invulnerable = {=npc_in_zone(smart.safe_restr)} true\n";
    }

    if (smart.defendRestrictor !== null) {
      job_ltx = job_ltx + "out_restr = " + smart.defendRestrictor + "\n";
    }

    if (
      smart.smartTerrainActorControl !== null &&
      smart.smartTerrainActorControl.ignore_zone !== null &&
      isJobInRestrictor(smart, smart.smartTerrainActorControl.ignore_zone, way_name)
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

  logger.info("Collector jobs load:", smartName);

  const stalker_collector = { _prior: 25, jobs: [] as Array<AnyObject> };

  it = 1;

  // todo: While and single insert?
  while (level.patrol_path_exists(gname + "_collector_" + it + "_walk")) {
    const way_name = gname + "_collector_" + it + "_walk";

    t = {
      _prior: 25,
      job_id: {
        section: "logic@" + way_name,
        job_type: "path_job",
      },
      _precondition_params: {},
      _precondition_function: function (
        se_obj: XR_cse_alife_human_abstract,
        smart: SmartTerrain,
        precond_params: AnyObject
      ) {
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

    if (level.patrol_path_exists(gname + "_collector_" + it + "_look")) {
      job_ltx = job_ltx + "path_look = collector_" + it + "_look\n";
    }

    if (smart.safeRestrictor !== null && isJobInRestrictor(smart, smart.safeRestrictor, way_name)) {
      job_ltx = job_ltx + "invulnerable = {=npc_in_zone(smart.safe_restr)} true\n";
    }

    if (smart.defendRestrictor !== null) {
      job_ltx = job_ltx + "out_restr = " + smart.defendRestrictor + "\n";
    }

    if (
      smart.smartTerrainActorControl !== null &&
      smart.smartTerrainActorControl.ignore_zone !== null &&
      isJobInRestrictor(smart, smart.smartTerrainActorControl.ignore_zone, way_name)
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

  logger.info("Walker jobs load:", smartName);

  const stalker_walker = { _prior: 15, jobs: new LuaTable() };

  it = 1;

  while (level.patrol_path_exists(gname + "_walker_" + it + "_walk")) {
    // -- ���������� �������� ���������� ����� �� �������� ����� ����.
    const way_name = gname + "_walker_" + it + "_walk";

    // -- ��������� ���������
    t = {
      _prior: 15,
      job_id: {
        section: "logic@" + way_name,
        job_type: "path_job",
      },
      _precondition_params: {},
      _precondition_function: function (se_obj: XR_cse_alife_object, smart: SmartTerrain, precond_params: AnyObject) {
        if (smart.smartAlarmStartedAt === null) {
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

    if (level.patrol_path_exists(gname + "_walker_" + it + "_look")) {
      job_ltx = job_ltx + "path_look = walker_" + it + "_look\n";
    }

    if (smart.safeRestrictor !== null && isJobInRestrictor(smart, smart.safeRestrictor, way_name)) {
      job_ltx = job_ltx + "invulnerable = {=npc_in_zone(smart.safe_restr)} true\n";
    }

    if (smart.defendRestrictor !== null) {
      job_ltx = job_ltx + "out_restr = " + smart.defendRestrictor + "\n";
    }

    if (
      smart.smartTerrainActorControl !== null &&
      smart.smartTerrainActorControl.ignore_zone !== null &&
      isJobInRestrictor(smart, smart.smartTerrainActorControl.ignore_zone, way_name)
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
  logger.info("Patrol jobs load:", smartName);

  const stalker_patrol = { _prior: 20, jobs: new LuaTable() };

  it = 1;
  while (level.patrol_path_exists(gname + "_patrol_" + it + "_walk")) {
    const way_name = gname + "_patrol_" + it + "_walk";
    const ptr = new patrol(way_name);
    const wp_prop = parseWaypointData(way_name, ptr.flags(0), ptr.name(0));
    let job_count = 3;

    if (wp_prop.count !== null) {
      job_count = wp_prop.count as number;
    }

    for (const i of $range(1, job_count)) {
      // -- ��������� ���������
      t = {
        _prior: 20,
        job_id: {
          section: "logic@" + way_name,
          job_type: "path_job",
        },
        _precondition_params: {},
        _precondition_function: function (
          se_obj: XR_cse_alife_human_abstract,
          smart: SmartTerrain,
          precond_params: AnyObject
        ) {
          if (se_obj.community() === communities.zombied) {
            return false;
          }

          if (smart.smartAlarmStartedAt === null) {
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

    if (level.patrol_path_exists(gname + "_patrol_" + it + "_look")) {
      job_ltx = job_ltx + "path_look = patrol_" + it + "_look\n";
    }

    if (smart.safeRestrictor !== null && isJobInRestrictor(smart, smart.safeRestrictor, way_name)) {
      job_ltx = job_ltx + "invulnerable = {=npc_in_zone(smart.safe_restr)} true\n";
    }

    if (smart.defendRestrictor !== null) {
      job_ltx = job_ltx + "out_restr = " + smart.defendRestrictor + "\n";
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
  logger.info("Animpoint jobs load:", smartName);
  it = 1;

  while (registry.smartCovers.get(gname + "_animpoint_" + it) !== null) {
    const smartcover_name = gname + "_animpoint_" + it;

    t = {
      _prior: 15,
      job_id: {
        section: "logic@" + smartcover_name,
        job_type: "smartcover_job",
      },
      _precondition_params: {},
      _precondition_function: function (
        se_obj: XR_cse_alife_human_abstract,
        smart: SmartTerrain,
        precond_params: AnyObject
      ) {
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

    if (smart.defendRestrictor !== null) {
      job_ltx = job_ltx + "out_restr = " + smart.defendRestrictor + "\n";
    }

    // todo: Bad path name?
    if (smart.safeRestrictor !== null && isJobInRestrictor(smart, smart.safeRestrictor, null as any)) {
      job_ltx = job_ltx + "invulnerable = {=npc_in_zone(smart.safe_restr)} true\n";
    }

    if (smart.smartTerrainActorControl !== null && smart.smartTerrainActorControl.ignore_zone !== null) {
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
  logger.info("Guard jobs load:", smartName);

  const stalker_guard = { _prior: 25, jobs: new LuaTable() };

  it = 1;
  while (level.patrol_path_exists(gname + "_guard_" + it + "_walk")) {
    const way_name = gname + "_guard_" + it + "_walk";

    t = {
      _prior: 25,
      job_id: {
        section: "logic@" + way_name,
        job_type: "path_job",
      },
      _precondition_params: {},
      _precondition_function: function (
        se_obj: XR_cse_alife_human_abstract,
        smart: SmartTerrain,
        precond_params: AnyObject
      ) {
        if (smart.smartAlarmStartedAt === null) {
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

    if (smart.safeRestrictor !== null && isJobInRestrictor(smart, smart.safeRestrictor, way_name)) {
      job_ltx = job_ltx + "invulnerable = {=npc_in_zone(smart.safe_restr)} true\n";
    }

    if (smart.defendRestrictor !== null) {
      job_ltx = job_ltx + "out_restr = " + smart.defendRestrictor + "\n";
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

    if (smart.safeRestrictor !== null && isJobInRestrictor(smart, smart.safeRestrictor, way_name)) {
      job1_ltx = job1_ltx + "invulnerable = {=npc_in_zone(smart.safe_restr)} true\n";
    }

    if (smart.defendRestrictor !== null) {
      job1_ltx = job1_ltx + "out_restr = " + smart.defendRestrictor + "\n";
    }

    job1_ltx =
      job1_ltx + "[remark@" + way_name + "]\n" + "anim = wait_na\n" + "target = logic@follower_" + way_name + "\n";

    if (smart.defendRestrictor !== null) {
      job1_ltx = job1_ltx + "out_restr = " + smart.defendRestrictor + "\n";
    }

    t = {
      _prior: 24,
      job_id: {
        section: "logic@follower_" + way_name,
        job_type: "path_job",
      },
      _precondition_params: { changing_job: "logic@" + way_name },
      _precondition_function: function (
        se_obj: XR_cse_alife_human_abstract,
        smart: SmartTerrain,
        precond_params: AnyObject,
        npc_info: AnyObject
      ) {
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

    if (smart.defendRestrictor !== null) {
      follower_ltx = follower_ltx + "out_restr = " + smart.defendRestrictor + "\n";
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

    if (smart.defendRestrictor !== null) {
      follower_ltx = follower_ltx + "out_restr = " + smart.defendRestrictor + "\n";
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

  logger.info("Sniper jobs load:", smartName);

  const stalker_def_sniper = { _prior: 30, jobs: new LuaTable() };

  it = 1;
  while (level.patrol_path_exists(gname + "_sniper_" + it + "_walk")) {
    const way_name = gname + "_sniper_" + it + "_walk";
    const ptr = new patrol(way_name);
    const wp_prop = parseWaypointData(way_name, ptr.flags(0), ptr.name(0));
    let state = "hide";

    if (wp_prop.state !== null) {
      if (wp_prop.state === "stand") {
        state = "threat";
      }
    }

    t = {
      _prior: 30,
      job_id: {
        section: "logic@" + way_name,
        job_type: "path_job",
      },
      _precondition_params: { way_name: way_name },
      _precondition_function: function (
        se_obj: XR_cse_alife_human_abstract,
        smart: SmartTerrain,
        precond_params: AnyObject
      ) {
        if (se_obj.community() === communities.zombied) {
          return false;
        }

        return accessible_job(se_obj, precond_params.way_name);
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

    if (smart.defendRestrictor !== null) {
      job_ltx = job_ltx + "out_restr = " + smart.defendRestrictor + "," + get_job_restrictor(way_name) + "\n";
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

  logger.info("Camper jobs load:", smartName);

  const stalker_def_camper = { _prior: 45, jobs: new LuaTable() };

  it = 1;

  while (level.patrol_path_exists(gname + "_camper_" + it + "_walk")) {
    const way_name = gname + "_camper_" + it + "_walk";
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
      _prior: 45,
      job_id: {
        section: "logic@" + way_name,
        job_type: "path_job",
      },
      _precondition_params: { way_name: way_name },
      _precondition_function: function (
        se_obj: XR_cse_alife_human_abstract,
        smart: SmartTerrain,
        precond_params: AnyObject
      ) {
        return accessible_job(se_obj, precond_params.way_name);
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

    if (level.patrol_path_exists(gname + "_camper_" + it + "_look")) {
      job_ltx = job_ltx + "path_look = camper_" + it + "_look\n";
    }

    if (smart.defendRestrictor !== null) {
      job_ltx = job_ltx + "out_restr = " + smart.defendRestrictor + "," + get_job_restrictor(way_name) + "\n";
    }

    ltx = ltx + job_ltx;
    it = it + 1;
  }

  if (it > 1) {
    table.insert(stalker_jobs.jobs, stalker_def_camper);
  }

  table.insert(job_table, stalker_jobs);

  // ===================================================================================================================
  const monster_jobs = { _precondition_is_monster: true, _prior: 50, jobs: new LuaTable() };

  // ===================================================================================================================
  // = Mob home
  // ===================================================================================================================

  logger.info("Mob home jobs load:", smartName);

  for (const it of $range(1, 20)) {
    const name = gname + "_home_" + it;
    const home_min_radius = 10;
    const home_mid_radius = 20;
    const home_max_radius = 70;

    t = {
      _prior: 40,
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

    if (smart.defendRestrictor !== null) {
      job_ltx = job_ltx + "out_restr = " + smart.defendRestrictor + "\n";
    }

    ltx = ltx + job_ltx;
  }

  table.insert(job_table, monster_jobs);

  // ===================================================================================================================
  const smartTerrainIni: XR_ini_file = smart.ini;

  if (smartTerrainIni.section_exist(SMART_TERRAIN_SECTION)) {
    logger.info("Exclusive jobs load:", smartName);
    if (smartTerrainIni.section_exist("exclusive")) {
      const n = smartTerrainIni.line_count("exclusive");

      for (const i of $range(0, n - 1)) {
        const [result, id, value] = smartTerrainIni.r_line("exclusive", i, "", "");

        add_exclusive_job("exclusive", id, smartTerrainIni, job_table);
      }
    } else {
      let num = 1;

      while (smartTerrainIni.line_exist(SMART_TERRAIN_SECTION, "work" + num)) {
        add_exclusive_job(SMART_TERRAIN_SECTION, "work" + num, smartTerrainIni, job_table);
        num = num + 1;
      }
    }
  }

  logger.info("Composed job table:", smartName);

  return $multi(job_table, ltx);
}

/**
 * todo;
 */
function add_exclusive_job(sect: TSection, work_field: string, smart_ini: XR_ini_file, job_table: LuaTable): void {
  const work: Optional<string> = readIniString(smart_ini, sect, work_field, false, "");

  if (work === null) {
    return;
  }

  const iniPath: TPath = "scripts\\" + work;

  if (getFS().exist(roots.gameConfig, iniPath) === null) {
    abort("there is no configuration file [%s]", iniPath);
  }

  const job_ini_file = new ini_file(iniPath);
  const job_online = readIniString(job_ini_file, "logic@" + work_field, "job_online", false, "", null);
  const new_prior = readIniNumber(job_ini_file, "logic@" + work_field, "prior", false, 45);
  const job_suitable = readIniString(job_ini_file, "logic@" + work_field, "suitable", false, "");
  const is_monster = readIniBoolean(job_ini_file, "logic@" + work_field, "monster_job", false, false);
  const active_section = readIniString(job_ini_file, "logic@" + work_field, "active", false, "");
  const scheme = getSchemeByIniSection(active_section);

  let job_type = JobTypeByScheme[scheme];

  if (scheme === EScheme.MOB_HOME) {
    if (readIniBoolean(job_ini_file, active_section, "gulag_point", false, false)) {
      job_type = EJobType.POINT_JOB;
    }
  }

  if (job_suitable === null) {
    const t = {
      _prior: new_prior,
      _precondition_is_monster: is_monster,
      job_id: {
        section: "logic@" + work_field,
        ini_path: iniPath,
        online: job_online,
        ini_file: job_ini_file,
        job_type: job_type,
      },
    };

    table.insert(job_table, t);

    return;
  }

  const conditionsList: TConditionList = parseConditionsList(job_suitable);

  table.insert(job_table, {
    _prior: new_prior,
    _precondition_is_monster: is_monster,
    job_id: {
      section: "logic@" + work_field,
      ini_path: iniPath,
      ini_file: job_ini_file,
      online: job_online,
      job_type: job_type,
    },
    _precondition_params: { condlist: conditionsList },
    _precondition_function: function (
      se_obj: XR_cse_alife_human_abstract,
      smart: SmartTerrain,
      precond_params: AnyObject
    ) {
      const result: Optional<string> = pickSectionFromCondList(registry.actor, se_obj, precond_params.condlist);

      if (result === "false" || result === null) {
        return false;
      }

      return true;
    },
  });

  table.insert(job_table, {
    _prior: -1,
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
