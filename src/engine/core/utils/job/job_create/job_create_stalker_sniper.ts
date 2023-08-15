import { level, patrol } from "xray16";

import { SmartTerrain } from "@/engine/core/objects";
import { EStalkerState } from "@/engine/core/objects/animation";
import { IWaypointData, parseWaypointData } from "@/engine/core/utils/ini";
import { isAccessibleJob } from "@/engine/core/utils/job/job_check";
import { IJobListDescriptor } from "@/engine/core/utils/job/job_types";
import { logicsConfig } from "@/engine/lib/configs/LogicsConfig";
import { communities } from "@/engine/lib/constants/communities";
import { AnyObject, EJobType, Patrol, ServerHumanObject, TCount, TIndex, TName } from "@/engine/lib/types";

/**
 * todo;
 */
export function createStalkerSniperJobs(
  smartTerrain: SmartTerrain
): LuaMultiReturn<[IJobListDescriptor, string, TCount]> {
  const stalkerDefSniper: IJobListDescriptor = {
    priority: logicsConfig.JOBS.STALKER_SNIPER.PRIORITY,
    jobs: new LuaTable(),
  };
  const smartTerrainName: TName = smartTerrain.name();

  let ltx: string = "";
  let index: TIndex = 1;

  while (level.patrol_path_exists(`${smartTerrainName}_sniper_${index}_walk`)) {
    const wayName: TName = `${smartTerrainName}_sniper_${index}_walk`;
    const ptr: Patrol = new patrol(wayName);
    const wpProp: IWaypointData = parseWaypointData(wayName, ptr.flags(0), ptr.name(0));
    let state: TName = EStalkerState.HIDE;

    if (wpProp.state !== null) {
      // todo: Add stand state?
      if (wpProp.state === "stand") {
        state = EStalkerState.THREAT;
      }
    }

    table.insert(stalkerDefSniper.jobs, {
      priority: logicsConfig.JOBS.STALKER_SNIPER.PRIORITY,
      job_id: {
        section: `logic@${wayName}`,
        job_type: EJobType.PATH_JOB,
      },
      _precondition_params: { way_name: wayName },
      _precondition_function: (
        serverObject: ServerHumanObject,
        smart: SmartTerrain,
        parameters: AnyObject
      ): boolean => {
        return serverObject.community() !== communities.zombied && isAccessibleJob(serverObject, parameters.way_name);
      },
    });

    let jobLtx: string =
      `[logic@${wayName}]\n` +
      `active = camper@${wayName}\n` +
      `[camper@${wayName}]\n` +
      "meet = meet@generic_lager\n" +
      `path_walk = sniper_${index}_walk\n` +
      `path_look = sniper_${index}_look\n` +
      "sniper = true\n" +
      `def_state_campering = ${state}\n` +
      `def_state_campering_fire = ${state}_fire\n`;

    if (smartTerrain.defendRestrictor !== null) {
      jobLtx += `out_restr = ${smartTerrain.defendRestrictor}\n`;
    }

    ltx += jobLtx;
    index += 1;
  }

  return $multi(stalkerDefSniper, ltx, index);
}
