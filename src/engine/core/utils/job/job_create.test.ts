import * as path from "path";

import { describe, expect, it, jest } from "@jest/globals";

import { SmartTerrain } from "@/engine/core/objects";
import { createSmartTerrainJobs } from "@/engine/core/utils/job/job_create";
import { range } from "@/engine/core/utils/number";
import { readInGameTestLtx } from "@/fixtures/engine";

describe("jobs_general should correctly generate default jobs", () => {
  it("should correctly generate default jobs", async () => {
    const defaultJobsLtx: string = await readInGameTestLtx(
      path.resolve(__dirname, "__test__", "job_create.default.ltx")
    );

    const smartTerrain: SmartTerrain = new SmartTerrain("test_smart");

    smartTerrain.ini = smartTerrain.spawn_ini();

    jest.spyOn(smartTerrain, "name").mockImplementation(() => "test_smart");

    const [jobsList, ltx] = createSmartTerrainJobs(smartTerrain);

    expect(ltx).toBe(defaultJobsLtx);
    expect(jobsList).toEqualLuaArrays([
      {
        _precondition_is_monster: false,
        jobs: $fromArray([
          {
            jobs: $fromArray(
              range(20, 1).map((it) => ({
                job_id: {
                  job_type: "point_job",
                  section: "logic@test_smart_point_" + it,
                },
                priority: 3,
              }))
            ),
            priority: 3,
          },
          {
            jobs: $fromArray(
              range(3, 1).map((it) => ({
                _precondition_function: expect.any(Function),
                _precondition_params: {},
                job_id: {
                  job_type: "path_job",
                  section: `logic@test_smart_surge_${it}_walk`,
                },
                priority: 50,
              }))
            ),
            priority: 50,
          },
        ]),
        priority: 60,
      },
      {
        _precondition_is_monster: true,
        jobs: $fromArray(
          range(20, 1).map((it) => ({
            job_id: {
              job_type: "point_job",
              section: "logic@test_smart_home_" + it,
            },
            priority: 40,
          }))
        ),
        priority: 50,
      },
    ]);
  });
});
