import { level } from "xray16";

import { SurgeManager } from "@/engine/core/managers/world/SurgeManager";
import { SmartTerrain } from "@/engine/core/objects";
import { isJobPatrolInRestrictor } from "@/engine/core/utils/job/job_check";
import { jobPreconditionSurge } from "@/engine/core/utils/job/job_precondition";
import { EJobPathType, EJobType, ISmartTerrainJobDescriptor } from "@/engine/core/utils/job/job_types";
import { logicsConfig } from "@/engine/lib/configs/LogicsConfig";
import { LuaArray, TCount, TIndex, TName } from "@/engine/lib/types";

/**
 * Create surge walk/look jobs for stalkers in smart terrain.
 *
 * @param smartTerrain - smart terrain to create default surge jobs for
 * @param jobsList - list of jobs to insert data in
 * @returns surge jobs list, generated LTX and count of created jobs
 */
export function createStalkerSurgeJobs(
  smartTerrain: SmartTerrain,
  jobsList: LuaArray<ISmartTerrainJobDescriptor>
): LuaMultiReturn<[LuaArray<ISmartTerrainJobDescriptor>, string]> {
  const smartTerrainName: TName = smartTerrain.name();

  let ltx: string = "";
  let it: TIndex = 1;

  while (level.patrol_path_exists(`${smartTerrainName}_surge_${it}_walk`)) {
    const wayName: TName = `${smartTerrainName}_surge_${it}_walk`;

    table.insert(jobsList, {
      type: EJobType.SURGE,
      isMonsterJob: false,
      priority: logicsConfig.JOBS.STALKER_SURGE.PRIORITY,
      section: `logic@${wayName}`,
      pathType: EJobPathType.PATH,
      preconditionParameters: {},
      preconditionFunction: jobPreconditionSurge,
    });

    let jobLtx: string =
      `[logic@${wayName}]\n` +
      `active = walker@${wayName}\n` +
      `[walker@${wayName}]\n` +
      "sound_idle = state\n" +
      "use_camp = true\n" +
      "meet = meet@generic_lager\n" +
      `path_walk = surge_${it}_walk\n` +
      "def_state_standing = guard\n" +
      "def_state_moving = patrol\n";

    // Add linked look patrols.
    if (level.patrol_path_exists(`${smartTerrainName}_surge_${it}_look`)) {
      jobLtx += `path_look = surge_${it}_look\n`;
    }

    // Check for defend position restrictions.
    if (smartTerrain.defendRestrictor !== null) {
      jobLtx += `out_restr = ${smartTerrain.defendRestrictor}\n`;
    }

    // Check for combat ignore restrictions.
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
