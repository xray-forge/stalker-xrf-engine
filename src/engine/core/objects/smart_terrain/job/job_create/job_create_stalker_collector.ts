import { level } from "xray16";

import { jobPreconditionCollector } from "@/engine/core/objects/smart_terrain/job/job_precondition";
import { EJobPathType, EJobType, TSmartTerrainJobsList } from "@/engine/core/objects/smart_terrain/job/job_types";
import type { SmartTerrain } from "@/engine/core/objects/smart_terrain/SmartTerrain";
import { smartTerrainConfig } from "@/engine/core/objects/smart_terrain/SmartTerrainConfig";
import { isPatrolInRestrictor } from "@/engine/core/utils/patrol";
import { StringBuilder } from "@/engine/core/utils/string";
import { TIndex, TName } from "@/engine/lib/types";

/**
 * Create collector jobs for stalkers in smart terrain.
 *
 * @param terrain - smart terrain to create default animpoint jobs for
 * @param jobs - list of smart terrain jobs to insert into
 * @param builder - builder of large ltx file
 * @returns cover jobs list and updated string builder
 */
export function createStalkerCollectorJobs(
  terrain: SmartTerrain,
  jobs: TSmartTerrainJobsList,
  builder: StringBuilder
): LuaMultiReturn<[TSmartTerrainJobsList, StringBuilder]> {
  const smartTerrainName: TName = terrain.name();

  let index: TIndex = 1;

  while (level.patrol_path_exists(string.format("%s_collector_%s_walk", smartTerrainName, index))) {
    const patrolName: TName = string.format("%s_collector_%s_walk", smartTerrainName, index);

    table.insert(jobs, {
      type: EJobType.COLLECTOR,
      isMonsterJob: false,
      priority: smartTerrainConfig.JOBS.STALKER_COLLECTOR.PRIORITY,
      section: string.format("logic@%s", patrolName),
      pathType: EJobPathType.PATH,
      preconditionParameters: {},
      preconditionFunction: jobPreconditionCollector,
    });

    builder.append(
      string.format(
        `[logic@%s]
active = walker@%s
[walker@%s]
sound_idle = state
meet = meet@generic_lager
path_walk = collector_%s_walk
def_state_standing = guard
def_state_moving = patrol
`,
        patrolName,
        patrolName,
        patrolName,
        index
      )
    );

    if (level.patrol_path_exists(string.format("%s_collector_%s_look", smartTerrainName, index))) {
      builder.append(string.format("path_look = collector_%s_look\n", index));
    }

    if (terrain.safeRestrictor !== null && isPatrolInRestrictor(terrain.safeRestrictor, patrolName)) {
      builder.append("invulnerable = {=npc_in_zone(smart.safe_restr)} true\n");
    }

    if (terrain.defendRestrictor !== null) {
      builder.append(string.format("out_restr = %s\n", terrain.defendRestrictor));
    }

    if (
      terrain.terrainControl !== null &&
      terrain.terrainControl.ignoreZone !== null &&
      isPatrolInRestrictor(terrain.terrainControl.ignoreZone, patrolName)
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
