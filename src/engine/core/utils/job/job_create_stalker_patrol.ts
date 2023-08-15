import { level, patrol } from "xray16";

import { SmartTerrain } from "@/engine/core/objects";
import { parseWaypointData } from "@/engine/core/utils/ini";
import { isJobPatrolInRestrictor } from "@/engine/core/utils/job/job_check";
import { IJobListDescriptor } from "@/engine/core/utils/job/job_types";
import { logicsConfig } from "@/engine/lib/configs/LogicsConfig";
import { communities } from "@/engine/lib/constants/communities";
import { AnyObject, EJobType, ServerHumanObject, TCount, TIndex, TName } from "@/engine/lib/types";

/**
 * todo;
 */
export function createStalkerPatrolJobs(
  smartTerrain: SmartTerrain
): LuaMultiReturn<[IJobListDescriptor, string, TCount]> {
  const stalkerPatrolJobs: IJobListDescriptor = {
    priority: logicsConfig.JOBS.STALKER_PATROL.PRIORITY,
    jobs: new LuaTable(),
  };
  const smartTerrainName: TName = smartTerrain.name();

  let ltx: string = "";
  let index: TIndex = 1;

  while (level.patrol_path_exists(`${smartTerrainName}_patrol_${index}_walk`)) {
    const wayName = `${smartTerrainName}_patrol_${index}_walk`;
    const ptr = new patrol(wayName);
    const wpProp = parseWaypointData(wayName, ptr.flags(0), ptr.name(0));
    let jobCount = 3;

    if (wpProp.count !== null) {
      jobCount = wpProp.count as TCount;
    }

    for (const i of $range(1, jobCount)) {
      table.insert(stalkerPatrolJobs.jobs, {
        priority: logicsConfig.JOBS.STALKER_PATROL.PRIORITY,
        job_id: {
          section: `logic@${wayName}`,
          job_type: EJobType.PATH_JOB,
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
            precondParams.is_safe_job = isJobPatrolInRestrictor(smart, smart.safeRestrictor, wayName);
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
      jobLtx += `path_look = patrol_${index}_look\n`;
    }

    if (
      smartTerrain.safeRestrictor !== null &&
      isJobPatrolInRestrictor(smartTerrain, smartTerrain.safeRestrictor, wayName)
    ) {
      jobLtx += "invulnerable = {=npc_in_zone(smart.safe_restr)} true\n";
    }

    if (smartTerrain.defendRestrictor !== null) {
      jobLtx += `out_restr = ${smartTerrain.defendRestrictor}\n`;
    }

    ltx += jobLtx;
    index += 1;
  }

  return $multi(stalkerPatrolJobs, ltx, index);
}