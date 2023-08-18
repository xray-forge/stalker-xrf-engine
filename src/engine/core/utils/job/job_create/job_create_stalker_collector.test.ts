import * as path from "path";

import { describe, expect, it, jest } from "@jest/globals";

import { registerObject, registerZone } from "@/engine/core/database";
import { SmartTerrain, SmartTerrainControl } from "@/engine/core/objects";
import { EJobPathType, EJobType } from "@/engine/core/utils/job";
import { createStalkerCollectorJobs } from "@/engine/core/utils/job/job_create/job_create_stalker_collector";
import { ServerHumanObject } from "@/engine/lib/types";
import { mockSmartTerrain, readInGameTestLtx } from "@/fixtures/engine";
import { mockClientGameObject, mockServerAlifeHumanStalker } from "@/fixtures/xray";

describe("jobs_general should correctly generate stalker collector jobs", () => {
  it("should correctly generate default collector jobs with no collector patrols", async () => {
    const smartTerrain: SmartTerrain = mockSmartTerrain("smart_empty");
    const [jobsList, ltx] = createStalkerCollectorJobs(smartTerrain, new LuaTable());

    expect(ltx).toBe("");
    expect(jobsList).toEqualLuaArrays([]);
  });

  it("should correctly generate default collector jobs with test smart", async () => {
    const jobsLtx: string = await readInGameTestLtx(
      path.resolve(__dirname, "__test__", "job_create_stalker_collector.default.ltx")
    );

    const smartTerrain: SmartTerrain = mockSmartTerrain();
    const [jobsList, ltx] = createStalkerCollectorJobs(smartTerrain, new LuaTable());

    expect(ltx).toBe(jobsLtx);
    expect(jobsList).toEqualLuaArrays([
      {
        preconditionFunction: expect.any(Function),
        preconditionParameters: {},
        isMonsterJob: false,
        pathType: EJobPathType.PATH,
        section: "logic@test_smart_collector_1_walk",
        priority: 25,
        type: EJobType.COLLECTOR,
      },
    ]);
  });

  it("should correctly generate default collector jobs with restrictor", async () => {
    const jobsLtx: string = await readInGameTestLtx(
      path.resolve(__dirname, "__test__", "job_create_stalker_collector.restrictor.ltx")
    );

    const smartTerrain: SmartTerrain = mockSmartTerrain();

    smartTerrain.defendRestrictor = "test_defend_restrictor";

    const [jobsList, ltx] = createStalkerCollectorJobs(smartTerrain, new LuaTable());

    expect(ltx).toBe(jobsLtx);
    expect(jobsList).toEqualLuaArrays([
      {
        preconditionFunction: expect.any(Function),
        preconditionParameters: {},
        isMonsterJob: false,
        pathType: EJobPathType.PATH,
        section: "logic@test_smart_collector_1_walk",
        priority: 25,
        type: EJobType.COLLECTOR,
      },
    ]);
  });

  it("should correctly generate default collector jobs with ignore restrictor", async () => {
    const jobsLtx: string = await readInGameTestLtx(
      path.resolve(__dirname, "__test__", "job_create_stalker_collector.ignore.ltx")
    );

    const smartTerrain: SmartTerrain = mockSmartTerrain();

    smartTerrain.defendRestrictor = "test_defend_restrictor";
    smartTerrain.smartTerrainActorControl = { ignoreZone: "some_restrictor" } as SmartTerrainControl;

    registerZone(mockClientGameObject({ name: () => "some_restrictor", inside: () => true }));

    const [jobsList, ltx] = createStalkerCollectorJobs(smartTerrain, new LuaTable());

    expect(ltx).toBe(jobsLtx);
    expect(jobsList).toEqualLuaArrays([
      {
        preconditionFunction: expect.any(Function),
        preconditionParameters: {},
        isMonsterJob: false,
        pathType: EJobPathType.PATH,
        section: "logic@test_smart_collector_1_walk",
        priority: 25,
        type: EJobType.COLLECTOR,
      },
    ]);
  });

  it("should correctly generate default collector jobs with invulnerable state", async () => {
    const jobsLtx: string = await readInGameTestLtx(
      path.resolve(__dirname, "__test__", "job_create_stalker_collector.invulnerable.ltx")
    );

    const smartTerrain: SmartTerrain = mockSmartTerrain();

    smartTerrain.defendRestrictor = "test_defend_restrictor";
    smartTerrain.smartTerrainActorControl = { ignoreZone: "some_restrictor" } as SmartTerrainControl;
    smartTerrain.safeRestrictor = "safe_restrictor_test";

    registerZone(mockClientGameObject({ name: () => "safe_restrictor_test", inside: () => true }));

    const [jobsList, ltx, count] = createStalkerCollectorJobs(smartTerrain, new LuaTable());

    expect(ltx).toBe(jobsLtx);
    expect(jobsList).toEqualLuaArrays([
      {
        preconditionFunction: expect.any(Function),
        preconditionParameters: {},
        isMonsterJob: false,
        pathType: EJobPathType.PATH,
        section: "logic@test_smart_collector_1_walk",
        priority: 25,
        type: EJobType.COLLECTOR,
      },
    ]);
  });
});
