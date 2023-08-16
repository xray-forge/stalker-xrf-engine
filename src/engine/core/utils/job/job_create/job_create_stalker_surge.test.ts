import * as path from "path";

import { describe, expect, it, jest } from "@jest/globals";

import { registerZone } from "@/engine/core/database";
import { SmartTerrain, SmartTerrainControl } from "@/engine/core/objects";
import { createStalkerSurgeJobs } from "@/engine/core/utils/job/job_create/job_create_stalker_surge";
import { range } from "@/engine/core/utils/number";
import { readInGameTestLtx } from "@/fixtures/engine";
import { mockClientGameObject } from "@/fixtures/xray";

describe("jobs_general should correctly generate stalkers surge jobs", () => {
  it("should correctly generate surge jobs for stalkers when no patrols exist", async () => {
    const smartTerrain: SmartTerrain = new SmartTerrain("test_smart");

    jest.spyOn(smartTerrain, "name").mockImplementation(() => "test_surge_paths_smart");

    const [jobsList, ltx, count] = createStalkerSurgeJobs(smartTerrain);

    expect(count).toBe(0);
    expect(ltx).toBe("");
    expect(jobsList).toEqualLuaTables({
      jobs: {},
      priority: 50,
    });
  });

  it("should correctly generate surge jobs for stalkers when patrols exist", async () => {
    const surgeJobsLtx: string = await readInGameTestLtx(
      path.resolve(__dirname, "__test__", "job_create_stalker_surge.ltx")
    );

    const smartTerrain: SmartTerrain = new SmartTerrain("test_smart");

    smartTerrain.defendRestrictor = null;

    jest.spyOn(smartTerrain, "name").mockImplementation(() => "test_smart");

    const [jobsList, ltx, count] = createStalkerSurgeJobs(smartTerrain);

    expect(count).toBe(3);
    expect(ltx).toBe(surgeJobsLtx);
    expect(jobsList).toEqualLuaTables({
      jobs: $fromArray(
        range(3, 1).map((it) => ({
          preconditionFunction: expect.any(Function),
          preconditionParameters: {},
          job_id: {
            job_type: "path_job",
            section: `logic@test_smart_surge_${it}_walk`,
          },
          priority: 50,
        }))
      ),
      priority: 50,
    });
  });

  it("should correctly generate surge jobs for stalkers when patrols exist with restrictors", async () => {
    const surgeJobsLtx: string = await readInGameTestLtx(
      path.resolve(__dirname, "__test__", "job_create_stalker_surge.restrictors.ltx")
    );

    const smartTerrain: SmartTerrain = new SmartTerrain("test_smart");

    jest.spyOn(smartTerrain, "name").mockImplementation(() => "test_smart");

    smartTerrain.defendRestrictor = "def_restrictor_test";
    smartTerrain.smartTerrainActorControl = { ignoreZone: "test_ignore_zone" } as SmartTerrainControl;

    const [jobsList, ltx, count] = createStalkerSurgeJobs(smartTerrain);

    expect(count).toBe(3);
    expect(ltx).toBe(surgeJobsLtx);
    expect(jobsList).toEqualLuaTables({
      jobs: $fromArray(
        range(3, 1).map((it) => ({
          preconditionFunction: expect.any(Function),
          preconditionParameters: {},
          job_id: {
            job_type: "path_job",
            section: `logic@test_smart_surge_${it}_walk`,
          },
          priority: 50,
        }))
      ),
      priority: 50,
    });
  });

  it("should correctly generate surge jobs for stalkers when patrols exist, when in restrictor", async () => {
    const surgeJobsLtx: string = await readInGameTestLtx(
      path.resolve(__dirname, "__test__", "job_create_stalker_surge.ignore.ltx")
    );

    const smartTerrain: SmartTerrain = new SmartTerrain("test_smart");

    registerZone(mockClientGameObject({ name: () => "some_restrictor", inside: () => true }));

    jest.spyOn(smartTerrain, "name").mockImplementation(() => "test_smart");

    smartTerrain.defendRestrictor = "def_restrictor_test";
    smartTerrain.smartTerrainActorControl = { ignoreZone: "some_restrictor" } as SmartTerrainControl;

    const [jobsList, ltx, count] = createStalkerSurgeJobs(smartTerrain);

    expect(count).toBe(3);
    expect(ltx).toBe(surgeJobsLtx);
    expect(jobsList).toEqualLuaTables({
      jobs: $fromArray(
        range(3, 1).map((it) => ({
          preconditionFunction: expect.any(Function),
          preconditionParameters: {},
          job_id: {
            job_type: "path_job",
            section: `logic@test_smart_surge_${it}_walk`,
          },
          priority: 50,
        }))
      ),
      priority: 50,
    });
  });
});
