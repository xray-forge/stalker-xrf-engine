import { level, patrol } from "xray16";

import { EStalkerState } from "@/engine/core/objects/animation";
import { SmartTerrain } from "@/engine/core/objects/server/smart_terrain";
import { IWaypointData, parseWaypointData } from "@/engine/core/utils/ini";
import { jobPreconditionCamper } from "@/engine/core/utils/job/job_precondition";
import { EJobPathType, EJobType, TSmartTerrainJobsList } from "@/engine/core/utils/job/job_types";
import { StringBuilder } from "@/engine/core/utils/string";
import { logicsConfig } from "@/engine/lib/configs/LogicsConfig";
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
    const wayName: TName = string.format("%s_camper_%s_walk", smartTerrainName, index);
    const smartPatrol: Patrol = new patrol(wayName);
    const waypoint: IWaypointData = parseWaypointData(wayName, smartPatrol.flags(0), smartPatrol.name(0));

    let state: TName = EStalkerState.HIDE;
    let radius: TDistance = 0;

    if (waypoint.state !== null) {
      if (waypoint.state === "stand") {
        state = EStalkerState.THREAT;
      }
    }

    if (waypoint.radius !== null) {
      radius = waypoint.radius as TDistance;
    }

    table.insert(jobs, {
      type: EJobType.CAMPER,
      isMonsterJob: false,
      priority: logicsConfig.JOBS.STALKER_CAMPER.PRIORITY,
      section: string.format("logic@%s", wayName),
      pathType: EJobPathType.PATH,
      preconditionParameters: { wayName: wayName },
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
        wayName,
        wayName,
        wayName,
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
