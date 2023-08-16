import * as path from "path";

import { describe, expect, it, jest } from "@jest/globals";

import { SmartTerrain } from "@/engine/core/objects";
import { createMonsterJobs } from "@/engine/core/utils/job/job_create/job_create_monster";
import { range } from "@/engine/core/utils/number";
import { readInGameTestLtx } from "@/fixtures/engine";

describe("jobs_general should correctly generate monster default jobs", () => {
  it("should correctly generate default jobs for monsters", async () => {
    const monsterJobsLtx: string = await readInGameTestLtx(
      path.resolve(__dirname, "__test__", "job_create_monster.default.ltx")
    );

    const smartTerrain: SmartTerrain = new SmartTerrain("test_smart");

    jest.spyOn(smartTerrain, "name").mockImplementation(() => "test_smart");

    const [jobsList, ltx] = createMonsterJobs(smartTerrain);

    expect(ltx).toBe(monsterJobsLtx);
    expect(jobsList).toEqualLuaTables({
      preconditionIsMonster: true,
      jobs: $fromArray(
        range(20, 1).map((it) => ({
          jobId: {
            jobType: "point_job",
            section: "logic@test_smart_home_" + it,
          },
          priority: 40,
        }))
      ),
      priority: 50,
    });
  });
});
