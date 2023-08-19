import * as path from "path";

import { describe, expect, it } from "@jest/globals";

import { SmartTerrain } from "@/engine/core/objects";
import { EJobPathType, EJobType } from "@/engine/core/utils/job";
import { createMonsterJobs } from "@/engine/core/utils/job/job_create/job_create_monster";
import { range } from "@/engine/core/utils/number";
import { StringBuilder } from "@/engine/core/utils/string";
import { mockSmartTerrain, readInGameTestLtx } from "@/fixtures/engine";

describe("jobs_general should correctly generate monster default jobs", () => {
  it("should correctly generate default jobs for monsters", async () => {
    const monsterJobsLtx: string = await readInGameTestLtx(
      path.resolve(__dirname, "__test__", "job_create_monster.default.ltx")
    );

    const smartTerrain: SmartTerrain = mockSmartTerrain();
    const [jobs, builder] = createMonsterJobs(smartTerrain, new LuaTable(), new StringBuilder());

    expect(builder.build()).toBe(monsterJobsLtx);
    expect(jobs).toEqualLuaArrays(
      range(20, 1).map((it) => ({
        type: EJobType.MONSTER_HOME,
        isMonsterJob: true,
        pathType: EJobPathType.POINT,
        section: "logic@test_smart_home_" + it,
        priority: 10,
      }))
    );
  });
});
