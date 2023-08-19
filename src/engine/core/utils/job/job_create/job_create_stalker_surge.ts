import { level } from "xray16";

import { SmartTerrain } from "@/engine/core/objects";
import { jobPreconditionSurge } from "@/engine/core/utils/job/job_precondition";
import { EJobPathType, EJobType, TSmartTerrainJobsList } from "@/engine/core/utils/job/job_types";
import { isPatrolInRestrictor } from "@/engine/core/utils/patrol";
import { StringBuilder } from "@/engine/core/utils/string";
import { logicsConfig } from "@/engine/lib/configs/LogicsConfig";
import { TIndex, TName } from "@/engine/lib/types";

/**
 * Create surge jobs for stalkers in smart terrain.
 *
 * @param smartTerrain - smart terrain to create default animpoint jobs for
 * @param jobs - list of smart terrain jobs to insert into
 * @param builder - builder of large ltx file
 * @returns cover jobs list and updated string builder
 */
export function createStalkerSurgeJobs(
  smartTerrain: SmartTerrain,
  jobs: TSmartTerrainJobsList,
  builder: StringBuilder
): LuaMultiReturn<[TSmartTerrainJobsList, StringBuilder]> {
  const smartTerrainName: TName = smartTerrain.name();
  let index: TIndex = 1;

  while (level.patrol_path_exists(string.format("%s_surge_%s_walk", smartTerrainName, index))) {
    const wayName: TName = string.format("%s_surge_%s_walk", smartTerrainName, index);

    table.insert(jobs, {
      type: EJobType.SURGE,
      isMonsterJob: false,
      priority: logicsConfig.JOBS.STALKER_SURGE.PRIORITY,
      section: string.format("logic@%s", wayName),
      pathType: EJobPathType.PATH,
      preconditionParameters: {},
      preconditionFunction: jobPreconditionSurge,
    });

    builder.append(
      string.format(
        `[logic@%s]
active = walker@%s
[walker@%s]
sound_idle = state
use_camp = true
meet = meet@generic_lager
path_walk = surge_%s_walk
def_state_standing = guard
def_state_moving = patrol
`,
        wayName,
        wayName,
        wayName,
        index
      )
    );

    // Add linked look patrols.
    if (level.patrol_path_exists(string.format("%s_surge_%s_look", smartTerrainName, index))) {
      builder.append(string.format("path_look = surge_%s_look\n", index));
    }

    // Check for defend position restrictions.
    if (smartTerrain.defendRestrictor !== null) {
      builder.append(string.format("out_restr = %s\n", smartTerrain.defendRestrictor));
    }

    // Check for combat ignore restrictions.
    if (
      smartTerrain.smartTerrainActorControl !== null &&
      smartTerrain.smartTerrainActorControl.ignoreZone !== null &&
      isPatrolInRestrictor(smartTerrain.smartTerrainActorControl.ignoreZone, wayName)
    ) {
      builder.append(
        `combat_ignore_cond = {=npc_in_zone(smart.base_on_actor_control.ignore_zone)} true
combat_ignore_keep_when_attacked = true
`
      );
    }

    index += 1;
  }

  return $multi(jobs, builder);
}
