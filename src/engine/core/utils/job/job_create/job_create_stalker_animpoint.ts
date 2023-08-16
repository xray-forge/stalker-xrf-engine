import { registry } from "@/engine/core/database";
import { SmartTerrain } from "@/engine/core/objects";
import { isJobPatrolInRestrictor } from "@/engine/core/utils/job/job_check";
import { IJobListDescriptor } from "@/engine/core/utils/job/job_types";
import { logicsConfig } from "@/engine/lib/configs/LogicsConfig";
import { communities } from "@/engine/lib/constants/communities";
import { AnyObject, EJobType, ServerHumanObject, TCount, TIndex, TName } from "@/engine/lib/types";

/**
 * Create animpoint jobs for stalkers in smart terrain.
 *
 * @param smartTerrain - smart terrain to create default animpoint jobs for
 * @returns cover jobs list, generated LTX and count of created jobs
 */
export function createStalkerAnimpointJobs(
  smartTerrain: SmartTerrain,
  stalkerJobs: IJobListDescriptor
): LuaMultiReturn<[IJobListDescriptor, string, TCount]> {
  const smartTerrainName: TName = smartTerrain.name();

  let ltx: string = "";
  let index: TIndex = 1;

  while (registry.smartCovers.get(`${smartTerrainName}_animpoint_${index}`) !== null) {
    const smartCoverName: TName = `${smartTerrainName}_animpoint_${index}`;

    table.insert(stalkerJobs.jobs, {
      priority: logicsConfig.JOBS.STALKER_ANIMPOINT.PRIORITY,
      jobId: {
        section: `logic@${smartCoverName}`,
        jobType: EJobType.SMART_COVER_JOB,
      },
      preconditionParameters: {},
      preconditionFunction: (
        serverObject: ServerHumanObject,
        smartTerrain: SmartTerrain,
        precondParams: AnyObject
      ): boolean => {
        return serverObject.community() !== communities.zombied;
      },
    });

    let jobLtx: string =
      `[logic@${smartCoverName}]\n` +
      `active = animpoint@${smartCoverName}\n` +
      `[animpoint@${smartCoverName}]\n` +
      "meet = meet@generic_animpoint\n" +
      `cover_name = ${smartCoverName}\n`;

    if (smartTerrain.defendRestrictor !== null) {
      jobLtx += `out_restr = ${smartTerrain.defendRestrictor}\n`;
    }

    // todo: Bad path name?
    if (
      smartTerrain.safeRestrictor !== null &&
      isJobPatrolInRestrictor(smartTerrain, smartTerrain.safeRestrictor, null as any)
    ) {
      jobLtx += "invulnerable = {=npc_in_zone(smart.safe_restr)} true\n";
    }

    if (smartTerrain.smartTerrainActorControl !== null && smartTerrain.smartTerrainActorControl.ignoreZone !== null) {
      jobLtx +=
        "combat_ignore_cond = {=npc_in_zone(smart.base_on_actor_control.ignore_zone)} true\n" +
        "combat_ignore_keep_when_attacked = true\n";
    }

    ltx += jobLtx;
    index += 1;
  }

  return $multi(stalkerJobs, ltx, index - 1);
}
