import { level } from "xray16";

import { IRegistryObjectState, registry } from "@/engine/core/database";
import { SmartTerrain } from "@/engine/core/objects";
import { isJobPatrolInRestrictor } from "@/engine/core/utils/job/job_check";
import { IJobListDescriptor } from "@/engine/core/utils/job/job_types";
import { logicsConfig } from "@/engine/lib/configs/LogicsConfig";
import { communities } from "@/engine/lib/constants/communities";
import {
  AnyObject,
  ClientObject,
  EJobType,
  Optional,
  ServerHumanObject,
  TCount,
  TIndex,
  TName,
} from "@/engine/lib/types";

/**
 * todo;
 */
export function createStalkerCollectorJobs(
  smartTerrain: SmartTerrain
): LuaMultiReturn<[IJobListDescriptor, string, TCount]> {
  const smartTerrainName: TName = smartTerrain.name();
  const collectorJobs: IJobListDescriptor = {
    priority: logicsConfig.JOBS.STALKER_COLLECTOR.PRIORITY,
    jobs: new LuaTable(),
  };

  let index: TIndex = 1;
  let ltx: string = "";

  // todo: While and single insert?
  while (level.patrol_path_exists(`${smartTerrainName}_collector_${index}_walk`)) {
    const wayName: TName = `${smartTerrainName}_collector_${index}_walk`;

    table.insert(collectorJobs.jobs, {
      priority: logicsConfig.JOBS.STALKER_COLLECTOR.PRIORITY,
      job_id: {
        section: `logic@${wayName}`,
        job_type: EJobType.PATH_JOB,
      },
      _precondition_params: {},
      _precondition_function: (
        serverObject: ServerHumanObject,
        smart: SmartTerrain,
        precondParams: AnyObject
      ): boolean => {
        if (serverObject.community() === communities.zombied) {
          return false;
        }

        const state: Optional<IRegistryObjectState> = registry.objects.get(serverObject.id);

        if (state === null) {
          return false;
        }

        const object: Optional<ClientObject> = state.object!;

        if (object === null) {
          return false;
        }

        const detectors = ["detector_simple", "detector_advanced", "detector_elite", "detector_scientific"];

        for (const [k, v] of detectors) {
          const obj = object.object(v);

          if (obj !== null) {
            return true;
          }
        }

        return false;
      },
    });

    let jobLtx: string =
      "[logic@" +
      wayName +
      "]\n" +
      "active = walker@" +
      wayName +
      "\n" +
      "[walker@" +
      wayName +
      "]\n" +
      "sound_idle = state\n" +
      "meet = meet@generic_lager\n" +
      "path_walk = collector_" +
      index +
      "_walk\n" +
      "def_state_standing = guard\n" +
      "def_state_moving = patrol\n";

    if (level.patrol_path_exists(`${smartTerrainName}_collector_${index}_look`)) {
      jobLtx += `path_look = collector_${index}_look\n`;
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
        "combat_ignore_cond = {=npc_in_zone(smart.base_on_actor_control.ignore_zone)} true \n" +
        "combat_ignore_keep_when_attacked = true \n";
    }

    ltx += jobLtx;
    index += 1;
  }

  return $multi(collectorJobs, ltx, index);
}
