import * as path from "path";

import { describe, expect, it, jest } from "@jest/globals";

import { registerZone } from "@/engine/core/database";
import { SmartTerrain, SmartTerrainControl } from "@/engine/core/objects";
import { createStalkerPatrolJobs } from "@/engine/core/utils/job/job_create/job_create_stalker_patrol";
import { ServerHumanObject } from "@/engine/lib/types";
import { readInGameTestLtx } from "@/fixtures/engine";
import { mockClientGameObject, MockCTime, mockServerAlifeHumanStalker } from "@/fixtures/xray";

describe("jobs_general should correctly generate stalker patrol jobs", () => {
  it("should correctly generate default patrol jobs with no patrols", async () => {
    const smartTerrain: SmartTerrain = new SmartTerrain("test_smart");

    jest.spyOn(smartTerrain, "name").mockImplementation(() => "test_smart_without_patrol");

    const [jobsList, ltx] = createStalkerPatrolJobs(smartTerrain);

    expect(ltx).toBe("");
    expect(jobsList).toEqualLuaTables({ priority: 20, jobs: $fromArray([]) });
  });

  it("should correctly generate default patrol jobs with test smart", async () => {
    const jobsLtx: string = await readInGameTestLtx(
      path.resolve(__dirname, "__test__", "job_create_stalker_patrol.default.ltx")
    );

    const smartTerrain: SmartTerrain = new SmartTerrain("test_smart");

    jest.spyOn(smartTerrain, "name").mockImplementation(() => "test_smart");

    const [jobsList, ltx, count] = createStalkerPatrolJobs(smartTerrain);

    expect(count).toBe(1);
    expect(ltx).toBe(jobsLtx);
    expect(jobsList).toEqualLuaTables({
      priority: 20,
      jobs: $fromArray([
        {
          preconditionFunction: expect.any(Function),
          preconditionParameters: {},
          jobId: {
            job_type: "path_job",
            section: "logic@test_smart_patrol_1_walk",
          },
          priority: 20,
        },
        {
          preconditionFunction: expect.any(Function),
          preconditionParameters: {},
          jobId: {
            job_type: "path_job",
            section: "logic@test_smart_patrol_1_walk",
          },
          priority: 20,
        },
        {
          preconditionFunction: expect.any(Function),
          preconditionParameters: {},
          jobId: {
            job_type: "path_job",
            section: "logic@test_smart_patrol_1_walk",
          },
          priority: 20,
        },
      ]),
    });
  });

  it("should correctly generate default patrol jobs with restrictor", async () => {
    const jobsLtx: string = await readInGameTestLtx(
      path.resolve(__dirname, "__test__", "job_create_stalker_patrol.restrictor.ltx")
    );

    const smartTerrain: SmartTerrain = new SmartTerrain("test_smart");

    smartTerrain.defendRestrictor = "test_defend_restrictor";

    jest.spyOn(smartTerrain, "name").mockImplementation(() => "test_smart");

    const [jobsList, ltx, count] = createStalkerPatrolJobs(smartTerrain);

    expect(count).toBe(1);
    expect(ltx).toBe(jobsLtx);
    expect(jobsList).toEqualLuaTables({
      priority: 20,
      jobs: $fromArray([
        {
          preconditionFunction: expect.any(Function),
          preconditionParameters: {},
          jobId: {
            job_type: "path_job",
            section: "logic@test_smart_patrol_1_walk",
          },
          priority: 20,
        },
        {
          preconditionFunction: expect.any(Function),
          preconditionParameters: {},
          jobId: {
            job_type: "path_job",
            section: "logic@test_smart_patrol_1_walk",
          },
          priority: 20,
        },
        {
          preconditionFunction: expect.any(Function),
          preconditionParameters: {},
          jobId: {
            job_type: "path_job",
            section: "logic@test_smart_patrol_1_walk",
          },
          priority: 20,
        },
      ]),
    });
  });

  it("should correctly generate default patrol jobs with ignore restrictor", async () => {
    const jobsLtx: string = await readInGameTestLtx(
      path.resolve(__dirname, "__test__", "job_create_stalker_patrol.ignore.ltx")
    );

    const smartTerrain: SmartTerrain = new SmartTerrain("test_smart");

    smartTerrain.defendRestrictor = "test_defend_restrictor";
    smartTerrain.smartTerrainActorControl = { ignoreZone: "some_restrictor" } as SmartTerrainControl;

    registerZone(mockClientGameObject({ name: () => "some_restrictor", inside: () => true }));

    jest.spyOn(smartTerrain, "name").mockImplementation(() => "test_smart");

    const [jobsList, ltx, count] = createStalkerPatrolJobs(smartTerrain);

    expect(count).toBe(1);
    expect(ltx).toBe(jobsLtx);
    expect(jobsList).toEqualLuaTables({
      priority: 20,
      jobs: $fromArray([
        {
          preconditionFunction: expect.any(Function),
          preconditionParameters: {},
          jobId: {
            job_type: "path_job",
            section: "logic@test_smart_patrol_1_walk",
          },
          priority: 20,
        },
        {
          preconditionFunction: expect.any(Function),
          preconditionParameters: {},
          jobId: {
            job_type: "path_job",
            section: "logic@test_smart_patrol_1_walk",
          },
          priority: 20,
        },
        {
          preconditionFunction: expect.any(Function),
          preconditionParameters: {},
          jobId: {
            job_type: "path_job",
            section: "logic@test_smart_patrol_1_walk",
          },
          priority: 20,
        },
      ]),
    });
  });

  it("should correctly generate default patrol jobs with invulnerable state", async () => {
    const jobsLtx: string = await readInGameTestLtx(
      path.resolve(__dirname, "__test__", "job_create_stalker_patrol.invulnerable.ltx")
    );

    const smartTerrain: SmartTerrain = new SmartTerrain("test_smart");

    smartTerrain.defendRestrictor = "test_defend_restrictor";
    smartTerrain.smartTerrainActorControl = { ignoreZone: "some_restrictor" } as SmartTerrainControl;
    smartTerrain.safeRestrictor = "safe_restrictor_test";

    registerZone(mockClientGameObject({ name: () => "safe_restrictor_test", inside: () => true }));

    jest.spyOn(smartTerrain, "name").mockImplementation(() => "test_smart");

    const [jobsList, ltx, count] = createStalkerPatrolJobs(smartTerrain);

    expect(count).toBe(1);
    expect(ltx).toBe(jobsLtx);
    expect(jobsList).toEqualLuaTables({
      priority: 20,
      jobs: $fromArray([
        {
          preconditionFunction: expect.any(Function),
          preconditionParameters: {},
          jobId: {
            job_type: "path_job",
            section: "logic@test_smart_patrol_1_walk",
          },
          priority: 20,
        },
        {
          preconditionFunction: expect.any(Function),
          preconditionParameters: {},
          jobId: {
            job_type: "path_job",
            section: "logic@test_smart_patrol_1_walk",
          },
          priority: 20,
        },
        {
          preconditionFunction: expect.any(Function),
          preconditionParameters: {},
          jobId: {
            job_type: "path_job",
            section: "logic@test_smart_patrol_1_walk",
          },
          priority: 20,
        },
      ]),
    });
  });

  it("should correctly check patrol jobs preconditions", async () => {
    const smartTerrain: SmartTerrain = new SmartTerrain("test_smart");
    const stalker: ServerHumanObject = mockServerAlifeHumanStalker();

    jest.spyOn(smartTerrain, "name").mockImplementation(() => "test_smart");

    const [jobsList] = createStalkerPatrolJobs(smartTerrain);
    const precondition = jobsList.jobs.get(1).preconditionFunction;

    expect(precondition?.(stalker, smartTerrain, {}, {})).toBe(true);

    smartTerrain.alarmStartedAt = MockCTime.mock(1, 2, 3, 4, 5, 6, 7);
    expect(precondition?.(stalker, smartTerrain, {}, {})).toBe(true);

    smartTerrain.safeRestrictor = "safe_restrictor_test";
    expect(precondition?.(stalker, smartTerrain, {}, {})).toBe(true);

    expect(precondition?.(stalker, smartTerrain, {}, {})).toBe(true);
    expect(precondition?.(stalker, smartTerrain, { is_safe_job: false }, {})).toBe(false);

    registerZone(mockClientGameObject({ name: () => "safe_restrictor_test", inside: () => false }));
    expect(precondition?.(stalker, smartTerrain, { is_safe_job: null }, {})).toBe(false);

    registerZone(mockClientGameObject({ name: () => "safe_restrictor_test", inside: () => true }));
    expect(precondition?.(stalker, smartTerrain, { is_safe_job: null }, {})).toBe(true);
  });
});
