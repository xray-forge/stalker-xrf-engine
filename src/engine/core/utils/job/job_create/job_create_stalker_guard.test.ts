import * as path from "path";

import { describe, expect, it, jest } from "@jest/globals";

import { registerZone } from "@/engine/core/database";
import { SmartTerrain, SmartTerrainControl } from "@/engine/core/objects";
import { createStalkerGuardJobs } from "@/engine/core/utils/job/job_create/job_create_stalker_guard";
import { ServerHumanObject } from "@/engine/lib/types";
import { readInGameTestLtx } from "@/fixtures/engine";
import { mockClientGameObject, MockCTime, mockServerAlifeHumanStalker } from "@/fixtures/xray";

describe("jobs_general should correctly generate stalker guard jobs", () => {
  it("should correctly generate default guard jobs with no collector patrols", async () => {
    const smartTerrain: SmartTerrain = new SmartTerrain("test_smart");

    jest.spyOn(smartTerrain, "name").mockImplementation(() => "test_smart_without_guard");

    const [jobsList, ltx] = createStalkerGuardJobs(smartTerrain);

    expect(ltx).toBe("");
    expect(jobsList).toEqualLuaTables({ priority: 25, jobs: $fromArray([]) });
  });

  it("should correctly generate default guard jobs with test smart", async () => {
    const jobsLtx: string = await readInGameTestLtx(
      path.resolve(__dirname, "__test__", "job_create_stalker_guard.default.ltx")
    );

    const smartTerrain: SmartTerrain = new SmartTerrain("test_smart");

    jest.spyOn(smartTerrain, "name").mockImplementation(() => "test_smart");

    const [jobsList, ltx, count] = createStalkerGuardJobs(smartTerrain);

    expect(count).toBe(1);
    expect(ltx).toBe(jobsLtx);
    expect(jobsList).toEqualLuaTables({
      priority: 25,
      jobs: $fromArray([
        {
          preconditionFunction: expect.any(Function),
          preconditionParameters: {},
          job_id: {
            job_type: "path_job",
            section: "logic@test_smart_guard_1_walk",
          },
          priority: 25,
        },
        {
          preconditionFunction: expect.any(Function),
          preconditionParameters: {
            changing_job: "logic@test_smart_guard_1_walk",
          },
          job_id: {
            job_type: "path_job",
            section: "logic@follower_test_smart_guard_1_walk",
          },
          priority: 24,
        },
      ]),
    });
  });

  it("should correctly generate default guard jobs with restrictor", async () => {
    const jobsLtx: string = await readInGameTestLtx(
      path.resolve(__dirname, "__test__", "job_create_stalker_guard.restrictor.ltx")
    );

    const smartTerrain: SmartTerrain = new SmartTerrain("test_smart");

    smartTerrain.defendRestrictor = "test_defend_restrictor";

    jest.spyOn(smartTerrain, "name").mockImplementation(() => "test_smart");

    const [jobsList, ltx, count] = createStalkerGuardJobs(smartTerrain);

    expect(count).toBe(1);
    expect(ltx).toBe(jobsLtx);
    expect(jobsList).toEqualLuaTables({
      priority: 25,
      jobs: $fromArray([
        {
          preconditionFunction: expect.any(Function),
          preconditionParameters: {},
          job_id: {
            job_type: "path_job",
            section: "logic@test_smart_guard_1_walk",
          },
          priority: 25,
        },
        {
          preconditionFunction: expect.any(Function),
          preconditionParameters: {
            changing_job: "logic@test_smart_guard_1_walk",
          },
          job_id: {
            job_type: "path_job",
            section: "logic@follower_test_smart_guard_1_walk",
          },
          priority: 24,
        },
      ]),
    });
  });

  it("should correctly generate default guard jobs with ignore restrictor", async () => {
    const jobsLtx: string = await readInGameTestLtx(
      path.resolve(__dirname, "__test__", "job_create_stalker_guard.ignore.ltx")
    );

    const smartTerrain: SmartTerrain = new SmartTerrain("test_smart");

    smartTerrain.defendRestrictor = "test_defend_restrictor";
    smartTerrain.smartTerrainActorControl = { ignoreZone: "some_restrictor" } as SmartTerrainControl;

    registerZone(mockClientGameObject({ name: () => "some_restrictor", inside: () => true }));

    jest.spyOn(smartTerrain, "name").mockImplementation(() => "test_smart");

    const [jobsList, ltx, count] = createStalkerGuardJobs(smartTerrain);

    expect(count).toBe(1);
    expect(ltx).toBe(jobsLtx);
    expect(jobsList).toEqualLuaTables({
      priority: 25,
      jobs: $fromArray([
        {
          preconditionFunction: expect.any(Function),
          preconditionParameters: {},
          job_id: {
            job_type: "path_job",
            section: "logic@test_smart_guard_1_walk",
          },
          priority: 25,
        },
        {
          preconditionFunction: expect.any(Function),
          preconditionParameters: {
            changing_job: "logic@test_smart_guard_1_walk",
          },
          job_id: {
            job_type: "path_job",
            section: "logic@follower_test_smart_guard_1_walk",
          },
          priority: 24,
        },
      ]),
    });
  });

  it("should correctly generate default guard jobs with invulnerable state", async () => {
    const jobsLtx: string = await readInGameTestLtx(
      path.resolve(__dirname, "__test__", "job_create_stalker_guard.invulnerable.ltx")
    );

    const smartTerrain: SmartTerrain = new SmartTerrain("test_smart");

    smartTerrain.defendRestrictor = "test_defend_restrictor";
    smartTerrain.smartTerrainActorControl = { ignoreZone: "some_restrictor" } as SmartTerrainControl;
    smartTerrain.safeRestrictor = "safe_restrictor_test";

    registerZone(mockClientGameObject({ name: () => "safe_restrictor_test", inside: () => true }));

    jest.spyOn(smartTerrain, "name").mockImplementation(() => "test_smart");

    const [jobsList, ltx, count] = createStalkerGuardJobs(smartTerrain);

    expect(count).toBe(1);
    expect(ltx).toBe(jobsLtx);
    expect(jobsList).toEqualLuaTables({
      priority: 25,
      jobs: $fromArray([
        {
          preconditionFunction: expect.any(Function),
          preconditionParameters: {},
          job_id: {
            job_type: "path_job",
            section: "logic@test_smart_guard_1_walk",
          },
          priority: 25,
        },
        {
          preconditionFunction: expect.any(Function),
          preconditionParameters: {
            changing_job: "logic@test_smart_guard_1_walk",
          },
          job_id: {
            job_type: "path_job",
            section: "logic@follower_test_smart_guard_1_walk",
          },
          priority: 24,
        },
      ]),
    });
  });

  it("should correctly check guard jobs preconditions", async () => {
    const smartTerrain: SmartTerrain = new SmartTerrain("test_smart");
    const stalker: ServerHumanObject = mockServerAlifeHumanStalker();

    jest.spyOn(smartTerrain, "name").mockImplementation(() => "test_smart");

    const [jobsList] = createStalkerGuardJobs(smartTerrain);
    const precondition = jobsList.jobs.get(1).preconditionFunction;

    expect(precondition?.(stalker, smartTerrain, {}, {})).toBe(true);

    smartTerrain.alarmStartedAt = MockCTime.mock(1, 2, 3, 4, 5, 6, 7);
    expect(precondition?.(stalker, smartTerrain, {}, {})).toBe(true);

    smartTerrain.safeRestrictor = "safe_restrictor_test";
    expect(precondition?.(stalker, smartTerrain, {}, {})).toBe(true);

    expect(precondition?.(stalker, smartTerrain, {}, {})).toBe(true);
    expect(precondition?.(stalker, smartTerrain, { is_safe_job: false }, {})).toBe(false);

    registerZone(mockClientGameObject({ name: () => "safe_restrictor_test", inside: () => true }));
    expect(precondition?.(stalker, smartTerrain, { is_safe_job: null }, {})).toBe(true);

    registerZone(mockClientGameObject({ name: () => "safe_restrictor_test", inside: () => false }));
    expect(precondition?.(stalker, smartTerrain, { is_safe_job: null }, {})).toBe(false);
  });

  it("should correctly check guard follower jobs preconditions", async () => {
    const smartTerrain: SmartTerrain = new SmartTerrain("test_smart");
    const stalker: ServerHumanObject = mockServerAlifeHumanStalker();

    jest.spyOn(smartTerrain, "name").mockImplementation(() => "test_smart");

    const [jobsList] = createStalkerGuardJobs(smartTerrain);
    const precondition = jobsList.jobs.get(2).preconditionFunction;

    expect(precondition?.(stalker, smartTerrain, {}, {})).toBe(true);
    expect(precondition?.(stalker, smartTerrain, { changing_job: "1" }, {})).toBe(false);
    expect(precondition?.(stalker, smartTerrain, { changing_job: "1" }, { need_job: "2" })).toBe(false);
    expect(precondition?.(stalker, smartTerrain, { changing_job: "3" }, { need_job: "3" })).toBe(true);
  });
});
