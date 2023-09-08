import * as path from "path";

import { beforeEach, describe, expect, it } from "@jest/globals";

import { registerSmartCover } from "@/engine/core/database";
import { SmartCover } from "@/engine/core/objects/server/smart_cover";
import { SmartTerrain } from "@/engine/core/objects/server/smart_terrain";
import { createSmartTerrainJobs } from "@/engine/core/utils/job/job_create/job_create";
import {
  jobPreconditionAnimpoint,
  jobPreconditionCamper,
  jobPreconditionCollector,
  jobPreconditionGuard,
  jobPreconditionGuardFollower,
  jobPreconditionPatrol,
  jobPreconditionSleep,
  jobPreconditionSniper,
  jobPreconditionSurge,
  jobPreconditionWalker,
} from "@/engine/core/utils/job/job_precondition";
import { EJobPathType, EJobType } from "@/engine/core/utils/job/job_types";
import { range } from "@/engine/core/utils/number";
import { AnyObject } from "@/engine/lib/types";
import { mockSmartCover, mockSmartTerrain, readInGameTestLtx } from "@/fixtures/engine";
import { MockIniFile, mockServerAlifeCreatureActor } from "@/fixtures/xray";

describe("jobs_create should correctly generate default jobs", () => {
  const getSmartTerrainTaskDetails = () => ({
    alifeTask: expect.any(Object),
    gameVertexId: expect.any(Number),
    levelId: expect.any(Number),
    position: expect.any(Object),
  });

  beforeEach(() => {
    mockServerAlifeCreatureActor();
  });

  it("should correctly generate default jobs", async () => {
    const defaultJobsLtx: string = await readInGameTestLtx(
      path.resolve(__dirname, "__test__", "job_create.default.ltx")
    );

    const smartTerrain: SmartTerrain = mockSmartTerrain();
    const smartCover: SmartCover = mockSmartCover("test_smart_animpoint_1");

    registerSmartCover(smartCover);
    smartTerrain.on_register();

    const [jobsList, ltxConfig, ltxName] = createSmartTerrainJobs(smartTerrain);

    expect(ltxName).toBe("*test_smart");
    expect((ltxConfig as unknown as MockIniFile<AnyObject>).content).toBe(defaultJobsLtx);
    expect(jobsList).toEqualLuaArrays([
      ...range(3, 1).map((it) => ({
        ...getSmartTerrainTaskDetails(),
        id: it,
        type: EJobType.SURGE,
        preconditionFunction: jobPreconditionSurge,
        preconditionParameters: {},
        isMonsterJob: false,
        pathType: EJobPathType.PATH,
        section: `logic@test_smart_surge_${it}_walk`,
        priority: 50,
      })),
      {
        ...getSmartTerrainTaskDetails(),
        id: 4,
        type: EJobType.CAMPER,
        preconditionFunction: jobPreconditionCamper,
        preconditionParameters: {
          wayName: "test_smart_camper_1_walk",
        },
        isMonsterJob: false,
        pathType: EJobPathType.PATH,
        section: "logic@test_smart_camper_1_walk",
        priority: 45,
      },
      {
        ...getSmartTerrainTaskDetails(),
        id: 5,
        type: EJobType.SNIPER,
        preconditionFunction: jobPreconditionSniper,
        preconditionParameters: {
          wayName: "test_smart_sniper_1_walk",
        },
        isMonsterJob: false,
        pathType: EJobPathType.PATH,
        section: "logic@test_smart_sniper_1_walk",
        priority: 30,
      },
      {
        ...getSmartTerrainTaskDetails(),
        id: 6,
        type: EJobType.COLLECTOR,
        preconditionFunction: jobPreconditionCollector,
        preconditionParameters: {},
        isMonsterJob: false,
        pathType: EJobPathType.PATH,
        section: "logic@test_smart_collector_1_walk",
        priority: 25,
      },
      {
        ...getSmartTerrainTaskDetails(),
        id: 7,
        type: EJobType.GUARD,
        preconditionFunction: jobPreconditionGuard,
        preconditionParameters: {
          wayName: "test_smart_guard_1_walk",
        },
        isMonsterJob: false,
        pathType: EJobPathType.PATH,
        section: "logic@test_smart_guard_1_walk",
        priority: 25,
      },
      {
        ...getSmartTerrainTaskDetails(),
        id: 8,
        type: EJobType.GUARD_FOLLOWER,
        preconditionFunction: jobPreconditionGuardFollower,
        preconditionParameters: {
          nextDesiredJob: "logic@test_smart_guard_1_walk",
        },
        isMonsterJob: false,
        pathType: EJobPathType.PATH,
        section: "logic@follower_test_smart_guard_1_walk",
        priority: 24,
      },
      {
        ...getSmartTerrainTaskDetails(),
        id: 9,
        type: EJobType.PATROL,
        preconditionFunction: jobPreconditionPatrol,
        preconditionParameters: {
          wayName: "test_smart_patrol_1_walk",
        },
        isMonsterJob: false,
        pathType: EJobPathType.PATH,
        section: "logic@test_smart_patrol_1_walk",
        priority: 20,
      },
      {
        ...getSmartTerrainTaskDetails(),
        id: 10,
        type: EJobType.PATROL,
        preconditionFunction: jobPreconditionPatrol,
        preconditionParameters: {
          wayName: "test_smart_patrol_1_walk",
        },
        isMonsterJob: false,
        pathType: EJobPathType.PATH,
        section: "logic@test_smart_patrol_1_walk",
        priority: 20,
      },
      {
        ...getSmartTerrainTaskDetails(),
        id: 11,
        type: EJobType.PATROL,
        preconditionFunction: jobPreconditionPatrol,
        preconditionParameters: {
          wayName: "test_smart_patrol_1_walk",
        },
        isMonsterJob: false,
        pathType: EJobPathType.PATH,
        section: "logic@test_smart_patrol_1_walk",
        priority: 20,
      },
      {
        ...getSmartTerrainTaskDetails(),
        id: 12,
        type: EJobType.WALKER,
        preconditionFunction: jobPreconditionWalker,
        preconditionParameters: {
          wayName: "test_smart_walker_1_walk",
        },
        isMonsterJob: false,
        pathType: EJobPathType.PATH,
        section: "logic@test_smart_walker_1_walk",
        priority: 15,
      },
      {
        ...getSmartTerrainTaskDetails(),
        id: 13,
        type: EJobType.ANIMPOINT,
        preconditionFunction: jobPreconditionAnimpoint,
        preconditionParameters: {},
        isMonsterJob: false,
        pathType: EJobPathType.SMART_COVER,
        section: "logic@test_smart_animpoint_1",
        priority: 15,
      },
      ...range(2, 1).map((it) => ({
        ...getSmartTerrainTaskDetails(),
        id: 13 + it,
        type: EJobType.SLEEP,
        preconditionFunction: jobPreconditionSleep,
        preconditionParameters: {
          wayName: `test_smart_sleep_${it}`,
        },
        isMonsterJob: false,
        pathType: EJobPathType.PATH,
        section: `logic@test_smart_sleep_${it}`,
        priority: 10,
      })),
      ...range(20, 1).map((it) => ({
        ...getSmartTerrainTaskDetails(),
        id: 15 + it,
        type: EJobType.MONSTER_HOME,
        isMonsterJob: true,
        pathType: EJobPathType.POINT,
        section: "logic@test_smart_home_" + it,
        priority: 10,
      })),
      ...range(20, 1).map((it) => ({
        ...getSmartTerrainTaskDetails(),
        id: 35 + it,
        type: EJobType.POINT,
        isMonsterJob: false,
        pathType: EJobPathType.POINT,
        section: "logic@test_smart_point_" + it,
        priority: 3,
      })),
    ]);
  });

  it("should correctly generate default jobs for empty smarts", async () => {
    const emptyJobsLtx: string = await readInGameTestLtx(path.resolve(__dirname, "__test__", "job_create.empty.ltx"));
    const smartTerrain: SmartTerrain = mockSmartTerrain("test_smart_empty");

    smartTerrain.on_register();

    const [jobsList, ltx, ltxName] = createSmartTerrainJobs(smartTerrain);

    expect(ltxName).toBe("*test_smart_empty");
    expect((ltx as unknown as MockIniFile<AnyObject>).content).toBe(emptyJobsLtx);
    expect(jobsList).toEqualLuaArrays([
      ...range(20, 1).map((it) => ({
        ...getSmartTerrainTaskDetails(),
        type: EJobType.MONSTER_HOME,
        id: it,
        pathType: EJobPathType.POINT,
        isMonsterJob: true,
        section: "logic@test_smart_empty_home_" + it,
        priority: 10,
      })),
      ...range(20, 1).map((it) => ({
        ...getSmartTerrainTaskDetails(),
        type: EJobType.POINT,
        id: it + 20,
        pathType: EJobPathType.POINT,
        isMonsterJob: false,
        section: "logic@test_smart_empty_point_" + it,
        priority: 3,
      })),
    ]);
  });
});
