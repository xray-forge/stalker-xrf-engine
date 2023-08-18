import * as path from "path";

import { describe, expect, it, jest } from "@jest/globals";

import { registerZone } from "@/engine/core/database";
import { SmartTerrain, SmartTerrainControl } from "@/engine/core/objects";
import { EJobPathType, EJobType } from "@/engine/core/utils/job";
import { createStalkerWalkerJobs } from "@/engine/core/utils/job/job_create/job_create_stalker_walker";
import { jobPreconditionWalker } from "@/engine/core/utils/job/job_precondition";
import { mockSmartTerrain, readInGameTestLtx } from "@/fixtures/engine";
import { mockClientGameObject } from "@/fixtures/xray";

describe("jobs_general should correctly generate stalker walker jobs", () => {
  it("should correctly generate default walker jobs with no patrols", async () => {
    const smartTerrain: SmartTerrain = mockSmartTerrain("test_smart_without_walker");

    const [jobsList, ltx] = createStalkerWalkerJobs(smartTerrain, new LuaTable());

    expect(ltx).toBe("");
    expect(jobsList).toEqualLuaArrays([]);
  });

  it("should correctly generate default walker jobs with test smart", async () => {
    const jobsLtx: string = await readInGameTestLtx(
      path.resolve(__dirname, "__test__", "job_create_stalker_walker.default.ltx")
    );

    const smartTerrain: SmartTerrain = mockSmartTerrain();
    const [jobsList, ltx] = createStalkerWalkerJobs(smartTerrain, new LuaTable());

    expect(ltx).toBe(jobsLtx);
    expect(jobsList).toEqualLuaArrays([
      {
        isMonsterJob: false,
        preconditionFunction: jobPreconditionWalker,
        preconditionParameters: {
          wayName: "test_smart_walker_1_walk",
        },
        pathType: EJobPathType.PATH,
        section: "logic@test_smart_walker_1_walk",
        type: EJobType.WALKER,
        priority: 15,
      },
    ]);
  });

  it("should correctly generate default walker jobs with restrictor", async () => {
    const jobsLtx: string = await readInGameTestLtx(
      path.resolve(__dirname, "__test__", "job_create_stalker_walker.restrictor.ltx")
    );

    const smartTerrain: SmartTerrain = mockSmartTerrain();

    smartTerrain.defendRestrictor = "test_defend_restrictor";

    jest.spyOn(smartTerrain, "name").mockImplementation(() => "test_smart");

    const [jobsList, ltx] = createStalkerWalkerJobs(smartTerrain, new LuaTable());

    expect(ltx).toBe(jobsLtx);
    expect(jobsList).toEqualLuaArrays([
      {
        isMonsterJob: false,
        preconditionFunction: jobPreconditionWalker,
        preconditionParameters: {
          wayName: "test_smart_walker_1_walk",
        },
        pathType: EJobPathType.PATH,
        section: "logic@test_smart_walker_1_walk",
        type: EJobType.WALKER,
        priority: 15,
      },
    ]);
  });

  it("should correctly generate default walker jobs with ignore restrictor", async () => {
    const jobsLtx: string = await readInGameTestLtx(
      path.resolve(__dirname, "__test__", "job_create_stalker_walker.ignore.ltx")
    );

    const smartTerrain: SmartTerrain = mockSmartTerrain();

    smartTerrain.defendRestrictor = "test_defend_restrictor";
    smartTerrain.smartTerrainActorControl = { ignoreZone: "some_restrictor" } as SmartTerrainControl;

    registerZone(mockClientGameObject({ name: () => "some_restrictor", inside: () => true }));

    jest.spyOn(smartTerrain, "name").mockImplementation(() => "test_smart");

    const [jobsList, ltx] = createStalkerWalkerJobs(smartTerrain, new LuaTable());

    expect(ltx).toBe(jobsLtx);
    expect(jobsList).toEqualLuaArrays([
      {
        isMonsterJob: false,
        preconditionFunction: jobPreconditionWalker,
        preconditionParameters: {
          wayName: "test_smart_walker_1_walk",
        },
        pathType: EJobPathType.PATH,
        section: "logic@test_smart_walker_1_walk",
        type: EJobType.WALKER,
        priority: 15,
      },
    ]);
  });

  it("should correctly generate default walker jobs with invulnerable state", async () => {
    const jobsLtx: string = await readInGameTestLtx(
      path.resolve(__dirname, "__test__", "job_create_stalker_walker.invulnerable.ltx")
    );

    const smartTerrain: SmartTerrain = mockSmartTerrain();

    smartTerrain.defendRestrictor = "test_defend_restrictor";
    smartTerrain.smartTerrainActorControl = { ignoreZone: "some_restrictor" } as SmartTerrainControl;
    smartTerrain.safeRestrictor = "safe_restrictor_test";

    registerZone(mockClientGameObject({ name: () => "safe_restrictor_test", inside: () => true }));

    jest.spyOn(smartTerrain, "name").mockImplementation(() => "test_smart");

    const [jobsList, ltx] = createStalkerWalkerJobs(smartTerrain, new LuaTable());

    expect(ltx).toBe(jobsLtx);
    expect(jobsList).toEqualLuaArrays([
      {
        isMonsterJob: false,
        preconditionFunction: jobPreconditionWalker,
        preconditionParameters: {
          wayName: "test_smart_walker_1_walk",
        },
        pathType: EJobPathType.PATH,
        section: "logic@test_smart_walker_1_walk",
        type: EJobType.WALKER,
        priority: 15,
      },
    ]);
  });
});
