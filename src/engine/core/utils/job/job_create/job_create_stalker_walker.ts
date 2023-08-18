import { level } from "xray16";

import { SmartTerrain } from "@/engine/core/objects";
import { isJobPatrolInRestrictor } from "@/engine/core/utils/job/job_check";
import { jobPreconditionWalker } from "@/engine/core/utils/job/job_precondition";
import { EJobPathType, EJobType, ISmartTerrainJobDescriptor } from "@/engine/core/utils/job/job_types";
import { logicsConfig } from "@/engine/lib/configs/LogicsConfig";
import { LuaArray, TIndex, TName } from "@/engine/lib/types";

/**
 * todo;
 */
export function createStalkerWalkerJobs(
  smartTerrain: SmartTerrain,
  jobsList: LuaArray<ISmartTerrainJobDescriptor>
): LuaMultiReturn<[LuaArray<ISmartTerrainJobDescriptor>, string]> {
  const smartTerrainName: TName = smartTerrain.name();

  let index: TIndex = 1;
  let ltx: string = "";

  while (level.patrol_path_exists(`${smartTerrainName}_walker_${index}_walk`)) {
    const wayName: TName = `${smartTerrainName}_walker_${index}_walk`;

    table.insert(jobsList, {
      type: EJobType.WALKER,
      isMonsterJob: false,
      priority: logicsConfig.JOBS.STALKER_WALKER.PRIORITY,
      section: `logic@${wayName}`,
      pathType: EJobPathType.PATH,
      preconditionParameters: { wayName },
      preconditionFunction: jobPreconditionWalker,
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

  return $multi(jobsList, ltx);
}
