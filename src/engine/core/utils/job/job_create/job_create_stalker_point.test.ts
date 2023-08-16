import * as path from "path";

import { describe, expect, it, jest } from "@jest/globals";

import { SmartTerrain, SmartTerrainControl } from "@/engine/core/objects";
import { createStalkerPointJobs } from "@/engine/core/utils/job/job_create/job_create_stalker_point";
import { range } from "@/engine/core/utils/number";
import { readInGameTestLtx } from "@/fixtures/engine";

describe("jobs_general should correctly generate stalkers point jobs", () => {
  it("should correctly generate point jobs for stalkers", async () => {
    const pointJobsLtx: string = await readInGameTestLtx(
      path.resolve(__dirname, "__test__", "job_create_stalker_point.ltx")
    );

    const smartTerrain: SmartTerrain = new SmartTerrain("test_smart");

    jest.spyOn(smartTerrain, "name").mockImplementation(() => "test_smart");

    const [jobsList, ltx, count] = createStalkerPointJobs(smartTerrain);

    expect(count).toBe(20);
    expect(ltx).toBe(pointJobsLtx);
    expect(jobsList).toEqualLuaTables({
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
    });
  });

  it("should correctly generate point jobs for stalkers with extended smart terrains", async () => {
    const pointJobsLtx: string = await readInGameTestLtx(
      path.resolve(__dirname, "__test__", "job_create_stalker_point.restrictors.ltx")
    );

    const smartTerrain: SmartTerrain = new SmartTerrain("test_smart");

    jest.spyOn(smartTerrain, "name").mockImplementation(() => "test_smart");

    smartTerrain.defendRestrictor = "def_restrictor_test";
    smartTerrain.smartTerrainActorControl = { ignoreZone: "test_ignore_zone" } as SmartTerrainControl;

    const [jobsList, ltx, count] = createStalkerPointJobs(smartTerrain);

    expect(count).toBe(20);
    expect(ltx).toBe(pointJobsLtx);
    expect(jobsList).toEqualLuaTables({
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
    });
  });
});
