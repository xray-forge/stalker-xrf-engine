import * as path from "path";

import { describe, expect, it, jest } from "@jest/globals";

import { IRegistryObjectState, registerObject, registry } from "@/engine/core/database";
import { SmartTerrain } from "@/engine/core/objects";
import { EJobPathType, EJobType } from "@/engine/core/utils/job";
import { createStalkerSniperJobs } from "@/engine/core/utils/job/job_create/job_create_stalker_sniper";
import { jobPreconditionSniper } from "@/engine/core/utils/job/job_precondition";
import { ServerHumanObject } from "@/engine/lib/types";
import { mockSmartTerrain, readInGameTestLtx } from "@/fixtures/engine";
import { mockClientGameObject, mockServerAlifeHumanStalker } from "@/fixtures/xray";

describe("jobs_general should correctly generate stalker patrol jobs", () => {
  it("should correctly generate default patrol jobs with no sniper patrols", async () => {
    const smartTerrain: SmartTerrain = mockSmartTerrain("empty_smart");

    const [jobsList, ltx] = createStalkerSniperJobs(smartTerrain, new LuaTable());

    expect(ltx).toBe("");
    expect(jobsList).toEqualLuaArrays([]);
  });

  it("should correctly generate default sniper jobs with test smart", async () => {
    const jobsLtx: string = await readInGameTestLtx(
      path.resolve(__dirname, "__test__", "job_create_stalker_sniper.default.ltx")
    );

    const smartTerrain: SmartTerrain = mockSmartTerrain();
    const [jobsList, ltx] = createStalkerSniperJobs(smartTerrain, new LuaTable());

    expect(ltx).toBe(jobsLtx);
    expect(jobsList).toEqualLuaArrays([
      {
        preconditionFunction: jobPreconditionSniper,
        preconditionParameters: {
          wayName: "test_smart_sniper_1_walk",
        },
        isMonsterJob: false,
        pathType: EJobPathType.PATH,
        section: "logic@test_smart_sniper_1_walk",
        type: EJobType.SNIPER,
        priority: 30,
      },
    ]);
  });

  it("should correctly generate default sniper jobs with restrictor", async () => {
    const jobsLtx: string = await readInGameTestLtx(
      path.resolve(__dirname, "__test__", "job_create_stalker_sniper.restrictor.ltx")
    );
    const smartTerrain: SmartTerrain = mockSmartTerrain();

    smartTerrain.defendRestrictor = "test_defend_restrictor";

    const [jobsList, ltx] = createStalkerSniperJobs(smartTerrain, new LuaTable());

    expect(ltx).toBe(jobsLtx);
    expect(jobsList).toEqualLuaArrays([
      {
        preconditionFunction: jobPreconditionSniper,
        preconditionParameters: {
          wayName: "test_smart_sniper_1_walk",
        },
        isMonsterJob: false,
        pathType: EJobPathType.PATH,
        section: "logic@test_smart_sniper_1_walk",
        type: EJobType.SNIPER,
        priority: 30,
      },
    ]);
  });
});
