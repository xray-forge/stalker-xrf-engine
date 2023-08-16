import * as path from "path";

import { describe, expect, it, jest } from "@jest/globals";

import { registerSmartCover } from "@/engine/core/database";
import { SmartCover, SmartTerrain } from "@/engine/core/objects";
import { createStalkerJobs } from "@/engine/core/utils/job/job_create/job_create_stalker";
import { range } from "@/engine/core/utils/number";
import { readInGameTestLtx } from "@/fixtures/engine";

describe("jobs_general should correctly generate stalker jobs", () => {
  it("should correctly generate default stalker jobs", async () => {
    const defaultJobsLtx: string = await readInGameTestLtx(
      path.resolve(__dirname, "__test__", "job_create_stalker.default.ltx")
    );

    const smartTerrain: SmartTerrain = new SmartTerrain("test_smart");
    const smartCover: SmartCover = new SmartCover("test_smart_cover");

    jest.spyOn(smartTerrain, "name").mockImplementation(() => "test_smart");
    jest.spyOn(smartCover, "name").mockImplementation(() => "test_smart_animpoint_1");

    registerSmartCover(smartCover);

    const [jobsList, ltx] = createStalkerJobs(smartTerrain);

    expect(ltx).toBe(defaultJobsLtx);
    expect(jobsList).toEqualLuaTables({
      preconditionIsMonster: false,
      jobs: $fromArray([
        {
          jobs: $fromArray(
            range(20, 1).map((it) => ({
              jobId: {
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
              preconditionFunction: expect.any(Function),
              preconditionParameters: {},
              jobId: {
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
              preconditionFunction: expect.any(Function),
              preconditionParameters: {},
              jobId: {
                job_type: "path_job",
                section: `logic@test_smart_sleep_${it}`,
              },
              priority: 10,
            }))
          ),
          priority: 10,
        },
        {
          jobs: $fromArray([
            {
              preconditionFunction: expect.any(Function),
              preconditionParameters: {},
              jobId: {
                job_type: "path_job",
                section: "logic@test_smart_collector_1_walk",
              },
              priority: 25,
            },
          ]),
          priority: 25,
        },
        {
          jobs: $fromArray([
            {
              preconditionFunction: expect.any(Function),
              preconditionParameters: {},
              jobId: {
                job_type: "path_job",
                section: "logic@test_smart_walker_1_walk",
              },
              priority: 15,
            },
          ]),
          priority: 15,
        },
        {
          jobs: $fromArray([
            {
              preconditionFunction: expect.any(Function),
              preconditionParameters: {},
              jobId: {
                job_type: "path_job",
                section: "logic@test_smart_patrol_1_walk",
              },
              priority: 20,
            },
            {
              preconditionFunction: expect.any(Function),
              preconditionParameters: {},
              jobId: {
                job_type: "path_job",
                section: "logic@test_smart_patrol_1_walk",
              },
              priority: 20,
            },
            {
              preconditionFunction: expect.any(Function),
              preconditionParameters: {},
              jobId: {
                job_type: "path_job",
                section: "logic@test_smart_patrol_1_walk",
              },
              priority: 20,
            },
          ]),
          priority: 20,
        },
        {
          preconditionFunction: expect.any(Function),
          preconditionParameters: {},
          jobId: {
            job_type: "smartcover_job",
            section: "logic@test_smart_animpoint_1",
          },
          priority: 15,
        },
        {
          jobs: $fromArray([
            {
              preconditionFunction: expect.any(Function),
              preconditionParameters: {},
              jobId: {
                job_type: "path_job",
                section: "logic@test_smart_guard_1_walk",
              },
              priority: 25,
            },
            {
              preconditionFunction: expect.any(Function),
              preconditionParameters: {
                changing_job: "logic@test_smart_guard_1_walk",
              },
              jobId: {
                job_type: "path_job",
                section: "logic@follower_test_smart_guard_1_walk",
              },
              priority: 24,
            },
          ]),
          priority: 25,
        },
        {
          jobs: $fromArray([
            {
              preconditionFunction: expect.any(Function),
              preconditionParameters: {
                way_name: "test_smart_sniper_1_walk",
              },
              jobId: {
                job_type: "path_job",
                section: "logic@test_smart_sniper_1_walk",
              },
              priority: 30,
            },
          ]),
          priority: 30,
        },
        {
          jobs: $fromArray([
            {
              preconditionFunction: expect.any(Function),
              preconditionParameters: {
                way_name: "test_smart_camper_1_walk",
              },
              jobId: {
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

  it("should correctly generate default stalker jobs for empty smart", async () => {
    const defaultJobsLtx: string = await readInGameTestLtx(
      path.resolve(__dirname, "__test__", "job_create_stalker.empty.ltx")
    );

    const smartTerrain: SmartTerrain = new SmartTerrain("test_smart_empty");

    jest.spyOn(smartTerrain, "name").mockImplementation(() => "test_smart_empty");

    const [jobsList, ltx] = createStalkerJobs(smartTerrain);

    expect(ltx).toBe(defaultJobsLtx);
    expect(jobsList).toEqualLuaTables({
      preconditionIsMonster: false,
      jobs: $fromArray([
        {
          jobs: $fromArray(
            range(20, 1).map((it) => ({
              jobId: {
                job_type: "point_job",
                section: "logic@test_smart_empty_point_" + it,
              },
              priority: 3,
            }))
          ),
          priority: 3,
        },
      ]),
      priority: 60,
    });
  });
});
