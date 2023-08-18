import { level, patrol } from "xray16";

import { SmartTerrain } from "@/engine/core/objects";
import { EStalkerState } from "@/engine/core/objects/animation";
import { IWaypointData, parseWaypointData } from "@/engine/core/utils/ini";
import { isAccessibleJob } from "@/engine/core/utils/job/job_check";
import { jobPreconditionSniper } from "@/engine/core/utils/job/job_precondition";
import { EJobPathType, EJobType, ISmartTerrainJobDescriptor } from "@/engine/core/utils/job/job_types";
import { logicsConfig } from "@/engine/lib/configs/LogicsConfig";
import { communities } from "@/engine/lib/constants/communities";
import { AnyObject, LuaArray, Patrol, ServerHumanObject, TCount, TIndex, TName } from "@/engine/lib/types";

/**
 * todo;
 */
export function createStalkerSniperJobs(
  smartTerrain: SmartTerrain,
  jobsList: LuaArray<ISmartTerrainJobDescriptor>
): LuaMultiReturn<[LuaArray<ISmartTerrainJobDescriptor>, string]> {
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

    table.insert(jobsList, {
      type: EJobType.SNIPER,
      isMonsterJob: false,
      priority: logicsConfig.JOBS.STALKER_SNIPER.PRIORITY,
      section: `logic@${wayName}`,
      pathType: EJobPathType.PATH,
      preconditionParameters: { wayName: wayName },
      preconditionFunction: jobPreconditionSniper,
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

  return $multi(jobsList, ltx);
}
