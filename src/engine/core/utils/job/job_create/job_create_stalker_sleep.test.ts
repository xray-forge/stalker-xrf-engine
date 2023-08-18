import * as path from "path";

import { describe, expect, it, jest } from "@jest/globals";
import { level } from "xray16";

import { registerZone } from "@/engine/core/database";
import { SmartTerrain, SmartTerrainControl } from "@/engine/core/objects";
import { EJobPathType, EJobType } from "@/engine/core/utils/job";
import { createStalkerSleepJobs } from "@/engine/core/utils/job/job_create/job_create_stalker_sleep";
import { range } from "@/engine/core/utils/number";
import { ServerHumanObject } from "@/engine/lib/types";
import { mockSmartTerrain, readInGameTestLtx } from "@/fixtures/engine";
import { mockClientGameObject, MockCTime, mockServerAlifeHumanStalker } from "@/fixtures/xray";

describe("jobs_general should correctly generate stalkers sleep jobs", () => {
  it("should correctly generate sleep jobs for stalkers when no patrols exist", async () => {
    const smartTerrain: SmartTerrain = mockSmartTerrain("empty_smart");
    const [jobsList, ltx] = createStalkerSleepJobs(smartTerrain, new LuaTable());

    expect(ltx).toBe("");
    expect(jobsList).toEqualLuaArrays([]);
  });

  it("should correctly generate sleep jobs for stalkers when patrols exist", async () => {
    const surgeJobsLtx: string = await readInGameTestLtx(
      path.resolve(__dirname, "__test__", "job_create_stalker_sleep.ltx")
    );

    const smartTerrain: SmartTerrain = mockSmartTerrain();

    smartTerrain.defendRestrictor = null;

    const [jobsList, ltx] = createStalkerSleepJobs(smartTerrain, new LuaTable());

    expect(ltx).toBe(surgeJobsLtx);
    expect(jobsList).toEqualLuaArrays(
      range(2, 1).map((it) => ({
        preconditionFunction: expect.any(Function),
        preconditionParameters: {
          wayName: `test_smart_sleep_${it}`,
        },
        isMonsterJob: false,
        pathType: EJobPathType.PATH,
        section: `logic@test_smart_sleep_${it}`,
        type: EJobType.SLEEP,
        priority: 10,
      }))
    );
  });

  it("should correctly generate sleep jobs for stalkers when patrols exist with restrictors", async () => {
    const surgeJobsLtx: string = await readInGameTestLtx(
      path.resolve(__dirname, "__test__", "job_create_stalker_sleep.restrictors.ltx")
    );

    const smartTerrain: SmartTerrain = mockSmartTerrain();

    smartTerrain.defendRestrictor = "def_restrictor_test";
    smartTerrain.smartTerrainActorControl = { ignoreZone: "test_ignore_zone" } as SmartTerrainControl;

    const [jobsList, ltx] = createStalkerSleepJobs(smartTerrain, new LuaTable());

    expect(ltx).toBe(surgeJobsLtx);
    expect(jobsList).toEqualLuaArrays(
      range(2, 1).map((it) => ({
        preconditionFunction: expect.any(Function),
        preconditionParameters: {
          wayName: `test_smart_sleep_${it}`,
        },
        isMonsterJob: false,
        pathType: EJobPathType.PATH,
        section: `logic@test_smart_sleep_${it}`,
        type: EJobType.SLEEP,
        priority: 10,
      }))
    );
  });

  it("should correctly generate sleep jobs for stalkers when patrols exist, when in restrictor", async () => {
    const surgeJobsLtx: string = await readInGameTestLtx(
      path.resolve(__dirname, "__test__", "job_create_stalker_sleep.ignore.ltx")
    );

    const smartTerrain: SmartTerrain = mockSmartTerrain();

    registerZone(mockClientGameObject({ name: () => "some_restrictor", inside: () => true }));

    smartTerrain.defendRestrictor = "def_restrictor_test";
    smartTerrain.smartTerrainActorControl = { ignoreZone: "some_restrictor" } as SmartTerrainControl;

    const [jobsList, ltx] = createStalkerSleepJobs(smartTerrain, new LuaTable());

    expect(ltx).toBe(surgeJobsLtx);
    expect(jobsList).toEqualLuaArrays(
      range(2, 1).map((it) => ({
        preconditionFunction: expect.any(Function),
        preconditionParameters: {
          wayName: `test_smart_sleep_${it}`,
        },
        isMonsterJob: false,
        pathType: EJobPathType.PATH,
        section: `logic@test_smart_sleep_${it}`,
        type: EJobType.SLEEP,
        priority: 10,
      }))
    );
  });

  it("should correctly generate sleep jobs for stalkers when patrols exist with invulnerable state", async () => {
    const surgeJobsLtx: string = await readInGameTestLtx(
      path.resolve(__dirname, "__test__", "job_create_stalker_sleep.invulnerable.ltx")
    );

    const smartTerrain: SmartTerrain = mockSmartTerrain();

    registerZone(mockClientGameObject({ name: () => "safe_restrictor_test", inside: () => true }));

    smartTerrain.safeRestrictor = "safe_restrictor_test";
    smartTerrain.smartTerrainActorControl = { ignoreZone: "test_ignore_zone" } as SmartTerrainControl;

    const [jobsList, ltx] = createStalkerSleepJobs(smartTerrain, new LuaTable());

    expect(ltx).toBe(surgeJobsLtx);
    expect(jobsList).toEqualLuaArrays(
      range(2, 1).map((it) => ({
        preconditionFunction: expect.any(Function),
        preconditionParameters: {
          wayName: `test_smart_sleep_${it}`,
        },
        isMonsterJob: false,
        pathType: EJobPathType.PATH,
        section: `logic@test_smart_sleep_${it}`,
        type: EJobType.SLEEP,
        priority: 10,
      }))
    );
  });
});
