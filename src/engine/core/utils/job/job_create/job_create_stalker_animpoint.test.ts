import * as path from "path";

import { beforeEach, describe, expect, it } from "@jest/globals";

import { registerSmartCover, registry } from "@/engine/core/database";
import { SmartCover, SmartTerrain, SmartTerrainControl } from "@/engine/core/objects";
import { EJobPathType, EJobType } from "@/engine/core/utils/job";
import { createStalkerAnimpointJobs } from "@/engine/core/utils/job/job_create/job_create_stalker_animpoint";
import { StringBuilder } from "@/engine/core/utils/string";
import { mockSmartCover, mockSmartTerrain, readInGameTestLtx } from "@/fixtures/engine";

describe("should correctly generate stalker animpoint jobs", () => {
  beforeEach(() => {
    registry.smartCovers = new LuaTable();
  });

  it("should correctly generate default animpoint jobs with no smart covers", async () => {
    const smartTerrain: SmartTerrain = mockSmartTerrain();
    const [jobs, builder] = createStalkerAnimpointJobs(smartTerrain, new LuaTable(), new StringBuilder());

    expect(builder.build()).toBe("");
    expect(jobs).toEqualLuaArrays([]);
  });

  it("should correctly generate default animpoint jobs with available smart covers", async () => {
    const jobsLtx: string = await readInGameTestLtx(
      path.resolve(__dirname, "__test__", "job_create_stalker_animpoint.default.ltx")
    );

    const smartTerrain: SmartTerrain = mockSmartTerrain();
    const smartCover: SmartCover = mockSmartCover("test_smart_animpoint_1");

    registerSmartCover(smartCover);

    const [jobs, builder] = createStalkerAnimpointJobs(smartTerrain, new LuaTable(), new StringBuilder());

    expect(builder.build()).toBe(jobsLtx);
    expect(jobs).toEqualLuaArrays([
      {
        preconditionFunction: expect.any(Function),
        preconditionParameters: {},
        isMonsterJob: false,
        pathType: EJobPathType.SMART_COVER,
        section: "logic@test_smart_animpoint_1",
        priority: 15,
        type: EJobType.ANIMPOINT,
      },
    ]);
  });

  it("should correctly generate default animpoint jobs with defend restrictor", async () => {
    const jobsLtx: string = await readInGameTestLtx(
      path.resolve(__dirname, "__test__", "job_create_stalker_animpoint.restrictor.ltx")
    );

    const smartTerrain: SmartTerrain = mockSmartTerrain();
    const smartCover: SmartCover = mockSmartCover("test_smart_animpoint_1");

    smartTerrain.defendRestrictor = "test_defend_restrictor";

    registerSmartCover(smartCover);

    const [jobs, builder] = createStalkerAnimpointJobs(smartTerrain, new LuaTable(), new StringBuilder());

    expect(builder.build()).toBe(jobsLtx);
    expect(jobs).toEqualLuaArrays([
      {
        preconditionFunction: expect.any(Function),
        preconditionParameters: {},
        isMonsterJob: false,
        pathType: EJobPathType.SMART_COVER,
        section: "logic@test_smart_animpoint_1",
        priority: 15,
        type: EJobType.ANIMPOINT,
      },
    ]);
  });

  it("should correctly generate default animpoint jobs with ignore restrictor", async () => {
    const jobsLtx: string = await readInGameTestLtx(
      path.resolve(__dirname, "__test__", "job_create_stalker_animpoint.ignore.ltx")
    );

    const smartTerrain: SmartTerrain = mockSmartTerrain();
    const smartCover: SmartCover = mockSmartCover("test_smart_animpoint_1");

    smartTerrain.defendRestrictor = "test_defend_restrictor";
    smartTerrain.smartTerrainActorControl = { ignoreZone: "test_ignore_zone" } as SmartTerrainControl;

    registerSmartCover(smartCover);

    const [jobs, builder] = createStalkerAnimpointJobs(smartTerrain, new LuaTable(), new StringBuilder());

    expect(builder.build()).toBe(jobsLtx);
    expect(jobs).toEqualLuaArrays([
      {
        preconditionFunction: expect.any(Function),
        preconditionParameters: {},
        isMonsterJob: false,
        pathType: EJobPathType.SMART_COVER,
        section: "logic@test_smart_animpoint_1",
        priority: 15,
        type: EJobType.ANIMPOINT,
      },
    ]);
  });
});
