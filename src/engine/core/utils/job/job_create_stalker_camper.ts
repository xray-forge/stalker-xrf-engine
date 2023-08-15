import { level, patrol } from "xray16";

import { SmartTerrain } from "@/engine/core/objects";
import { EStalkerState } from "@/engine/core/objects/animation";
import { IWaypointData, parseWaypointData } from "@/engine/core/utils/ini";
import { isAccessibleJob } from "@/engine/core/utils/job/job_check";
import { IJobListDescriptor } from "@/engine/core/utils/job/job_types";
import { logicsConfig } from "@/engine/lib/configs/LogicsConfig";
import { AnyObject, EJobType, Patrol, ServerHumanObject, TCount, TIndex, TName } from "@/engine/lib/types";

/**
 * todo;
 */
export function createStalkerCamperJobs(
  smartTerrain: SmartTerrain
): LuaMultiReturn<[IJobListDescriptor, string, TCount]> {
  const smartTerrainName: TName = smartTerrain.name();
  const stalkerDefCamper: IJobListDescriptor = {
    priority: logicsConfig.JOBS.STALKER_CAMPER.PRIORITY,
    jobs: new LuaTable(),
  };

  let ltx: string = "";
  let index: TIndex = 1;

  while (level.patrol_path_exists(smartTerrainName + "_camper_" + index + "_walk")) {
    const wayName: TName = smartTerrainName + "_camper_" + index + "_walk";
    const ptr: Patrol = new patrol(wayName);
    const wpProp: IWaypointData = parseWaypointData(wayName, ptr.flags(0), ptr.name(0));
    let state: TName = EStalkerState.HIDE;
    let radius = 0;

    if (wpProp.state !== null) {
      if (wpProp.state === "stand") {
        state = EStalkerState.THREAT;
      }
    }

    if (wpProp.radius !== null) {
      radius = wpProp.radius as number;
    }

    table.insert(stalkerDefCamper.jobs, {
      priority: logicsConfig.JOBS.STALKER_CAMPER.PRIORITY,
      job_id: {
        section: `logic@${wayName}`,
        job_type: EJobType.PATH_JOB,
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

    if (level.patrol_path_exists(`${smartTerrainName}_camper_${index}_look`)) {
      jobLtx += `path_look = camper_${index}_look\n`;
    }

    if (smartTerrain.defendRestrictor !== null) {
      jobLtx += `out_restr = ${smartTerrain.defendRestrictor}\n`;
    }

    ltx += jobLtx;
    index += 1;
  }

  return $multi(stalkerDefCamper, ltx, index);
}
