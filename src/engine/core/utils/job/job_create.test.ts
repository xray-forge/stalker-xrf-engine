import * as fsp from "fs/promises";
import * as path from "path";

import { describe, expect, it, jest } from "@jest/globals";

import { SmartTerrain } from "@/engine/core/objects";
import { createSmartTerrainJobs } from "@/engine/core/utils/job/job_create";

describe("jobs_general should correctly generate default jobs", () => {
  it("should correctly generate default jobs", async () => {
    const DEFAULT_JOBS_GENERAL: string = (
      await fsp.readFile(path.resolve(__dirname, "__test__", "jobs_general.default.ltx"))
    )
      .toString()
      .replace(/\r\n/g, "\n");

    const smartTerrain: SmartTerrain = new SmartTerrain("test_smart");

    smartTerrain.ini = smartTerrain.spawn_ini();

    jest.spyOn(smartTerrain, "name").mockImplementation(() => "test_smart");

    const [jobsList, ltx] = createSmartTerrainJobs(smartTerrain);

    expect(ltx).toBe(DEFAULT_JOBS_GENERAL);
    expect(jobsList).toEqualLuaArrays([
      {
        _precondition_is_monster: false,
        jobs: {
          "1": {
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
          },
          "2": {
            jobs: {
              "1": {
                _precondition_function: expect.any(Function),
                _precondition_params: {},
                job_id: {
                  job_type: "path_job",
                  section: "logic@test_smart_surge_1_walk",
                },
                priority: 50,
              },
              "2": {
                _precondition_function: expect.any(Function),
                _precondition_params: {},
                job_id: {
                  job_type: "path_job",
                  section: "logic@test_smart_surge_2_walk",
                },
                priority: 50,
              },
              "3": {
                _precondition_function: expect.any(Function),
                _precondition_params: {},
                job_id: {
                  job_type: "path_job",
                  section: "logic@test_smart_surge_3_walk",
                },
                priority: 50,
              },
            },
            priority: 50,
          },
        },
        priority: 60,
      },
      {
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
      },
    ]);
  });
});
