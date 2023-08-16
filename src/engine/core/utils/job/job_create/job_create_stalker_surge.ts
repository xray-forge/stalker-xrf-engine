import { level } from "xray16";

import { SurgeManager } from "@/engine/core/managers/world/SurgeManager";
import { SmartTerrain } from "@/engine/core/objects";
import { isJobPatrolInRestrictor } from "@/engine/core/utils/job/job_check";
import { IJobListDescriptor } from "@/engine/core/utils/job/job_types";
import { logicsConfig } from "@/engine/lib/configs/LogicsConfig";
import { EJobType, TCount, TIndex, TName } from "@/engine/lib/types";

/**
 * Create surge walk/look jobs for stalkers in smart terrain.
 *
 * @param smartTerrain - smart terrain to create default surge jobs for
 * @returns surge jobs list, generated LTX and count of created jobs
 */
export function createStalkerSurgeJobs(
  smartTerrain: SmartTerrain
): LuaMultiReturn<[IJobListDescriptor, string, TCount]> {
  const smartTerrainName: TName = smartTerrain.name();
  const stalkerSurgeJobs: IJobListDescriptor = {
    priority: logicsConfig.JOBS.STALKER_SURGE.PRIORITY,
    jobs: new LuaTable(),
  };

  let ltx: string = "";
  let it: TIndex = 1;

  while (level.patrol_path_exists(`${smartTerrainName}_surge_${it}_walk`)) {
    const wayName: TName = `${smartTerrainName}_surge_${it}_walk`;

    table.insert(stalkerSurgeJobs.jobs, {
      priority: logicsConfig.JOBS.STALKER_SURGE.PRIORITY,
      job_id: {
        section: `logic@${wayName}`,
        job_type: EJobType.PATH_JOB,
      },
      preconditionParameters: {},
      preconditionFunction: () => SurgeManager.getInstance().isStarted,
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

  return $multi(stalkerSurgeJobs, ltx, it - 1);
}
