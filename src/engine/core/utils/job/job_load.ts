import { level, patrol } from "xray16";

import { registry } from "@/engine/core/database";
import { SurgeManager } from "@/engine/core/managers/world/SurgeManager";
import { SmartTerrain } from "@/engine/core/objects";
import { isInTimeInterval } from "@/engine/core/utils/game";
import { parseWaypointData } from "@/engine/core/utils/ini";
import { isAccessibleJob, isJobInRestrictor } from "@/engine/core/utils/job/job_check";
import { loadExclusiveJob } from "@/engine/core/utils/job/job_exclusive";
import { TJobDescriptor } from "@/engine/core/utils/job/types";
import { LuaLogger } from "@/engine/core/utils/logging";
import { communities } from "@/engine/lib/constants/communities";
import {
  AnyObject,
  ClientObject,
  IniFile,
  LuaArray,
  ServerHumanObject,
  ServerObject,
  TCount,
  TIndex,
  TName,
} from "@/engine/lib/types";

const logger: LuaLogger = new LuaLogger($filename);

/**
 * todo;
 *
 * @param smartTerrain - jobs to load for smart terrain
 * @returns array of job descriptors and ltx configuration text
 */
export function loadSmartTerrainJobs(smartTerrain: SmartTerrain): LuaMultiReturn<[LuaArray<TJobDescriptor>, string]> {
  const smartTerrainName: TName = smartTerrain.name();
  const jobsList: LuaArray<TJobDescriptor> = new LuaTable();

  let t: AnyObject;

  logger.info("Load job for smart:", smartTerrainName);

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

  const stalkerJobs = { _precondition_is_monster: false, priority: 60, jobs: new LuaTable() };
  const stalkerGenericPoint = { priority: 3, jobs: new LuaTable() };

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
      jobLtx = jobLtx + "out_restr = " + smartTerrain.defendRestrictor + "\n";
    }

    if (smartTerrain.smartTerrainActorControl !== null && smartTerrain.smartTerrainActorControl.isIgnoreZone !== null) {
      jobLtx =
        jobLtx +
        "combat_ignore_cond = {=npc_in_zone(smart.base_on_actor_control.ignore_zone)} true \n" +
        "combat_ignore_keep_when_attacked = true \n";
    }

    ltx = ltx + jobLtx;
  }

  table.insert(stalkerJobs.jobs, stalkerGenericPoint);

  // ===================================================================================================================
  // = Surge
  // ===================================================================================================================

  const stalkerSurge = { priority: 50, jobs: new LuaTable() };
  let it = 1;

  while (level.patrol_path_exists(smartTerrainName + "_surge_" + it + "_walk")) {
    const wayName = smartTerrainName + "_surge_" + it + "_walk";

    table.insert(stalkerSurge.jobs, {
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

    ltx = ltx + jobLtx;
    it = it + 1;
  }

  if (it > 1) {
    table.insert(stalkerJobs.jobs, stalkerSurge);
  }

  // ===================================================================================================================
  // = Sleep
  // ===================================================================================================================
  const stalkerSleep = { priority: 10, jobs: new LuaTable() };

  it = 1;

  // todo: Probably only one job applies by should be more?
  while (level.patrol_path_exists(smartTerrainName + "_sleep_" + it)) {
    const wayName = smartTerrainName + "_sleep_" + it;

    t = {
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
    };

    table.insert(stalkerSleep.jobs, t);

    let jobLtx =
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
      jobLtx = jobLtx + "invulnerable = {=npc_in_zone(smart.safe_restr)} true\n";
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

    ltx = ltx + jobLtx;
    it = it + 1;
  }

  if (it > 1) {
    table.insert(stalkerJobs.jobs, stalkerSleep);
  }

  // ===================================================================================================================
  // = Collector
  // ===================================================================================================================

  const stalkerCollector = { priority: 25, jobs: new LuaTable() };

  it = 1;

  // todo: While and single insert?
  while (level.patrol_path_exists(smartTerrainName + "_collector_" + it + "_walk")) {
    const wayName = smartTerrainName + "_collector_" + it + "_walk";

    t = {
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
    };

    table.insert(stalkerCollector.jobs, t);

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
      it +
      "_walk\n" +
      "def_state_standing = guard\n" +
      "def_state_moving = patrol\n";

    if (level.patrol_path_exists(smartTerrainName + "_collector_" + it + "_look")) {
      jobLtx = jobLtx + "path_look = collector_" + it + "_look\n";
    }

    if (smartTerrain.safeRestrictor !== null && isJobInRestrictor(smartTerrain, smartTerrain.safeRestrictor, wayName)) {
      jobLtx = jobLtx + "invulnerable = {=npc_in_zone(smart.safe_restr)} true\n";
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

    ltx = ltx + jobLtx;
    it = it + 1;
  }

  if (it > 1) {
    table.insert(stalkerJobs.jobs, stalkerCollector);
  }

  // ===================================================================================================================
  // = Walker
  // ===================================================================================================================
  const stalkerWalker = { priority: 15, jobs: new LuaTable() };

  it = 1;

  while (level.patrol_path_exists(smartTerrainName + "_walker_" + it + "_walk")) {
    // -- ���������� �������� ���������� ����� �� �������� ����� ����.
    const wayName = smartTerrainName + "_walker_" + it + "_walk";

    // -- ��������� ���������
    t = {
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
    };
    table.insert(stalkerWalker.jobs, t);

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
      "path_walk = walker_" +
      it +
      "_walk\n" +
      "def_state_standing = guard\n" +
      "def_state_moving = patrol\n";

    if (level.patrol_path_exists(smartTerrainName + "_walker_" + it + "_look")) {
      jobLtx = jobLtx + "path_look = walker_" + it + "_look\n";
    }

    if (smartTerrain.safeRestrictor !== null && isJobInRestrictor(smartTerrain, smartTerrain.safeRestrictor, wayName)) {
      jobLtx = jobLtx + "invulnerable = {=npc_in_zone(smart.safe_restr)} true\n";
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

    ltx = ltx + jobLtx;
    it = it + 1;
  }

  if (it > 1) {
    table.insert(stalkerJobs.jobs, stalkerWalker);
  }

  // ===================================================================================================================
  // = Patrol
  // ===================================================================================================================
  const stalkerPatrol = { priority: 20, jobs: new LuaTable() };

  it = 1;
  while (level.patrol_path_exists(smartTerrainName + "_patrol_" + it + "_walk")) {
    const wayName = smartTerrainName + "_patrol_" + it + "_walk";
    const ptr = new patrol(wayName);
    const wpProp = parseWaypointData(wayName, ptr.flags(0), ptr.name(0));
    let jobCount = 3;

    if (wpProp.count !== null) {
      jobCount = wpProp.count as number;
    }

    for (const i of $range(1, jobCount)) {
      // -- ��������� ���������
      t = {
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
      };
      table.insert(stalkerPatrol.jobs, t);
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
      it +
      "_walk\n" +
      "on_signal = }| %=search_gulag_job%\n";

    if (level.patrol_path_exists(smartTerrainName + "_patrol_" + it + "_look")) {
      jobLtx = jobLtx + "path_look = patrol_" + it + "_look\n";
    }

    if (smartTerrain.safeRestrictor !== null && isJobInRestrictor(smartTerrain, smartTerrain.safeRestrictor, wayName)) {
      jobLtx = jobLtx + "invulnerable = {=npc_in_zone(smart.safe_restr)} true\n";
    }

    if (smartTerrain.defendRestrictor !== null) {
      jobLtx = jobLtx + "out_restr = " + smartTerrain.defendRestrictor + "\n";
    }

    ltx += jobLtx;
    it += 1;
  }

  if (it > 1) {
    table.insert(stalkerJobs.jobs, stalkerPatrol);
  }

  // ===================================================================================================================
  // = Animpoint
  // ===================================================================================================================
  it = 1;

  while (registry.smartCovers.get(smartTerrainName + "_animpoint_" + it) !== null) {
    const smartcoverName = smartTerrainName + "_animpoint_" + it;

    t = {
      priority: 15,
      job_id: {
        section: "logic@" + smartcoverName,
        job_type: "smartcover_job",
      },
      _precondition_params: {},
      _precondition_function: (
        serverObject: ServerHumanObject,
        smart: SmartTerrain,
        precondParams: AnyObject
      ): boolean => {
        return serverObject.community() !== communities.zombied;
      },
    };
    table.insert(stalkerJobs.jobs, t);

    let jobLtx =
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
      jobLtx = jobLtx + "out_restr = " + smartTerrain.defendRestrictor + "\n";
    }

    // todo: Bad path name?
    if (
      smartTerrain.safeRestrictor !== null &&
      isJobInRestrictor(smartTerrain, smartTerrain.safeRestrictor, null as any)
    ) {
      jobLtx = jobLtx + "invulnerable = {=npc_in_zone(smart.safe_restr)} true\n";
    }

    if (smartTerrain.smartTerrainActorControl !== null && smartTerrain.smartTerrainActorControl.isIgnoreZone !== null) {
      jobLtx =
        jobLtx +
        "combat_ignore_cond = {=npc_in_zone(smart.base_on_actor_control.ignore_zone)} true \n" +
        "combat_ignore_keep_when_attacked = true \n";
    }

    ltx = ltx + jobLtx;
    it = it + 1;
  }

  // ===================================================================================================================
  // = Guard
  // ===================================================================================================================
  const stalkerGuard = { priority: 25, jobs: new LuaTable() };

  it = 1;
  while (level.patrol_path_exists(smartTerrainName + "_guard_" + it + "_walk")) {
    const wayName = smartTerrainName + "_guard_" + it + "_walk";

    t = {
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
    };
    table.insert(stalkerGuard.jobs, t);

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
      it +
      "_walk\n" +
      "path_look = guard_" +
      it +
      "_look\n";

    if (smartTerrain.safeRestrictor !== null && isJobInRestrictor(smartTerrain, smartTerrain.safeRestrictor, wayName)) {
      jobLtx = jobLtx + "invulnerable = {=npc_in_zone(smart.safe_restr)} true\n";
    }

    if (smartTerrain.defendRestrictor !== null) {
      jobLtx = jobLtx + "out_restr = " + smartTerrain.defendRestrictor + "\n";
    }

    let job1Ltx =
      "[walker1@" +
      wayName +
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
      job1Ltx = job1Ltx + "invulnerable = {=npc_in_zone(smart.safe_restr)} true\n";
    }

    if (smartTerrain.defendRestrictor !== null) {
      job1Ltx = job1Ltx + "out_restr = " + smartTerrain.defendRestrictor + "\n";
    }

    job1Ltx = job1Ltx + "[remark@" + wayName + "]\n" + "anim = wait_na\n" + "target = logic@follower_" + wayName + "\n";

    if (smartTerrain.defendRestrictor !== null) {
      job1Ltx = job1Ltx + "out_restr = " + smartTerrain.defendRestrictor + "\n";
    }

    t = {
      priority: 24,
      job_id: {
        section: "logic@follower_" + wayName,
        job_type: "path_job",
      },
      _precondition_params: { changing_job: "logic@" + wayName },
      _precondition_function: (
        serverObject: ServerHumanObject,
        smart: SmartTerrain,
        precondParams: AnyObject,
        npcInfo: AnyObject
      ): boolean => {
        return npcInfo.need_job === precondParams.changing_job;
      },
    };
    table.insert(stalkerGuard.jobs, t);

    let followerLtx =
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
      it +
      "_walk\n" +
      "path_look = guard_" +
      it +
      "_look\n" +
      "on_info = {=distance_to_obj_on_job_le(logic@" +
      wayName +
      ":3)} remark@follower_" +
      wayName +
      "\n";

    if (smartTerrain.defendRestrictor !== null) {
      followerLtx = followerLtx + "out_restr = " + smartTerrain.defendRestrictor + "\n";
    }

    followerLtx =
      followerLtx +
      "[remark@follower_" +
      wayName +
      "]\n" +
      "anim = wait_na\n" +
      "target = logic@" +
      wayName +
      "\n" +
      "on_timer = 2000 | %=switch_to_desired_job%\n";

    if (smartTerrain.defendRestrictor !== null) {
      followerLtx = followerLtx + "out_restr = " + smartTerrain.defendRestrictor + "\n";
    }

    ltx = ltx + jobLtx + job1Ltx + followerLtx;
    it = it + 1;
  }

  if (it > 1) {
    table.insert(stalkerJobs.jobs, stalkerGuard);
  }

  // ===================================================================================================================
  // = Sniper
  // ===================================================================================================================

  const stalkerDefSniper = { priority: 30, jobs: new LuaTable() };

  it = 1;

  while (level.patrol_path_exists(smartTerrainName + "_sniper_" + it + "_walk")) {
    const wayName = smartTerrainName + "_sniper_" + it + "_walk";
    const ptr = new patrol(wayName);
    const wpProp = parseWaypointData(wayName, ptr.flags(0), ptr.name(0));
    let state = "hide";

    if (wpProp.state !== null) {
      if (wpProp.state === "stand") {
        state = "threat";
      }
    }

    t = {
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
    };
    table.insert(stalkerDefSniper.jobs, t);

    let jobLtx =
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
      jobLtx = jobLtx + "out_restr = " + smartTerrain.defendRestrictor + ",\n";
    }

    ltx = ltx + jobLtx;
    it = it + 1;
  }

  if (it > 1) {
    table.insert(stalkerJobs.jobs, stalkerDefSniper);
  }

  // ===================================================================================================================
  // = Camper
  // ===================================================================================================================

  const stalkerDefCamper = { priority: 45, jobs: new LuaTable() };

  it = 1;

  while (level.patrol_path_exists(smartTerrainName + "_camper_" + it + "_walk")) {
    const wayName = smartTerrainName + "_camper_" + it + "_walk";
    const ptr = new patrol(wayName);
    const wpProp = parseWaypointData(wayName, ptr.flags(0), ptr.name(0));
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

    t = {
      priority: 45,
      job_id: {
        section: "logic@" + wayName,
        job_type: "path_job",
      },
      _precondition_params: { way_name: wayName },
      _precondition_function: (serverObject: ServerHumanObject, smart: SmartTerrain, precond_params: AnyObject) => {
        return isAccessibleJob(serverObject, precond_params.way_name);
      },
    };
    table.insert(stalkerDefCamper.jobs, t);

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
      jobLtx = jobLtx + "path_look = camper_" + it + "_look\n";
    }

    if (smartTerrain.defendRestrictor !== null) {
      jobLtx = jobLtx + "out_restr = " + smartTerrain.defendRestrictor + ",\n";
    }

    ltx = ltx + jobLtx;
    it += 1;
  }

  if (it > 1) {
    table.insert(stalkerJobs.jobs, stalkerDefCamper);
  }

  table.insert(jobsList, stalkerJobs);

  // ===================================================================================================================
  const monsterJobs = { _precondition_is_monster: true, priority: 50, jobs: new LuaTable() };

  // ===================================================================================================================
  // = Mob home
  // ===================================================================================================================

  for (const it of $range(1, 20)) {
    const name = smartTerrainName + "_home_" + it;
    const homeMinRadius = 10;
    const homeMidRadius = 20;
    const homeMaxRadius = 70;

    t = {
      priority: 40,
      job_id: {
        section: "logic@" + name,
        job_type: "point_job",
      },
    };
    table.insert(monsterJobs.jobs, t);

    // -- ��������� �������� ��������� � ���.
    let jobLtx =
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
      homeMinRadius +
      "\n" +
      "home_mid_radius = " +
      homeMidRadius +
      "\n" +
      "home_max_radius = " +
      homeMaxRadius +
      "\n";

    if (smartTerrain.defendRestrictor !== null) {
      jobLtx = jobLtx + "out_restr = " + smartTerrain.defendRestrictor + "\n";
    }

    ltx = ltx + jobLtx;
  }

  table.insert(jobsList, monsterJobs);

  // ===================================================================================================================
  const smartTerrainIni: IniFile = smartTerrain.ini;

  if (smartTerrainIni.section_exist("smart_terrain")) {
    logger.info("Exclusive jobs load:", smartTerrainName);

    if (smartTerrainIni.section_exist("exclusive")) {
      const exclusiveJobsCount: TCount = smartTerrainIni.line_count("exclusive");

      for (const i of $range(0, exclusiveJobsCount - 1)) {
        const [result, id, value] = smartTerrainIni.r_line("exclusive", i, "", "");

        loadExclusiveJob(smartTerrainIni, "exclusive", id, jobsList);
      }
    } else {
      let index: TIndex = 1;

      while (smartTerrainIni.line_exist("smart_terrain", "work" + index)) {
        loadExclusiveJob(smartTerrainIni, "smart_terrain", "work" + index, jobsList);
        index += 1;
      }
    }
  }

  logger.info("Composed job table:", smartTerrainName);

  return $multi(jobsList, ltx);
}
