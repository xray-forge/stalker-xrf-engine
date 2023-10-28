import { level, patrol } from "xray16";

import { EStalkerState } from "@/engine/core/animation/types";
import { jobPreconditionCamper } from "@/engine/core/objects/smart_terrain/job/job_precondition";
import { EJobPathType, EJobType, TSmartTerrainJobsList } from "@/engine/core/objects/smart_terrain/job/job_types";
import type { SmartTerrain } from "@/engine/core/objects/smart_terrain/SmartTerrain";
import { smartTerrainConfig } from "@/engine/core/objects/smart_terrain/SmartTerrainConfig";
import { IWaypointData, parseWaypointData } from "@/engine/core/utils/ini";
import { StringBuilder } from "@/engine/core/utils/string";
import { Patrol, TDistance, TIndex, TName } from "@/engine/lib/types";

/**
 * Create camper jobs for stalkers in smart terrain.
 *
 * @param smartTerrain - smart terrain to create default animpoint jobs for
 * @param jobs - list of smart terrain jobs to insert into
 * @param builder - builder of large ltx file
 * @returns cover jobs list and updated string builder
 */
export function createStalkerCamperJobs(
  smartTerrain: SmartTerrain,
  jobs: TSmartTerrainJobsList,
  builder: StringBuilder
): LuaMultiReturn<[TSmartTerrainJobsList, StringBuilder]> {
  const smartTerrainName: TName = smartTerrain.name();

  let index: TIndex = 1;

  while (level.patrol_path_exists(string.format("%s_camper_%s_walk", smartTerrainName, index))) {
    const patrolName: TName = string.format("%s_camper_%s_walk", smartTerrainName, index);
    const jobPatrol: Patrol = new patrol(patrolName);
    const waypointData: IWaypointData = parseWaypointData(patrolName, jobPatrol.flags(0), jobPatrol.name(0));

    let state: TName = EStalkerState.HIDE;
    let radius: TDistance = 0;

    if (waypointData.state !== null) {
      if (waypointData.state === "stand") {
        state = EStalkerState.THREAT;
      }
    }

    if (waypointData.radius !== null) {
      radius = waypointData.radius as TDistance;
    }

    table.insert(jobs, {
      type: EJobType.CAMPER,
      isMonsterJob: false,
      priority: smartTerrainConfig.JOBS.STALKER_CAMPER.PRIORITY,
      section: string.format("logic@%s", patrolName),
      pathType: EJobPathType.PATH,
      preconditionParameters: { wayName: patrolName },
      preconditionFunction: jobPreconditionCamper,
    });

    builder.append(
      string.format(
        `[logic@%s]
active = camper@%s
[camper@%s]
meet = meet@generic_lager
radius = %s
path_walk = camper_%s_walk
def_state_moving = rush
def_state_campering = %s
def_state_campering_fire = %s_fire
`,
        patrolName,
        patrolName,
        patrolName,
        radius,
        index,
        state,
        state
      )
    );

    if (level.patrol_path_exists(string.format("%s_camper_%s_look", smartTerrainName, index))) {
      builder.append(string.format("path_look = camper_%s_look\n", index));
    }

    if (smartTerrain.defendRestrictor !== null) {
      builder.append(string.format("out_restr = %s\n", smartTerrain.defendRestrictor));
    }

    index += 1;
  }

  return $multi(jobs, builder);
}
