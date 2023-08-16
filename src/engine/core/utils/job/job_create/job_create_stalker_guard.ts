import { level } from "xray16";

import { SmartTerrain } from "@/engine/core/objects";
import { isJobPatrolInRestrictor } from "@/engine/core/utils/job/job_check";
import { IJobListDescriptor } from "@/engine/core/utils/job/job_types";
import { logicsConfig } from "@/engine/lib/configs/LogicsConfig";
import { AnyObject, EJobType, ServerHumanObject, TCount, TIndex, TName } from "@/engine/lib/types";

/**
 * todo;
 */
export function createStalkerGuardJobs(
  smartTerrain: SmartTerrain
): LuaMultiReturn<[IJobListDescriptor, string, TCount]> {
  const smartTerrainName: TName = smartTerrain.name();
  const stalkerGuard: IJobListDescriptor = { priority: logicsConfig.JOBS.STALKER_GUARD.PRIORITY, jobs: new LuaTable() };

  let ltx: string = "";
  let index: TIndex = 1;

  while (level.patrol_path_exists(`${smartTerrainName}_guard_${index}_walk`)) {
    const wayName: TName = `${smartTerrainName}_guard_${index}_walk`;

    table.insert(stalkerGuard.jobs, {
      priority: logicsConfig.JOBS.STALKER_GUARD.PRIORITY,
      jobId: {
        section: `logic@${wayName}`,
        jobType: EJobType.PATH_JOB,
      },
      preconditionParameters: {},
      preconditionFunction: (
        serverObject: ServerHumanObject,
        smartTerrain: SmartTerrain,
        parameters: AnyObject
      ): boolean => {
        if (smartTerrain.alarmStartedAt === null) {
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
      `[logic@${wayName}]\n` +
      `active = walker@${wayName}\n` +
      `[walker@${wayName}]\n` +
      "meet = meet@generic_lager\n" +
      `path_walk = guard_${index}_walk\n` +
      `path_look = guard_${index}_look\n`;

    if (
      smartTerrain.safeRestrictor !== null &&
      isJobPatrolInRestrictor(smartTerrain, smartTerrain.safeRestrictor, wayName)
    ) {
      jobLtx += "invulnerable = {=npc_in_zone(smart.safe_restr)} true\n";
    }

    if (smartTerrain.defendRestrictor !== null) {
      jobLtx += `out_restr = ${smartTerrain.defendRestrictor}\n`;
    }

    let job1Ltx: string =
      `[walker1@${wayName}]\n` +
      "meet = meet@generic_lager\n" +
      `path_walk = guard_${index}_walk\n` +
      `path_look = guard_${index}_look\n` +
      "def_state_standing = wait_na\n" +
      `on_info = {!is_obj_on_job(logic@follower_${wayName}:3)} walker@${wayName}\n` +
      `on_info2 = {=distance_to_obj_on_job_le(logic@follower_${wayName}:3)} remark@${wayName}\n`;

    if (
      smartTerrain.safeRestrictor !== null &&
      isJobPatrolInRestrictor(smartTerrain, smartTerrain.safeRestrictor, wayName)
    ) {
      job1Ltx += "invulnerable = {=npc_in_zone(smart.safe_restr)} true\n";
    }

    if (smartTerrain.defendRestrictor !== null) {
      job1Ltx += `out_restr = ${smartTerrain.defendRestrictor}\n`;
    }

    job1Ltx += `[remark@${wayName}]\n` + "anim = wait_na\n" + `target = logic@follower_${wayName}\n`;

    if (smartTerrain.defendRestrictor !== null) {
      job1Ltx += `out_restr = ${smartTerrain.defendRestrictor}\n`;
    }

    table.insert(stalkerGuard.jobs, {
      priority: logicsConfig.JOBS.STALKER_GUARD.PRIORITY_FOLLOWER,
      jobId: {
        section: `logic@follower_${wayName}`,
        jobType: EJobType.PATH_JOB,
      },
      preconditionParameters: { changing_job: `logic@${wayName}` },
      preconditionFunction: (
        serverObject: ServerHumanObject,
        smartTerrain: SmartTerrain,
        parameters: AnyObject,
        npcInfo: AnyObject
      ): boolean => {
        return npcInfo.need_job === parameters.changing_job;
      },
    });

    let followerLtx: string =
      `[logic@follower_${wayName}]\n` +
      `active = walker@follow_${wayName}\n` +
      `[walker@follow_${wayName}]\n` +
      "meet = meet@generic_lager\n" +
      `path_walk = guard_${index}_walk\n` +
      `path_look = guard_${index}_look\n` +
      `on_info = {=distance_to_obj_on_job_le(logic@${wayName}:3)} remark@follower_${wayName}\n`;

    if (smartTerrain.defendRestrictor !== null) {
      followerLtx += `out_restr = ${smartTerrain.defendRestrictor}\n`;
    }

    followerLtx +=
      `[remark@follower_${wayName}]\n` +
      "anim = wait_na\n" +
      `target = logic@${wayName}\n` +
      "on_timer = 2000 | %=switch_to_desired_job%\n";

    if (smartTerrain.defendRestrictor !== null) {
      followerLtx += `out_restr = ${smartTerrain.defendRestrictor}\n`;
    }

    ltx += jobLtx + job1Ltx + followerLtx;
    index += 1;
  }

  return $multi(stalkerGuard, ltx, index - 1);
}
