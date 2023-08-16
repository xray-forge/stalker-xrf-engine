import * as path from "path";

import { describe, expect, it, jest } from "@jest/globals";

import { IRegistryObjectState, registerObject, registry } from "@/engine/core/database";
import { SmartTerrain } from "@/engine/core/objects";
import { createStalkerSniperJobs } from "@/engine/core/utils/job/job_create/job_create_stalker_sniper";
import { ServerHumanObject } from "@/engine/lib/types";
import { readInGameTestLtx } from "@/fixtures/engine";
import { mockClientGameObject, mockServerAlifeHumanStalker } from "@/fixtures/xray";

describe("jobs_general should correctly generate stalker patrol jobs", () => {
  it("should correctly generate default patrol jobs with no sniper patrols", async () => {
    const smartTerrain: SmartTerrain = new SmartTerrain("test_smart");

    jest.spyOn(smartTerrain, "name").mockImplementation(() => "test_smart_without_sniper");

    const [jobsList, ltx] = createStalkerSniperJobs(smartTerrain);

    expect(ltx).toBe("");
    expect(jobsList).toEqualLuaTables({ priority: 30, jobs: $fromArray([]) });
  });

  it("should correctly generate default sniper jobs with test smart", async () => {
    const jobsLtx: string = await readInGameTestLtx(
      path.resolve(__dirname, "__test__", "job_create_stalker_sniper.default.ltx")
    );

    const smartTerrain: SmartTerrain = new SmartTerrain("test_smart");

    jest.spyOn(smartTerrain, "name").mockImplementation(() => "test_smart");

    const [jobsList, ltx, count] = createStalkerSniperJobs(smartTerrain);

    expect(count).toBe(1);
    expect(ltx).toBe(jobsLtx);
    expect(jobsList).toEqualLuaTables({
      jobs: $fromArray([
        {
          preconditionFunction: expect.any(Function),
          preconditionParameters: {
            way_name: "test_smart_sniper_1_walk",
          },
          jobId: {
            job_type: "path_job",
            section: "logic@test_smart_sniper_1_walk",
          },
          priority: 30,
        },
      ]),
      priority: 30,
    });
  });

  it("should correctly generate default sniper jobs with restrictor", async () => {
    const jobsLtx: string = await readInGameTestLtx(
      path.resolve(__dirname, "__test__", "job_create_stalker_sniper.restrictor.ltx")
    );

    const smartTerrain: SmartTerrain = new SmartTerrain("test_smart");

    smartTerrain.defendRestrictor = "test_defend_restrictor";

    jest.spyOn(smartTerrain, "name").mockImplementation(() => "test_smart");

    const [jobsList, ltx, count] = createStalkerSniperJobs(smartTerrain);

    expect(count).toBe(1);
    expect(ltx).toBe(jobsLtx);
    expect(jobsList).toEqualLuaTables({
      jobs: $fromArray([
        {
          preconditionFunction: expect.any(Function),
          preconditionParameters: {
            way_name: "test_smart_sniper_1_walk",
          },
          jobId: {
            job_type: "path_job",
            section: "logic@test_smart_sniper_1_walk",
          },
          priority: 30,
        },
      ]),
      priority: 30,
    });
  });

  it("should correctly check sniper jobs preconditions", async () => {
    const smartTerrain: SmartTerrain = new SmartTerrain("test_smart");
    const stalker: ServerHumanObject = mockServerAlifeHumanStalker();

    jest.spyOn(smartTerrain, "name").mockImplementation(() => "test_smart");

    const [jobsList] = createStalkerSniperJobs(smartTerrain);
    const precondition = jobsList.jobs.get(1).preconditionFunction;

    registry.objects.set(stalker.id, { object: null } as unknown as IRegistryObjectState);

    expect(precondition?.(stalker, smartTerrain, {}, {})).toBe(false);

    registerObject(mockClientGameObject({ idOverride: stalker.id }));
    expect(precondition?.(stalker, smartTerrain, {}, {})).toBe(true);

    jest.spyOn(stalker, "community").mockImplementation(() => "zombied");
    expect(precondition?.(stalker, smartTerrain, {}, {})).toBe(false);
  });
});
