import { registry } from "@/engine/core/database";
import { SmartTerrain } from "@/engine/core/objects";
import { isJobPatrolInRestrictor } from "@/engine/core/utils/job/job_check";
import { jobPreconditionAnimpoint } from "@/engine/core/utils/job/job_precondition";
import { EJobPathType, EJobType, ISmartTerrainJobDescriptor } from "@/engine/core/utils/job/job_types";
import { logicsConfig } from "@/engine/lib/configs/LogicsConfig";
import { communities } from "@/engine/lib/constants/communities";
import { AnyObject, LuaArray, ServerHumanObject, TCount, TIndex, TName } from "@/engine/lib/types";

/**
 * Create animpoint jobs for stalkers in smart terrain.
 *
 * @param smartTerrain - smart terrain to create default animpoint jobs for
 * @returns cover jobs list, generated LTX and count of created jobs
 */
export function createStalkerAnimpointJobs(
  smartTerrain: SmartTerrain,
  jobsList: LuaArray<ISmartTerrainJobDescriptor>
): LuaMultiReturn<[LuaArray<ISmartTerrainJobDescriptor>, string, TCount]> {
  const smartTerrainName: TName = smartTerrain.name();

  let ltx: string = "";
  let index: TIndex = 1;

  while (registry.smartCovers.get(`${smartTerrainName}_animpoint_${index}`) !== null) {
    const smartCoverName: TName = `${smartTerrainName}_animpoint_${index}`;

    table.insert(jobsList, {
      type: EJobType.ANIMPOINT,
      isMonsterJob: false,
      priority: logicsConfig.JOBS.STALKER_ANIMPOINT.PRIORITY,
      section: `logic@${smartCoverName}`,
      pathType: EJobPathType.SMART_COVER,
      preconditionParameters: {},
      preconditionFunction: jobPreconditionAnimpoint,
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

  return $multi(jobsList, ltx, index - 1);
}
