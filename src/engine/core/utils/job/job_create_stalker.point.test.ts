import * as path from "path";

import { describe, expect, it, jest } from "@jest/globals";

import { SmartTerrain, SmartTerrainControl } from "@/engine/core/objects";
import { createStalkerPointJobs } from "@/engine/core/utils/job/job_create_stalker";
import { readInGameTestLtx } from "@/fixtures/engine";

describe("jobs_general should correctly generate stalkers point jobs", () => {
  it("should correctly generate point jobs for stalkers", async () => {
    const pointJobsLtx: string = await readInGameTestLtx(
      path.resolve(__dirname, "__test__", "job_create_stalker.point.ltx")
    );

    const smartTerrain: SmartTerrain = new SmartTerrain("test_smart");

    smartTerrain.ini = smartTerrain.spawn_ini();

    jest.spyOn(smartTerrain, "name").mockImplementation(() => "test_smart");

    const [jobsList, ltx, count] = createStalkerPointJobs(smartTerrain);

    expect(count).toBe(20);
    expect(ltx).toBe(pointJobsLtx);
    expect(jobsList).toEqualLuaTables({
      jobs: {
        "1": {
          job_id: {
            job_type: "point_job",
            section: "logic@test_smart_point_1",
          },
          priority: 3,
        },
        "10": {
          job_id: {
            job_type: "point_job",
            section: "logic@test_smart_point_10",
          },
          priority: 3,
        },
        "11": {
          job_id: {
            job_type: "point_job",
            section: "logic@test_smart_point_11",
          },
          priority: 3,
        },
        "12": {
          job_id: {
            job_type: "point_job",
            section: "logic@test_smart_point_12",
          },
          priority: 3,
        },
        "13": {
          job_id: {
            job_type: "point_job",
            section: "logic@test_smart_point_13",
          },
          priority: 3,
        },
        "14": {
          job_id: {
            job_type: "point_job",
            section: "logic@test_smart_point_14",
          },
          priority: 3,
        },
        "15": {
          job_id: {
            job_type: "point_job",
            section: "logic@test_smart_point_15",
          },
          priority: 3,
        },
        "16": {
          job_id: {
            job_type: "point_job",
            section: "logic@test_smart_point_16",
          },
          priority: 3,
        },
        "17": {
          job_id: {
            job_type: "point_job",
            section: "logic@test_smart_point_17",
          },
          priority: 3,
        },
        "18": {
          job_id: {
            job_type: "point_job",
            section: "logic@test_smart_point_18",
          },
          priority: 3,
        },
        "19": {
          job_id: {
            job_type: "point_job",
            section: "logic@test_smart_point_19",
          },
          priority: 3,
        },
        "2": {
          job_id: {
            job_type: "point_job",
            section: "logic@test_smart_point_2",
          },
          priority: 3,
        },
        "20": {
          job_id: {
            job_type: "point_job",
            section: "logic@test_smart_point_20",
          },
          priority: 3,
        },
        "3": {
          job_id: {
            job_type: "point_job",
            section: "logic@test_smart_point_3",
          },
          priority: 3,
        },
        "4": {
          job_id: {
            job_type: "point_job",
            section: "logic@test_smart_point_4",
          },
          priority: 3,
        },
        "5": {
          job_id: {
            job_type: "point_job",
            section: "logic@test_smart_point_5",
          },
          priority: 3,
        },
        "6": {
          job_id: {
            job_type: "point_job",
            section: "logic@test_smart_point_6",
          },
          priority: 3,
        },
        "7": {
          job_id: {
            job_type: "point_job",
            section: "logic@test_smart_point_7",
          },
          priority: 3,
        },
        "8": {
          job_id: {
            job_type: "point_job",
            section: "logic@test_smart_point_8",
          },
          priority: 3,
        },
        "9": {
          job_id: {
            job_type: "point_job",
            section: "logic@test_smart_point_9",
          },
          priority: 3,
        },
      },
      priority: 3,
    });
  });

  it("should correctly generate point jobs for stalkers with extended smart terrains", async () => {
    const pointJobsLtx: string = await readInGameTestLtx(
      path.resolve(__dirname, "__test__", "job_create_stalker.point.restrictors.ltx")
    );

    const smartTerrain: SmartTerrain = new SmartTerrain("test_smart");

    smartTerrain.ini = smartTerrain.spawn_ini();

    jest.spyOn(smartTerrain, "name").mockImplementation(() => "test_smart");

    smartTerrain.defendRestrictor = "def_restrictor_test";
    smartTerrain.smartTerrainActorControl = { ignoreZone: "test_ignore_zone" } as SmartTerrainControl;

    const [jobsList, ltx, count] = createStalkerPointJobs(smartTerrain);

    expect(count).toBe(20);
    expect(ltx).toBe(pointJobsLtx);
    expect(jobsList).toEqualLuaTables({
      jobs: {
        "1": {
          job_id: {
            job_type: "point_job",
            section: "logic@test_smart_point_1",
          },
          priority: 3,
        },
        "10": {
          job_id: {
            job_type: "point_job",
            section: "logic@test_smart_point_10",
          },
          priority: 3,
        },
        "11": {
          job_id: {
            job_type: "point_job",
            section: "logic@test_smart_point_11",
          },
          priority: 3,
        },
        "12": {
          job_id: {
            job_type: "point_job",
            section: "logic@test_smart_point_12",
          },
          priority: 3,
        },
        "13": {
          job_id: {
            job_type: "point_job",
            section: "logic@test_smart_point_13",
          },
          priority: 3,
        },
        "14": {
          job_id: {
            job_type: "point_job",
            section: "logic@test_smart_point_14",
          },
          priority: 3,
        },
        "15": {
          job_id: {
            job_type: "point_job",
            section: "logic@test_smart_point_15",
          },
          priority: 3,
        },
        "16": {
          job_id: {
            job_type: "point_job",
            section: "logic@test_smart_point_16",
          },
          priority: 3,
        },
        "17": {
          job_id: {
            job_type: "point_job",
            section: "logic@test_smart_point_17",
          },
          priority: 3,
        },
        "18": {
          job_id: {
            job_type: "point_job",
            section: "logic@test_smart_point_18",
          },
          priority: 3,
        },
        "19": {
          job_id: {
            job_type: "point_job",
            section: "logic@test_smart_point_19",
          },
          priority: 3,
        },
        "2": {
          job_id: {
            job_type: "point_job",
            section: "logic@test_smart_point_2",
          },
          priority: 3,
        },
        "20": {
          job_id: {
            job_type: "point_job",
            section: "logic@test_smart_point_20",
          },
          priority: 3,
        },
        "3": {
          job_id: {
            job_type: "point_job",
            section: "logic@test_smart_point_3",
          },
          priority: 3,
        },
        "4": {
          job_id: {
            job_type: "point_job",
            section: "logic@test_smart_point_4",
          },
          priority: 3,
        },
        "5": {
          job_id: {
            job_type: "point_job",
            section: "logic@test_smart_point_5",
          },
          priority: 3,
        },
        "6": {
          job_id: {
            job_type: "point_job",
            section: "logic@test_smart_point_6",
          },
          priority: 3,
        },
        "7": {
          job_id: {
            job_type: "point_job",
            section: "logic@test_smart_point_7",
          },
          priority: 3,
        },
        "8": {
          job_id: {
            job_type: "point_job",
            section: "logic@test_smart_point_8",
          },
          priority: 3,
        },
        "9": {
          job_id: {
            job_type: "point_job",
            section: "logic@test_smart_point_9",
          },
          priority: 3,
        },
      },
      priority: 3,
    });
  });
});
