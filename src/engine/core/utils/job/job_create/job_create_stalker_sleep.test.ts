import * as path from "path";

import { describe, expect, it, jest } from "@jest/globals";
import { level } from "xray16";

import { registerZone } from "@/engine/core/database";
import { SmartTerrain, SmartTerrainControl } from "@/engine/core/objects";
import { createStalkerSleepJobs } from "@/engine/core/utils/job/job_create/job_create_stalker_sleep";
import { range } from "@/engine/core/utils/number";
import { ServerHumanObject } from "@/engine/lib/types";
import { readInGameTestLtx } from "@/fixtures/engine";
import { mockClientGameObject, MockCTime, mockServerAlifeHumanStalker } from "@/fixtures/xray";

describe("jobs_general should correctly generate stalkers sleep jobs", () => {
  it("should correctly generate sleep jobs for stalkers when no patrols exist", async () => {
    const smartTerrain: SmartTerrain = new SmartTerrain("test_smart");

    jest.spyOn(smartTerrain, "name").mockImplementation(() => "test_sleep_paths_smart");

    const [jobsList, ltx, count] = createStalkerSleepJobs(smartTerrain);

    expect(count).toBe(0);
    expect(ltx).toBe("");
    expect(jobsList).toEqualLuaTables({
      jobs: {},
      priority: 10,
    });
  });

  it("should correctly generate sleep jobs for stalkers when patrols exist", async () => {
    const surgeJobsLtx: string = await readInGameTestLtx(
      path.resolve(__dirname, "__test__", "job_create_stalker_sleep.ltx")
    );

    const smartTerrain: SmartTerrain = new SmartTerrain("test_smart");

    smartTerrain.defendRestrictor = null;

    jest.spyOn(smartTerrain, "name").mockImplementation(() => "test_smart");

    const [jobsList, ltx, count] = createStalkerSleepJobs(smartTerrain);

    expect(count).toBe(2);
    expect(ltx).toBe(surgeJobsLtx);
    expect(jobsList).toEqualLuaTables({
      jobs: $fromArray(
        range(2, 1).map((it) => ({
          preconditionFunction: expect.any(Function),
          preconditionParameters: {},
          job_id: {
            job_type: "path_job",
            section: `logic@test_smart_sleep_${it}`,
          },
          priority: 10,
        }))
      ),
      priority: 10,
    });
  });

  it("should correctly generate sleep jobs for stalkers when patrols exist with restrictors", async () => {
    const surgeJobsLtx: string = await readInGameTestLtx(
      path.resolve(__dirname, "__test__", "job_create_stalker_sleep.restrictors.ltx")
    );

    const smartTerrain: SmartTerrain = new SmartTerrain("test_smart");

    jest.spyOn(smartTerrain, "name").mockImplementation(() => "test_smart");

    smartTerrain.defendRestrictor = "def_restrictor_test";
    smartTerrain.smartTerrainActorControl = { ignoreZone: "test_ignore_zone" } as SmartTerrainControl;

    const [jobsList, ltx, count] = createStalkerSleepJobs(smartTerrain);

    expect(count).toBe(2);
    expect(ltx).toBe(surgeJobsLtx);
    expect(jobsList).toEqualLuaTables({
      jobs: $fromArray(
        range(2, 1).map((it) => ({
          preconditionFunction: expect.any(Function),
          preconditionParameters: {},
          job_id: {
            job_type: "path_job",
            section: `logic@test_smart_sleep_${it}`,
          },
          priority: 10,
        }))
      ),
      priority: 10,
    });
  });

  it("should correctly generate sleep jobs for stalkers when patrols exist, when in restrictor", async () => {
    const surgeJobsLtx: string = await readInGameTestLtx(
      path.resolve(__dirname, "__test__", "job_create_stalker_sleep.ignore.ltx")
    );

    const smartTerrain: SmartTerrain = new SmartTerrain("test_smart");

    registerZone(mockClientGameObject({ name: () => "some_restrictor", inside: () => true }));

    jest.spyOn(smartTerrain, "name").mockImplementation(() => "test_smart");

    smartTerrain.defendRestrictor = "def_restrictor_test";
    smartTerrain.smartTerrainActorControl = { ignoreZone: "some_restrictor" } as SmartTerrainControl;

    const [jobsList, ltx, count] = createStalkerSleepJobs(smartTerrain);

    expect(count).toBe(2);
    expect(ltx).toBe(surgeJobsLtx);
    expect(jobsList).toEqualLuaTables({
      jobs: $fromArray(
        range(2, 1).map((it) => ({
          preconditionFunction: expect.any(Function),
          preconditionParameters: {},
          job_id: {
            job_type: "path_job",
            section: `logic@test_smart_sleep_${it}`,
          },
          priority: 10,
        }))
      ),
      priority: 10,
    });
  });

  it("should correctly generate sleep jobs for stalkers when patrols exist with invulnerable state", async () => {
    const surgeJobsLtx: string = await readInGameTestLtx(
      path.resolve(__dirname, "__test__", "job_create_stalker_sleep.invulnerable.ltx")
    );

    const smartTerrain: SmartTerrain = new SmartTerrain("test_smart");

    jest.spyOn(smartTerrain, "name").mockImplementation(() => "test_smart");

    registerZone(mockClientGameObject({ name: () => "safe_restrictor_test", inside: () => true }));

    smartTerrain.safeRestrictor = "safe_restrictor_test";
    smartTerrain.smartTerrainActorControl = { ignoreZone: "test_ignore_zone" } as SmartTerrainControl;

    const [jobsList, ltx, count] = createStalkerSleepJobs(smartTerrain);

    expect(count).toBe(2);
    expect(ltx).toBe(surgeJobsLtx);
    expect(jobsList).toEqualLuaTables({
      jobs: $fromArray(
        range(2, 1).map((it) => ({
          preconditionFunction: expect.any(Function),
          preconditionParameters: {},
          job_id: {
            job_type: "path_job",
            section: `logic@test_smart_sleep_${it}`,
          },
          priority: 10,
        }))
      ),
      priority: 10,
    });
  });

  it("should correctly use sleep preconditions", () => {
    const smartTerrain: SmartTerrain = new SmartTerrain("test_smart");
    const stalker: ServerHumanObject = mockServerAlifeHumanStalker();

    jest.spyOn(smartTerrain, "name").mockImplementation(() => "test_smart");

    const [jobsList] = createStalkerSleepJobs(smartTerrain);
    const precondition = jobsList.jobs.get(1).preconditionFunction;

    expect(precondition?.(stalker, smartTerrain, { is_safe_job: null }, {})).toBe(false);

    jest.spyOn(level, "get_time_hours").mockImplementation(() => 23);
    expect(precondition?.(stalker, smartTerrain, { is_safe_job: null }, {})).toBe(true);

    jest.spyOn(stalker, "community").mockImplementation(() => "zombied");
    expect(precondition?.(stalker, smartTerrain, { is_safe_job: true }, {})).toBe(false);

    jest.spyOn(stalker, "community").mockImplementation(() => "stalker");
    smartTerrain.alarmStartedAt = MockCTime.mock(2014, 2, 3, 4, 20, 30, 400);
    expect(precondition?.(stalker, smartTerrain, { is_safe_job: null }, {})).toBe(true);

    smartTerrain.safeRestrictor = "sleep_test_restrictor";
    registerZone(mockClientGameObject({ name: () => "sleep_test_restrictor", inside: () => true }));
    expect(precondition?.(stalker, smartTerrain, { is_safe_job: null }, {})).toBe(true);

    registerZone(mockClientGameObject({ name: () => "sleep_test_restrictor", inside: () => false }));
    expect(precondition?.(stalker, smartTerrain, { is_safe_job: null }, {})).toBe(false);

    smartTerrain.safeRestrictor = "another_sleep_test_restrictor";
    expect(precondition?.(stalker, smartTerrain, { is_safe_job: true }, {})).toBe(true);
    expect(precondition?.(stalker, smartTerrain, { is_safe_job: false }, {})).toBe(false);
  });
});
