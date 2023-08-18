import { level } from "xray16";

import { SmartTerrain } from "@/engine/core/objects";
import { isInTimeInterval } from "@/engine/core/utils/game";
import { isJobPatrolInRestrictor } from "@/engine/core/utils/job/job_check";
import { jobPreconditionSleep } from "@/engine/core/utils/job/job_precondition";
import { EJobPathType, EJobType, ISmartTerrainJobDescriptor } from "@/engine/core/utils/job/job_types";
import { logicsConfig } from "@/engine/lib/configs/LogicsConfig";
import { communities } from "@/engine/lib/constants/communities";
import { AnyObject, LuaArray, ServerHumanObject, TCount, TIndex, TName } from "@/engine/lib/types";

/**
 * Create sleep jobs for stalkers in smart terrain.
 *
 * @param smartTerrain - smart terrain to create default sleep jobs for
 * @param jobsList - list of jobs to insert new data into
 * @returns surge jobs list, generated LTX and count of created jobs
 */
export function createStalkerSleepJobs(
  smartTerrain: SmartTerrain,
  jobsList: LuaArray<ISmartTerrainJobDescriptor>
): LuaMultiReturn<[LuaArray<ISmartTerrainJobDescriptor>, string]> {
  const smartTerrainName: TName = smartTerrain.name();

  let ltx: string = "";
  let it: TIndex = 1;

  while (level.patrol_path_exists(`${smartTerrainName}_sleep_${it}`)) {
    const wayName: TName = `${smartTerrainName}_sleep_${it}`;

    table.insert(jobsList, {
      type: EJobType.SLEEP,
      isMonsterJob: false,
      priority: logicsConfig.JOBS.STALKER_SLEEP.PRIORITY,
      section: `logic@${wayName}`,
      pathType: EJobPathType.PATH,
      preconditionParameters: { wayName },
      preconditionFunction: jobPreconditionSleep,
    });

    let jobLtx: string =
      `[logic@${wayName}]\n` + `active = sleeper@${wayName}\n` + `[sleeper@${wayName}]\n` + `path_main = sleep_${it}\n`;

    if (
      smartTerrain.safeRestrictor !== null &&
      isJobPatrolInRestrictor(smartTerrain, smartTerrain.safeRestrictor, wayName)
    ) {
      jobLtx += "invulnerable = {=npc_in_zone(smart.safe_restr)} true\n";
    }

    if (smartTerrain.defendRestrictor !== null) {
      jobLtx += `out_restr = ${smartTerrain.defendRestrictor}\n`;
    }

    if (
      smartTerrain.smartTerrainActorControl !== null &&
      smartTerrain.smartTerrainActorControl.ignoreZone !== null &&
      isJobPatrolInRestrictor(smartTerrain, smartTerrain.smartTerrainActorControl.ignoreZone, wayName)
    ) {
      jobLtx +=
        "combat_ignore_cond = {=npc_in_zone(smart.base_on_actor_control.ignore_zone)} true\n" +
        "combat_ignore_keep_when_attacked = true\n";
    }

    ltx += jobLtx;
    it += 1;
  }

  return $multi(jobsList, ltx);
}
