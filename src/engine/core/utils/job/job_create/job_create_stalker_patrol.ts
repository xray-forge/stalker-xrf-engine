import { level, patrol } from "xray16";

import { SmartTerrain } from "@/engine/core/objects/server/smart_terrain";
import { IWaypointData, parseWaypointData } from "@/engine/core/utils/ini";
import { jobPreconditionPatrol } from "@/engine/core/utils/job/job_precondition";
import { EJobPathType, EJobType, TSmartTerrainJobsList } from "@/engine/core/utils/job/job_types";
import { isPatrolInRestrictor } from "@/engine/core/utils/patrol";
import { StringBuilder } from "@/engine/core/utils/string";
import { logicsConfig } from "@/engine/lib/configs/LogicsConfig";
import { Patrol, TCount, TIndex, TName } from "@/engine/lib/types";

/**
 * Create patrol jobs for stalkers in smart terrain.
 *
 * @param smartTerrain - smart terrain to create default animpoint jobs for
 * @param jobs - list of smart terrain jobs to insert into
 * @param builder - builder of large ltx file
 * @returns cover jobs list and updated string builder
 */
export function createStalkerPatrolJobs(
  smartTerrain: SmartTerrain,
  jobs: TSmartTerrainJobsList,
  builder: StringBuilder
): LuaMultiReturn<[TSmartTerrainJobsList, StringBuilder]> {
  const smartTerrainName: TName = smartTerrain.name();

  let index: TIndex = 1;

  while (level.patrol_path_exists(string.format("%s_patrol_%s_walk", smartTerrainName, index))) {
    const wayName: TName = string.format("%s_patrol_%s_walk", smartTerrainName, index);
    const ptr: Patrol = new patrol(wayName);
    const wpProp: IWaypointData = parseWaypointData(wayName, ptr.flags(0), ptr.name(0));
    let jobCount: TCount = 3;

    if (wpProp.count) {
      jobCount = wpProp.count as TCount;
    }

    for (const i of $range(1, jobCount)) {
      table.insert(jobs, {
        type: EJobType.PATROL,
        isMonsterJob: false,
        priority: logicsConfig.JOBS.STALKER_PATROL.PRIORITY,
        section: string.format("logic@%s", wayName),
        pathType: EJobPathType.PATH,
        preconditionParameters: {
          wayName,
        },
        preconditionFunction: jobPreconditionPatrol,
      });
    }

    builder.append(
      string.format(
        `[logic@%s]
active = patrol@%s
[patrol@%s]
meet = meet@generic_lager
formation = back
path_walk = patrol_%s_walk
on_signal = end|%%=search_gulag_job%%
`,
        wayName,
        wayName,
        wayName,
        index
      )
    );

    if (level.patrol_path_exists(string.format("%s_patrol_%s_look", smartTerrainName, index))) {
      builder.append(string.format("path_look = patrol_%s_look\n", index));
    }

    if (smartTerrain.safeRestrictor !== null && isPatrolInRestrictor(smartTerrain.safeRestrictor, wayName)) {
      builder.append("invulnerable = {=npc_in_zone(smart.safe_restr)} true\n");
    }

    if (smartTerrain.defendRestrictor !== null) {
      builder.append(string.format("out_restr = %s\n", smartTerrain.defendRestrictor));
    }

    index += 1;
  }

  return $multi(jobs, builder);
}
