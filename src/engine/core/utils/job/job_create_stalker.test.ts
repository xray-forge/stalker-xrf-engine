import * as path from "path";

import { describe, expect, it, jest } from "@jest/globals";

import { registerSmartCover } from "@/engine/core/database";
import { SmartCover, SmartTerrain } from "@/engine/core/objects";
import { createStalkerJobs } from "@/engine/core/utils/job/job_create_stalker";
import { range } from "@/engine/core/utils/number";
import { readInGameTestLtx } from "@/fixtures/engine";

describe("jobs_general should correctly generate stalker jobs", () => {
  it("should correctly generate default stalker jobs", async () => {
    const defaultJobsLtx: string = await readInGameTestLtx(
      path.resolve(__dirname, "__test__", "job_create_stalker.default.ltx")
    );

    const smartTerrain: SmartTerrain = new SmartTerrain("test_smart");
    const smartCover: SmartCover = new SmartCover("test_smart_cover");

    smartTerrain.ini = smartTerrain.spawn_ini();

    jest.spyOn(smartTerrain, "name").mockImplementation(() => "test_smart");
    jest.spyOn(smartCover, "name").mockImplementation(() => "test_smart_animpoint_1");

    registerSmartCover(smartCover);

    const [jobsList, ltx] = createStalkerJobs(smartTerrain);

    expect(ltx).toBe(defaultJobsLtx);
    expect(jobsList).toEqualLuaTables({
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
        {
          jobs: $fromArray(
            range(2, 1).map((it) => ({
              _precondition_function: expect.any(Function),
              _precondition_params: {},
              job_id: {
                job_type: "path_job",
                section: `logic@test_smart_sleep_${it}`,
              },
              priority: 10,
            }))
          ),
          priority: 10,
        },
        {
          _precondition_function: expect.any(Function),
          _precondition_params: {},
          job_id: {
            job_type: "smartcover_job",
            section: "logic@test_smart_animpoint_1",
          },
          priority: 15,
        },
        {
          jobs: $fromArray([
            {
              _precondition_function: expect.any(Function),
              _precondition_params: {
                way_name: "test_smart_camper_1_walk",
              },
              job_id: {
                job_type: "path_job",
                section: "logic@test_smart_camper_1_walk",
              },
              priority: 45,
            },
          ]),
          priority: 45,
        },
      ]),
      priority: 60,
    });
  });
});
