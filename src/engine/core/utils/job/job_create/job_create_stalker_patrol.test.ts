import * as path from "path";

import { describe, expect, it, jest } from "@jest/globals";

import { registerZone } from "@/engine/core/database";
import { SmartTerrain, SmartTerrainControl } from "@/engine/core/objects";
import { EJobPathType, EJobType } from "@/engine/core/utils/job";
import { createStalkerPatrolJobs } from "@/engine/core/utils/job/job_create/job_create_stalker_patrol";
import { jobPreconditionPatrol } from "@/engine/core/utils/job/job_precondition";
import { range } from "@/engine/core/utils/number";
import { mockSmartTerrain, readInGameTestLtx } from "@/fixtures/engine";
import { mockClientGameObject } from "@/fixtures/xray";

describe("jobs_general should correctly generate stalker patrol jobs", () => {
  it("should correctly generate default patrol jobs with no patrols", async () => {
    const smartTerrain: SmartTerrain = mockSmartTerrain("empty_smart");
    const [jobsList, ltx] = createStalkerPatrolJobs(smartTerrain, new LuaTable());

    expect(ltx).toBe("");
    expect(jobsList).toEqualLuaArrays([]);
  });

  it("should correctly generate default patrol jobs with test smart", async () => {
    const jobsLtx: string = await readInGameTestLtx(
      path.resolve(__dirname, "__test__", "job_create_stalker_patrol.default.ltx")
    );

    const smartTerrain: SmartTerrain = mockSmartTerrain();
    const [jobsList, ltx] = createStalkerPatrolJobs(smartTerrain, new LuaTable());

    expect(ltx).toBe(jobsLtx);
    expect(jobsList).toEqualLuaArrays(
      range(3).map(() => ({
        preconditionFunction: jobPreconditionPatrol,
        preconditionParameters: {
          wayName: "test_smart_patrol_1_walk",
        },
        isMonsterJob: false,
        pathType: EJobPathType.PATH,
        section: "logic@test_smart_patrol_1_walk",
        type: EJobType.PATROL,
        priority: 20,
      }))
    );
  });

  it("should correctly generate default patrol jobs with restrictor", async () => {
    const jobsLtx: string = await readInGameTestLtx(
      path.resolve(__dirname, "__test__", "job_create_stalker_patrol.restrictor.ltx")
    );

    const smartTerrain: SmartTerrain = mockSmartTerrain();

    smartTerrain.defendRestrictor = "test_defend_restrictor";

    const [jobsList, ltx] = createStalkerPatrolJobs(smartTerrain, new LuaTable());

    expect(ltx).toBe(jobsLtx);
    expect(jobsList).toEqualLuaArrays(
      range(3).map(() => ({
        preconditionFunction: jobPreconditionPatrol,
        preconditionParameters: {
          wayName: "test_smart_patrol_1_walk",
        },
        isMonsterJob: false,
        pathType: EJobPathType.PATH,
        section: "logic@test_smart_patrol_1_walk",
        type: EJobType.PATROL,
        priority: 20,
      }))
    );
  });

  it("should correctly generate default patrol jobs with ignore restrictor", async () => {
    const jobsLtx: string = await readInGameTestLtx(
      path.resolve(__dirname, "__test__", "job_create_stalker_patrol.ignore.ltx")
    );

    const smartTerrain: SmartTerrain = mockSmartTerrain();

    smartTerrain.defendRestrictor = "test_defend_restrictor";
    smartTerrain.smartTerrainActorControl = { ignoreZone: "some_restrictor" } as SmartTerrainControl;

    registerZone(mockClientGameObject({ name: () => "some_restrictor", inside: () => true }));

    jest.spyOn(smartTerrain, "name").mockImplementation(() => "test_smart");

    const [jobsList, ltx] = createStalkerPatrolJobs(smartTerrain, new LuaTable());

    expect(ltx).toBe(jobsLtx);
    expect(jobsList).toEqualLuaArrays(
      range(3).map(() => ({
        preconditionFunction: jobPreconditionPatrol,
        preconditionParameters: {
          wayName: "test_smart_patrol_1_walk",
        },
        isMonsterJob: false,
        pathType: EJobPathType.PATH,
        section: "logic@test_smart_patrol_1_walk",
        type: EJobType.PATROL,
        priority: 20,
      }))
    );
  });

  it("should correctly generate default patrol jobs with invulnerable state", async () => {
    const jobsLtx: string = await readInGameTestLtx(
      path.resolve(__dirname, "__test__", "job_create_stalker_patrol.invulnerable.ltx")
    );

    const smartTerrain: SmartTerrain = mockSmartTerrain();

    smartTerrain.defendRestrictor = "test_defend_restrictor";
    smartTerrain.smartTerrainActorControl = { ignoreZone: "some_restrictor" } as SmartTerrainControl;
    smartTerrain.safeRestrictor = "safe_restrictor_test";

    registerZone(mockClientGameObject({ name: () => "safe_restrictor_test", inside: () => true }));

    const [jobsList, ltx] = createStalkerPatrolJobs(smartTerrain, new LuaTable());

    expect(ltx).toBe(jobsLtx);
    expect(jobsList).toEqualLuaArrays(
      range(3).map(() => ({
        preconditionFunction: jobPreconditionPatrol,
        preconditionParameters: {
          wayName: "test_smart_patrol_1_walk",
        },
        isMonsterJob: false,
        pathType: EJobPathType.PATH,
        section: "logic@test_smart_patrol_1_walk",
        type: EJobType.PATROL,
        priority: 20,
      }))
    );
  });
});
