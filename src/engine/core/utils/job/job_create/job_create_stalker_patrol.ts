import { level, patrol } from "xray16";

import { SmartTerrain } from "@/engine/core/objects";
import { IWaypointData, parseWaypointData } from "@/engine/core/utils/ini";
import { isJobPatrolInRestrictor } from "@/engine/core/utils/job/job_check";
import { jobPreconditionPatrol } from "@/engine/core/utils/job/job_precondition";
import { EJobPathType, EJobType, ISmartTerrainJobDescriptor } from "@/engine/core/utils/job/job_types";
import { logicsConfig } from "@/engine/lib/configs/LogicsConfig";
import { LuaArray, Patrol, TCount, TIndex, TName } from "@/engine/lib/types";

/**
 * todo;
 */
export function createStalkerPatrolJobs(
  smartTerrain: SmartTerrain,
  jobsList: LuaArray<ISmartTerrainJobDescriptor>
): LuaMultiReturn<[LuaArray<ISmartTerrainJobDescriptor>, string]> {
  const smartTerrainName: TName = smartTerrain.name();

  let ltx: string = "";
  let index: TIndex = 1;

  while (level.patrol_path_exists(`${smartTerrainName}_patrol_${index}_walk`)) {
    const wayName: TName = `${smartTerrainName}_patrol_${index}_walk`;
    const ptr: Patrol = new patrol(wayName);
    const wpProp: IWaypointData = parseWaypointData(wayName, ptr.flags(0), ptr.name(0));
    let jobCount: TCount = 3;

    if (wpProp.count) {
      jobCount = wpProp.count as TCount;
    }

    for (const i of $range(1, jobCount)) {
      table.insert(jobsList, {
        type: EJobType.PATROL,
        isMonsterJob: false,
        priority: logicsConfig.JOBS.STALKER_PATROL.PRIORITY,
        section: `logic@${wayName}`,
        pathType: EJobPathType.PATH,
        preconditionParameters: {
          wayName,
        },
        preconditionFunction: jobPreconditionPatrol,
      });
    }

    let jobLtx: string =
      `[logic@${wayName}]\n` +
      `active = patrol@${wayName}\n` +
      `[patrol@${wayName}]\n` +
      "meet = meet@generic_lager\n" +
      "formation = back\n" +
      `path_walk = patrol_${index}_walk\n` +
      "on_signal = end|%=search_gulag_job%\n";

    if (level.patrol_path_exists(`${smartTerrainName}_patrol_${index}_look`)) {
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

  return $multi(jobsList, ltx);
}
