import { level } from "xray16";

import { SmartTerrain } from "@/engine/core/objects";
import { isInTimeInterval } from "@/engine/core/utils/game";
import { isJobPatrolInRestrictor } from "@/engine/core/utils/job/job_check";
import { IJobListDescriptor } from "@/engine/core/utils/job/job_types";
import { logicsConfig } from "@/engine/lib/configs/LogicsConfig";
import { communities } from "@/engine/lib/constants/communities";
import { AnyObject, EJobType, ServerHumanObject, TCount, TIndex, TName } from "@/engine/lib/types";

/**
 * Create sleep jobs for stalkers in smart terrain.
 *
 * @param smartTerrain - smart terrain to create default sleep jobs for
 * @returns surge jobs list, generated LTX and count of created jobs
 */
export function createStalkerSleepJobs(
  smartTerrain: SmartTerrain
): LuaMultiReturn<[IJobListDescriptor, string, TCount]> {
  const sleepJobs: IJobListDescriptor = { priority: logicsConfig.JOBS.STALKER_SLEEP.PRIORITY, jobs: new LuaTable() };
  const smartTerrainName: TName = smartTerrain.name();

  let ltx: string = "";
  let it: TIndex = 1;

  while (level.patrol_path_exists(`${smartTerrainName}_sleep_${it}`)) {
    const wayName: TName = `${smartTerrainName}_sleep_${it}`;

    table.insert(sleepJobs.jobs, {
      priority: logicsConfig.JOBS.STALKER_SLEEP.PRIORITY,
      jobId: {
        section: `logic@${wayName}`,
        job_type: EJobType.PATH_JOB,
      },
      preconditionParameters: {},
      preconditionFunction: (
        serverObject: ServerHumanObject,
        smartTerrain: SmartTerrain,
        parameters: AnyObject
      ): boolean => {
        if (serverObject.community() === communities.zombied) {
          return false;
        } else if (!isInTimeInterval(21, 7)) {
          return false;
        } else if (smartTerrain.alarmStartedAt === null) {
          return true;
        } else if (smartTerrain.safeRestrictor === null) {
          return true;
        }

        if (parameters.is_safe_job === null) {
          parameters.is_safe_job = isJobPatrolInRestrictor(smartTerrain, smartTerrain.safeRestrictor, wayName);
        }

        return parameters.is_safe_job !== false;
      },
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

  return $multi(sleepJobs, ltx, it - 1);
}
