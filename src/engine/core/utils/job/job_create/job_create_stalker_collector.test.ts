import * as path from "path";

import { describe, expect, it, jest } from "@jest/globals";

import { registerObject, registerZone } from "@/engine/core/database";
import { SmartTerrain, SmartTerrainControl } from "@/engine/core/objects";
import { createStalkerCollectorJobs } from "@/engine/core/utils/job/job_create/job_create_stalker_collector";
import { ServerHumanObject } from "@/engine/lib/types";
import { readInGameTestLtx } from "@/fixtures/engine";
import { mockClientGameObject, mockServerAlifeHumanStalker } from "@/fixtures/xray";

describe("jobs_general should correctly generate stalker collector jobs", () => {
  it("should correctly generate default collector jobs with no collector patrols", async () => {
    const smartTerrain: SmartTerrain = new SmartTerrain("test_smart");

    smartTerrain.ini = smartTerrain.spawn_ini();

    jest.spyOn(smartTerrain, "name").mockImplementation(() => "test_smart_without_collector");

    const [jobsList, ltx] = createStalkerCollectorJobs(smartTerrain);

    expect(ltx).toBe("");
    expect(jobsList).toEqualLuaTables({ priority: 25, jobs: $fromArray([]) });
  });

  it("should correctly generate default collector jobs with test smart", async () => {
    const jobsLtx: string = await readInGameTestLtx(
      path.resolve(__dirname, "__test__", "job_create_stalker_collector.default.ltx")
    );

    const smartTerrain: SmartTerrain = new SmartTerrain("test_smart");

    smartTerrain.ini = smartTerrain.spawn_ini();

    jest.spyOn(smartTerrain, "name").mockImplementation(() => "test_smart");

    const [jobsList, ltx, count] = createStalkerCollectorJobs(smartTerrain);

    expect(count).toBe(2);
    expect(ltx).toBe(jobsLtx);
    expect(jobsList).toEqualLuaTables({
      priority: 25,
      jobs: $fromArray([
        {
          _precondition_function: expect.any(Function),
          _precondition_params: {},
          job_id: {
            job_type: "path_job",
            section: "logic@test_smart_collector_1_walk",
          },
          priority: 25,
        },
      ]),
    });
  });

  it("should correctly generate default collector jobs with restrictor", async () => {
    const jobsLtx: string = await readInGameTestLtx(
      path.resolve(__dirname, "__test__", "job_create_stalker_collector.restrictor.ltx")
    );

    const smartTerrain: SmartTerrain = new SmartTerrain("test_smart");

    smartTerrain.ini = smartTerrain.spawn_ini();
    smartTerrain.defendRestrictor = "test_defend_restrictor";

    jest.spyOn(smartTerrain, "name").mockImplementation(() => "test_smart");

    const [jobsList, ltx, count] = createStalkerCollectorJobs(smartTerrain);

    expect(count).toBe(2);
    expect(ltx).toBe(jobsLtx);
    expect(jobsList).toEqualLuaTables({
      priority: 25,
      jobs: $fromArray([
        {
          _precondition_function: expect.any(Function),
          _precondition_params: {},
          job_id: {
            job_type: "path_job",
            section: "logic@test_smart_collector_1_walk",
          },
          priority: 25,
        },
      ]),
    });
  });

  it("should correctly generate default collector jobs with ignore restrictor", async () => {
    const jobsLtx: string = await readInGameTestLtx(
      path.resolve(__dirname, "__test__", "job_create_stalker_collector.ignore.ltx")
    );

    const smartTerrain: SmartTerrain = new SmartTerrain("test_smart");

    smartTerrain.ini = smartTerrain.spawn_ini();
    smartTerrain.defendRestrictor = "test_defend_restrictor";
    smartTerrain.smartTerrainActorControl = { ignoreZone: "some_restrictor" } as SmartTerrainControl;

    registerZone(mockClientGameObject({ name: () => "some_restrictor", inside: () => true }));

    jest.spyOn(smartTerrain, "name").mockImplementation(() => "test_smart");

    const [jobsList, ltx, count] = createStalkerCollectorJobs(smartTerrain);

    expect(count).toBe(2);
    expect(ltx).toBe(jobsLtx);
    expect(jobsList).toEqualLuaTables({
      priority: 25,
      jobs: $fromArray([
        {
          _precondition_function: expect.any(Function),
          _precondition_params: {},
          job_id: {
            job_type: "path_job",
            section: "logic@test_smart_collector_1_walk",
          },
          priority: 25,
        },
      ]),
    });
  });

  it("should correctly generate default collector jobs with invulnerable state", async () => {
    const jobsLtx: string = await readInGameTestLtx(
      path.resolve(__dirname, "__test__", "job_create_stalker_collector.invulnerable.ltx")
    );

    const smartTerrain: SmartTerrain = new SmartTerrain("test_smart");

    smartTerrain.ini = smartTerrain.spawn_ini();
    smartTerrain.defendRestrictor = "test_defend_restrictor";
    smartTerrain.smartTerrainActorControl = { ignoreZone: "some_restrictor" } as SmartTerrainControl;
    smartTerrain.safeRestrictor = "safe_restrictor_test";

    registerZone(mockClientGameObject({ name: () => "safe_restrictor_test", inside: () => true }));

    jest.spyOn(smartTerrain, "name").mockImplementation(() => "test_smart");

    const [jobsList, ltx, count] = createStalkerCollectorJobs(smartTerrain);

    expect(count).toBe(2);
    expect(ltx).toBe(jobsLtx);
    expect(jobsList).toEqualLuaTables({
      priority: 25,
      jobs: $fromArray([
        {
          _precondition_function: expect.any(Function),
          _precondition_params: {},
          job_id: {
            job_type: "path_job",
            section: "logic@test_smart_collector_1_walk",
          },
          priority: 25,
        },
      ]),
    });
  });

  it("should correctly check collector jobs preconditions", async () => {
    const smartTerrain: SmartTerrain = new SmartTerrain("test_smart");
    const stalker: ServerHumanObject = mockServerAlifeHumanStalker();

    smartTerrain.ini = smartTerrain.spawn_ini();

    jest.spyOn(smartTerrain, "name").mockImplementation(() => "test_smart");

    const [jobsList] = createStalkerCollectorJobs(smartTerrain);
    const precondition = jobsList.jobs.get(1)._precondition_function;

    expect(precondition?.(stalker, smartTerrain, {}, {})).toBe(false);

    registerObject(
      mockClientGameObject({
        idOverride: stalker.id,
        object: (section: string) => {
          return section === "detector_elite" ? mockClientGameObject() : null;
        },
      })
    );
    expect(precondition?.(stalker, smartTerrain, {}, {})).toBe(true);

    jest.spyOn(stalker, "community").mockImplementation(() => "zombied");
    expect(precondition?.(stalker, smartTerrain, {}, {})).toBe(false);
  });
});
