import { SmartTerrain } from "@/engine/core/objects";
import { IJobListDescriptor } from "@/engine/core/utils/job/job_types";
import { TDistance, TName } from "@/engine/lib/types";

/**
 * todo;
 */
export function createMonsterJobs(smartTerrain: SmartTerrain): LuaMultiReturn<[IJobListDescriptor, string]> {
  const smartTerrainName: TName = smartTerrain.name();
  const monsterJobs: IJobListDescriptor = { _precondition_is_monster: true, priority: 50, jobs: new LuaTable() };

  let ltx: string = "";

  // ===================================================================================================================
  // = Mob home
  // ===================================================================================================================

  for (const it of $range(1, 20)) {
    const name: TName = smartTerrainName + "_home_" + it;
    const homeMinRadius: TDistance = 10;
    const homeMidRadius: TDistance = 20;
    const homeMaxRadius: TDistance = 70;

    table.insert(monsterJobs.jobs, {
      priority: 40,
      job_id: {
        section: "logic@" + name,
        job_type: "point_job",
      },
    });

    let jobLtx: string =
      "[logic@" +
      name +
      "]\n" +
      "active = mob_home@" +
      name +
      "\n" +
      "[mob_home@" +
      name +
      "]\n" +
      "gulag_point = true\n" +
      "home_min_radius = " +
      homeMinRadius +
      "\n" +
      "home_mid_radius = " +
      homeMidRadius +
      "\n" +
      "home_max_radius = " +
      homeMaxRadius +
      "\n";

    if (smartTerrain.defendRestrictor !== null) {
      jobLtx += "out_restr = " + smartTerrain.defendRestrictor + "\n";
    }

    ltx += jobLtx;
  }

  return $multi(monsterJobs, ltx);
}
