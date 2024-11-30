import { level, patrol } from "xray16";

import { jobPreconditionPatrol } from "@/engine/core/objects/smart_terrain/job/job_precondition";
import { EJobPathType, EJobType, TSmartTerrainJobsList } from "@/engine/core/objects/smart_terrain/job/job_types";
import type { SmartTerrain } from "@/engine/core/objects/smart_terrain/SmartTerrain";
import { smartTerrainConfig } from "@/engine/core/objects/smart_terrain/SmartTerrainConfig";
import { IWaypointData, parseWaypointData } from "@/engine/core/utils/ini";
import { isPatrolInRestrictor } from "@/engine/core/utils/patrol";
import { StringBuilder } from "@/engine/core/utils/string";
import { Patrol, TCount, TIndex, TName } from "@/engine/lib/types";

/**
 * Create patrol jobs for stalkers in smart terrain.
 *
 * @param terrain - smart terrain to create default animpoint jobs for
 * @param jobs - list of smart terrain jobs to insert into
 * @param builder - builder of large ltx file
 * @returns cover jobs list and updated string builder
 */
export function createStalkerPatrolJobs(
  terrain: SmartTerrain,
  jobs: TSmartTerrainJobsList,
  builder: StringBuilder
): LuaMultiReturn<[TSmartTerrainJobsList, StringBuilder]> {
  const smartTerrainName: TName = terrain.name();

  let index: TIndex = 1;

  while (level.patrol_path_exists(string.format("%s_patrol_%s_walk", smartTerrainName, index))) {
    const patrolName: TName = string.format("%s_patrol_%s_walk", smartTerrainName, index);
    const jobPatrol: Patrol = new patrol(patrolName);
    const waypointData: IWaypointData = parseWaypointData(patrolName, jobPatrol.flags(0), jobPatrol.name(0));

    let jobCount: TCount = 3;

    if (waypointData.count) {
      jobCount = waypointData.count as TCount;
    }

    for (const i of $range(1, jobCount)) {
      table.insert(jobs, {
        type: EJobType.PATROL,
        isMonsterJob: false,
        priority: smartTerrainConfig.JOBS.STALKER_PATROL.PRIORITY,
        section: string.format("logic@%s", patrolName),
        pathType: EJobPathType.PATH,
        preconditionParameters: {
          wayName: patrolName,
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
        patrolName,
        patrolName,
        patrolName,
        index
      )
    );

    if (level.patrol_path_exists(string.format("%s_patrol_%s_look", smartTerrainName, index))) {
      builder.append(string.format("path_look = patrol_%s_look\n", index));
    }

    if (terrain.safeRestrictor !== null && isPatrolInRestrictor(terrain.safeRestrictor, patrolName)) {
      builder.append("invulnerable = {=npc_in_zone(smart.safe_restr)} true\n");
    }

    if (terrain.defendRestrictor !== null) {
      builder.append(string.format("out_restr = %s\n", terrain.defendRestrictor));
    }

    index += 1;
  }

  return $multi(jobs, builder);
}
