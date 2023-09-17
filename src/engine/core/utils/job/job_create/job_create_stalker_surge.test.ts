import * as path from "path";

import { describe, expect, it } from "@jest/globals";

import { registerZone } from "@/engine/core/database";
import { SmartTerrain, SmartTerrainControl } from "@/engine/core/objects/server/smart_terrain";
import { EJobPathType, EJobType } from "@/engine/core/utils/job";
import { createStalkerSurgeJobs } from "@/engine/core/utils/job/job_create/job_create_stalker_surge";
import { jobPreconditionSurge } from "@/engine/core/utils/job/job_precondition";
import { range } from "@/engine/core/utils/number";
import { StringBuilder } from "@/engine/core/utils/string";
import { mockSmartTerrain, readInGameTestLtx } from "@/fixtures/engine";
import { mockClientGameObject } from "@/fixtures/xray";

describe("jobs_general should correctly generate stalkers surge jobs", () => {
  it("should correctly generate surge jobs for stalkers when no patrols exist", async () => {
    const smartTerrain: SmartTerrain = mockSmartTerrain("test_surge_paths_smart");

    const [jobs, builder] = createStalkerSurgeJobs(smartTerrain, new LuaTable(), new StringBuilder());

    expect(builder.build()).toBe("");
    expect(jobs).toEqualLuaArrays([]);
  });

  it("should correctly generate surge jobs for stalkers when patrols exist", async () => {
    const surgeJobsLtx: string = await readInGameTestLtx(
      path.resolve(__dirname, "__test__", "job_create_stalker_surge.ltx")
    );
    const smartTerrain: SmartTerrain = mockSmartTerrain();

    smartTerrain.defendRestrictor = null;

    const [jobs, builder] = createStalkerSurgeJobs(smartTerrain, new LuaTable(), new StringBuilder());

    expect(builder.build()).toBe(surgeJobsLtx);
    expect(jobs).toEqualLuaArrays(
      range(3, 1).map((it) => ({
        preconditionFunction: jobPreconditionSurge,
        preconditionParameters: {},
        isMonsterJob: false,
        pathType: EJobPathType.PATH,
        section: `logic@test_smart_surge_${it}_walk`,
        type: EJobType.SURGE,
        priority: 50,
      }))
    );
  });

  it("should correctly generate surge jobs for stalkers when patrols exist with restrictors", async () => {
    const surgeJobsLtx: string = await readInGameTestLtx(
      path.resolve(__dirname, "__test__", "job_create_stalker_surge.restrictors.ltx")
    );
    const smartTerrain: SmartTerrain = mockSmartTerrain();

    smartTerrain.defendRestrictor = "def_restrictor_test";
    smartTerrain.smartTerrainActorControl = { ignoreZone: "test_ignore_zone" } as SmartTerrainControl;

    const [jobs, builder] = createStalkerSurgeJobs(smartTerrain, new LuaTable(), new StringBuilder());

    expect(builder.build()).toBe(surgeJobsLtx);
    expect(jobs).toEqualLuaArrays(
      range(3, 1).map((it) => ({
        preconditionFunction: jobPreconditionSurge,
        preconditionParameters: {},
        isMonsterJob: false,
        pathType: EJobPathType.PATH,
        section: `logic@test_smart_surge_${it}_walk`,
        type: EJobType.SURGE,
        priority: 50,
      }))
    );
  });

  it("should correctly generate surge jobs for stalkers when patrols exist, when in restrictor", async () => {
    const surgeJobsLtx: string = await readInGameTestLtx(
      path.resolve(__dirname, "__test__", "job_create_stalker_surge.ignore.ltx")
    );
    const smartTerrain: SmartTerrain = mockSmartTerrain();

    registerZone(mockClientGameObject({ name: () => "some_restrictor", inside: () => true }));

    smartTerrain.defendRestrictor = "def_restrictor_test";
    smartTerrain.smartTerrainActorControl = { ignoreZone: "some_restrictor" } as SmartTerrainControl;

    const [jobs, builder] = createStalkerSurgeJobs(smartTerrain, new LuaTable(), new StringBuilder());

    expect(builder.build()).toBe(surgeJobsLtx);
    expect(jobs).toEqualLuaArrays(
      range(3, 1).map((it) => ({
        preconditionFunction: jobPreconditionSurge,
        preconditionParameters: {},
        isMonsterJob: false,
        pathType: EJobPathType.PATH,
        section: `logic@test_smart_surge_${it}_walk`,
        type: EJobType.SURGE,
        priority: 50,
      }))
    );
  });
});
