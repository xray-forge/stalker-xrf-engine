import { level } from "xray16";

import { jobPreconditionWalker } from "@/engine/core/objects/server/smart_terrain/job/job_precondition";
import {
  EJobPathType,
  EJobType,
  TSmartTerrainJobsList,
} from "@/engine/core/objects/server/smart_terrain/job/job_types";
import type { SmartTerrain } from "@/engine/core/objects/server/smart_terrain/SmartTerrain";
import { smartTerrainConfig } from "@/engine/core/objects/server/smart_terrain/SmartTerrainConfig";
import { isPatrolInRestrictor } from "@/engine/core/utils/patrol";
import { StringBuilder } from "@/engine/core/utils/string";
import { TIndex, TName } from "@/engine/lib/types";

/**
 * Create walker jobs for stalkers in smart terrain.
 *
 * @param smartTerrain - smart terrain to create default animpoint jobs for
 * @param jobs - list of smart terrain jobs to insert into
 * @param builder - builder of large ltx file
 * @returns cover jobs list and updated string builder
 */
export function createStalkerWalkerJobs(
  smartTerrain: SmartTerrain,
  jobs: TSmartTerrainJobsList,
  builder: StringBuilder
): LuaMultiReturn<[TSmartTerrainJobsList, StringBuilder]> {
  const smartTerrainName: TName = smartTerrain.name();

  let index: TIndex = 1;

  while (level.patrol_path_exists(string.format("%s_walker_%s_walk", smartTerrainName, index))) {
    const patrolName: TName = string.format("%s_walker_%s_walk", smartTerrainName, index);

    table.insert(jobs, {
      type: EJobType.WALKER,
      isMonsterJob: false,
      priority: smartTerrainConfig.JOBS.STALKER_WALKER.PRIORITY,
      section: string.format("logic@%s", patrolName),
      pathType: EJobPathType.PATH,
      preconditionParameters: { wayName: patrolName },
      preconditionFunction: jobPreconditionWalker,
    });

    builder.append(
      string.format(
        `[logic@%s]
active = walker@%s
[walker@%s]
sound_idle = state
meet = meet@generic_lager
path_walk = walker_%s_walk
def_state_standing = guard
def_state_moving = patrol
`,
        patrolName,
        patrolName,
        patrolName,
        index
      )
    );

    if (level.patrol_path_exists(string.format("%s_walker_%s_look", smartTerrainName, index))) {
      builder.append(string.format("path_look = walker_%s_look\n", index));
    }

    if (smartTerrain.safeRestrictor !== null && isPatrolInRestrictor(smartTerrain.safeRestrictor, patrolName)) {
      // todo: Incorrect param, should be injected?
      builder.append("invulnerable = {=npc_in_zone(smart.safe_restr)} true\n");
    }

    if (smartTerrain.defendRestrictor !== null) {
      builder.append(string.format("out_restr = %s\n", smartTerrain.defendRestrictor));
    }

    if (
      smartTerrain.smartTerrainActorControl !== null &&
      smartTerrain.smartTerrainActorControl.ignoreZone !== null &&
      isPatrolInRestrictor(smartTerrain.smartTerrainActorControl.ignoreZone, patrolName)
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
