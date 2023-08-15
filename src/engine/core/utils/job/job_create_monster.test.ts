import * as path from "path";

import { describe, expect, it, jest } from "@jest/globals";

import { SmartTerrain } from "@/engine/core/objects";
import { createMonsterJobs } from "@/engine/core/utils/job/job_create_monster";
import { readInGameTestLtx } from "@/fixtures/engine";

describe("jobs_general should correctly generate monster default jobs", () => {
  it("should correctly generate default jobs for monsters", async () => {
    const monsterJobsLtx: string = await readInGameTestLtx(
      path.resolve(__dirname, "__test__", "job_create_monster.default.ltx")
    );

    const smartTerrain: SmartTerrain = new SmartTerrain("test_smart");

    smartTerrain.ini = smartTerrain.spawn_ini();

    jest.spyOn(smartTerrain, "name").mockImplementation(() => "test_smart");

    const [jobsList, ltx] = createMonsterJobs(smartTerrain);

    expect(ltx).toBe(monsterJobsLtx);
    expect(jobsList).toEqualLuaTables({
      _precondition_is_monster: true,
      jobs: {
        "1": {
          job_id: {
            job_type: "point_job",
            section: "logic@test_smart_home_1",
          },
          priority: 40,
        },
        "10": {
          job_id: {
            job_type: "point_job",
            section: "logic@test_smart_home_10",
          },
          priority: 40,
        },
        "11": {
          job_id: {
            job_type: "point_job",
            section: "logic@test_smart_home_11",
          },
          priority: 40,
        },
        "12": {
          job_id: {
            job_type: "point_job",
            section: "logic@test_smart_home_12",
          },
          priority: 40,
        },
        "13": {
          job_id: {
            job_type: "point_job",
            section: "logic@test_smart_home_13",
          },
          priority: 40,
        },
        "14": {
          job_id: {
            job_type: "point_job",
            section: "logic@test_smart_home_14",
          },
          priority: 40,
        },
        "15": {
          job_id: {
            job_type: "point_job",
            section: "logic@test_smart_home_15",
          },
          priority: 40,
        },
        "16": {
          job_id: {
            job_type: "point_job",
            section: "logic@test_smart_home_16",
          },
          priority: 40,
        },
        "17": {
          job_id: {
            job_type: "point_job",
            section: "logic@test_smart_home_17",
          },
          priority: 40,
        },
        "18": {
          job_id: {
            job_type: "point_job",
            section: "logic@test_smart_home_18",
          },
          priority: 40,
        },
        "19": {
          job_id: {
            job_type: "point_job",
            section: "logic@test_smart_home_19",
          },
          priority: 40,
        },
        "2": {
          job_id: {
            job_type: "point_job",
            section: "logic@test_smart_home_2",
          },
          priority: 40,
        },
        "20": {
          job_id: {
            job_type: "point_job",
            section: "logic@test_smart_home_20",
          },
          priority: 40,
        },
        "3": {
          job_id: {
            job_type: "point_job",
            section: "logic@test_smart_home_3",
          },
          priority: 40,
        },
        "4": {
          job_id: {
            job_type: "point_job",
            section: "logic@test_smart_home_4",
          },
          priority: 40,
        },
        "5": {
          job_id: {
            job_type: "point_job",
            section: "logic@test_smart_home_5",
          },
          priority: 40,
        },
        "6": {
          job_id: {
            job_type: "point_job",
            section: "logic@test_smart_home_6",
          },
          priority: 40,
        },
        "7": {
          job_id: {
            job_type: "point_job",
            section: "logic@test_smart_home_7",
          },
          priority: 40,
        },
        "8": {
          job_id: {
            job_type: "point_job",
            section: "logic@test_smart_home_8",
          },
          priority: 40,
        },
        "9": {
          job_id: {
            job_type: "point_job",
            section: "logic@test_smart_home_9",
          },
          priority: 40,
        },
      },
      priority: 50,
    });
  });
});
