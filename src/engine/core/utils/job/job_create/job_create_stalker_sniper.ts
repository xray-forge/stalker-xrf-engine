import { level, patrol } from "xray16";

import { SmartTerrain } from "@/engine/core/objects";
import { EStalkerState } from "@/engine/core/objects/animation";
import { IWaypointData, parseWaypointData } from "@/engine/core/utils/ini";
import { jobPreconditionSniper } from "@/engine/core/utils/job/job_precondition";
import { EJobPathType, EJobType, TSmartTerrainJobsList } from "@/engine/core/utils/job/job_types";
import { StringBuilder } from "@/engine/core/utils/string";
import { logicsConfig } from "@/engine/lib/configs/LogicsConfig";
import { Patrol, TIndex, TName } from "@/engine/lib/types";

/**
 * Create sniper jobs for stalkers in smart terrain.
 *
 * @param smartTerrain - smart terrain to create default animpoint jobs for
 * @param jobs - list of smart terrain jobs to insert into
 * @param builder - builder of large ltx file
 * @returns cover jobs list and updated string builder
 */
export function createStalkerSniperJobs(
  smartTerrain: SmartTerrain,
  jobs: TSmartTerrainJobsList,
  builder: StringBuilder
): LuaMultiReturn<[TSmartTerrainJobsList, StringBuilder]> {
  const smartTerrainName: TName = smartTerrain.name();
  let index: TIndex = 1;

  while (level.patrol_path_exists(string.format("%s_sniper_%s_walk", smartTerrainName, index))) {
    const wayName: TName = string.format("%s_sniper_%s_walk", smartTerrainName, index);
    const ptr: Patrol = new patrol(wayName);
    const wpProp: IWaypointData = parseWaypointData(wayName, ptr.flags(0), ptr.name(0));
    let state: TName = EStalkerState.HIDE;

    if (wpProp.state !== null) {
      // todo: Add stand state?
      if (wpProp.state === "stand") {
        state = EStalkerState.THREAT;
      }
    }

    table.insert(jobs, {
      type: EJobType.SNIPER,
      isMonsterJob: false,
      priority: logicsConfig.JOBS.STALKER_SNIPER.PRIORITY,
      section: string.format("logic@%s", wayName),
      pathType: EJobPathType.PATH,
      preconditionParameters: { wayName: wayName },
      preconditionFunction: jobPreconditionSniper,
    });

    builder.append(
      string.format(
        `[logic@%s]
active = camper@%s
[camper@%s]
meet = meet@generic_lager
path_walk = sniper_%s_walk
path_look = sniper_%s_look
sniper = true
def_state_campering = %s
def_state_campering_fire = %s_fire
`,
        wayName,
        wayName,
        wayName,
        index,
        index,
        state,
        state
      )
    );

    if (smartTerrain.defendRestrictor !== null) {
      builder.append(string.format("out_restr = %s\n", smartTerrain.defendRestrictor));
    }

    index += 1;
  }

  return $multi(jobs, builder);
}
