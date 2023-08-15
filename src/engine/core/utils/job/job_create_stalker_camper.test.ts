import * as path from "path";

import { describe, expect, it, jest } from "@jest/globals";

import { IRegistryObjectState, registerObject, registry } from "@/engine/core/database";
import { SmartTerrain } from "@/engine/core/objects";
import { createStalkerCamperJobs } from "@/engine/core/utils/job/job_create_stalker_camper";
import { ServerHumanObject } from "@/engine/lib/types";
import { readInGameTestLtx } from "@/fixtures/engine";
import { mockClientGameObject, mockServerAlifeHumanStalker } from "@/fixtures/xray";

describe("jobs_general should correctly generate stalker camper jobs", () => {
  it("should correctly generate default camper jobs with no camp patrols", async () => {
    const smartTerrain: SmartTerrain = new SmartTerrain("test_smart");

    smartTerrain.ini = smartTerrain.spawn_ini();

    jest.spyOn(smartTerrain, "name").mockImplementation(() => "test_smart_without_camps");

    const [jobsList, ltx] = createStalkerCamperJobs(smartTerrain);

    expect(ltx).toBe("");
    expect(jobsList).toEqualLuaTables({ priority: 45, jobs: $fromArray([]) });
  });

  it("should correctly generate default camper jobs with test smart", async () => {
    const jobsLtx: string = await readInGameTestLtx(
      path.resolve(__dirname, "__test__", "job_create_stalker_camper.default.ltx")
    );

    const smartTerrain: SmartTerrain = new SmartTerrain("test_smart");

    smartTerrain.ini = smartTerrain.spawn_ini();

    jest.spyOn(smartTerrain, "name").mockImplementation(() => "test_smart");

    const [jobsList, ltx, count] = createStalkerCamperJobs(smartTerrain);

    expect(count).toBe(2);
    expect(ltx).toBe(jobsLtx);
    expect(jobsList).toEqualLuaTables({
      priority: 45,
      jobs: $fromArray([
        {
          _precondition_function: expect.any(Function),
          _precondition_params: {
            way_name: "test_smart_camper_1_walk",
          },
          job_id: {
            job_type: "path_job",
            section: "logic@test_smart_camper_1_walk",
          },
          priority: 45,
        },
      ]),
    });
  });

  it("should correctly generate default camper jobs with restrictor", async () => {
    const jobsLtx: string = await readInGameTestLtx(
      path.resolve(__dirname, "__test__", "job_create_stalker_camper.restrictor.ltx")
    );

    const smartTerrain: SmartTerrain = new SmartTerrain("test_smart");

    smartTerrain.ini = smartTerrain.spawn_ini();
    smartTerrain.defendRestrictor = "test_defend_restrictor";

    jest.spyOn(smartTerrain, "name").mockImplementation(() => "test_smart");

    const [jobsList, ltx, count] = createStalkerCamperJobs(smartTerrain);

    expect(count).toBe(2);
    expect(ltx).toBe(jobsLtx);
    expect(jobsList).toEqualLuaTables({
      priority: 45,
      jobs: $fromArray([
        {
          _precondition_function: expect.any(Function),
          _precondition_params: {
            way_name: "test_smart_camper_1_walk",
          },
          job_id: {
            job_type: "path_job",
            section: "logic@test_smart_camper_1_walk",
          },
          priority: 45,
        },
      ]),
    });
  });

  it("should correctly check camper jobs preconditions", async () => {
    const smartTerrain: SmartTerrain = new SmartTerrain("test_smart");
    const stalker: ServerHumanObject = mockServerAlifeHumanStalker();

    smartTerrain.ini = smartTerrain.spawn_ini();

    jest.spyOn(smartTerrain, "name").mockImplementation(() => "test_smart");

    const [jobsList] = createStalkerCamperJobs(smartTerrain);
    const precondition = jobsList.jobs.get(1)._precondition_function;

    registry.objects.set(stalker.id, { object: null } as unknown as IRegistryObjectState);
    expect(precondition?.(stalker, smartTerrain, {}, {})).toBe(false);

    registerObject(mockClientGameObject({ idOverride: stalker.id }));
    expect(precondition?.(stalker, smartTerrain, {}, {})).toBe(true);
  });
});
