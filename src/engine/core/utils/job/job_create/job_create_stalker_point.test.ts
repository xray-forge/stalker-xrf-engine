import * as path from "path";

import { describe, expect, it } from "@jest/globals";

import { SmartTerrain, SmartTerrainControl } from "@/engine/core/objects";
import { EJobPathType, EJobType } from "@/engine/core/utils/job";
import { createStalkerPointJobs } from "@/engine/core/utils/job/job_create/job_create_stalker_point";
import { range } from "@/engine/core/utils/number";
import { mockSmartTerrain, readInGameTestLtx } from "@/fixtures/engine";

describe("should correctly generate stalkers point jobs", () => {
  it("should correctly generate point jobs for stalkers with empty smarts", async () => {
    const pointJobsLtx: string = await readInGameTestLtx(
      path.resolve(__dirname, "__test__", "job_create_stalker_point.empty.ltx")
    );

    const smartTerrain: SmartTerrain = mockSmartTerrain("empty_smart");
    const [jobsList, ltx] = createStalkerPointJobs(smartTerrain, new LuaTable());

    expect(ltx).toBe(pointJobsLtx);
    expect(jobsList).toEqualLuaArrays(
      range(20, 1).map((it) => ({
        isMonsterJob: false,
        pathType: EJobPathType.POINT,
        section: "logic@empty_smart_point_" + it,
        type: EJobType.POINT,
        priority: 3,
      }))
    );
  });
  it("should correctly generate point jobs for stalkers", async () => {
    const pointJobsLtx: string = await readInGameTestLtx(
      path.resolve(__dirname, "__test__", "job_create_stalker_point.default.ltx")
    );

    const smartTerrain: SmartTerrain = mockSmartTerrain();
    const [jobsList, ltx] = createStalkerPointJobs(smartTerrain, new LuaTable());

    expect(ltx).toBe(pointJobsLtx);
    expect(jobsList).toEqualLuaArrays(
      range(20, 1).map((it) => ({
        isMonsterJob: false,
        pathType: EJobPathType.POINT,
        section: "logic@test_smart_point_" + it,
        type: EJobType.POINT,
        priority: 3,
      }))
    );
  });

  it("should correctly generate point jobs for stalkers with extended smart terrains", async () => {
    const pointJobsLtx: string = await readInGameTestLtx(
      path.resolve(__dirname, "__test__", "job_create_stalker_point.restrictors.ltx")
    );

    const smartTerrain: SmartTerrain = mockSmartTerrain();

    smartTerrain.defendRestrictor = "def_restrictor_test";
    smartTerrain.smartTerrainActorControl = { ignoreZone: "test_ignore_zone" } as SmartTerrainControl;

    const [jobsList, ltx] = createStalkerPointJobs(smartTerrain, new LuaTable());

    expect(ltx).toBe(pointJobsLtx);
    expect(jobsList).toEqualLuaArrays(
      range(20, 1).map((it) => ({
        isMonsterJob: false,
        pathType: EJobPathType.POINT,
        section: "logic@test_smart_point_" + it,
        type: EJobType.POINT,
        priority: 3,
      }))
    );
  });
});
