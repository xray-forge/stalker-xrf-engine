import { level } from "xray16";

import { SmartTerrain } from "@/engine/core/objects";
import { isJobPatrolInRestrictor } from "@/engine/core/utils/job/job_check";
import { IJobListDescriptor } from "@/engine/core/utils/job/job_types";
import { logicsConfig } from "@/engine/lib/configs/LogicsConfig";
import { AnyObject, EJobType, ServerObject, TCount, TIndex, TName } from "@/engine/lib/types";

/**
 * todo;
 */
export function createStalkerWalkerJobs(
  smartTerrain: SmartTerrain
): LuaMultiReturn<[IJobListDescriptor, string, TCount]> {
  const smartTerrainName: TName = smartTerrain.name();
  const stalkerWalker: IJobListDescriptor = {
    priority: logicsConfig.JOBS.STALKER_WALKER.PRIORITY,
    jobs: new LuaTable(),
  };

  let index: TIndex = 1;
  let ltx: string = "";

  while (level.patrol_path_exists(`${smartTerrainName}_walker_${index}_walk`)) {
    const wayName: TName = `${smartTerrainName}_walker_${index}_walk`;

    table.insert(stalkerWalker.jobs, {
      priority: logicsConfig.JOBS.STALKER_WALKER.PRIORITY,
      job_id: {
        section: `logic@${wayName}`,
        job_type: EJobType.PATH_JOB,
      },
      preconditionParameters: {},
      preconditionFunction: (
        serverObject: ServerObject,
        smartTerrain: SmartTerrain,
        precondParams: AnyObject
      ): boolean => {
        if (smartTerrain.alarmStartedAt === null) {
          return true;
        } else if (smartTerrain.safeRestrictor === null) {
          return true;
        }

        if (precondParams.is_safe_job === null) {
          precondParams.is_safe_job = isJobPatrolInRestrictor(smartTerrain, smartTerrain.safeRestrictor, wayName);
        }

        return precondParams.is_safe_job !== false;
      },
    });

    let jobLtx: string =
      `[logic@${wayName}]\n` +
      `active = walker@${wayName}\n` +
      `[walker@${wayName}]\n` +
      "sound_idle = state\n" +
      "meet = meet@generic_lager\n" +
      `path_walk = walker_${index}_walk\n` +
      "def_state_standing = guard\n" +
      "def_state_moving = patrol\n";

    if (level.patrol_path_exists(`${smartTerrainName}_walker_${index}_look`)) {
      jobLtx += `path_look = walker_${index}_look\n`;
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
    index += 1;
  }

  return $multi(stalkerWalker, ltx, index - 1);
}
