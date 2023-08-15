import * as path from "path";

import { beforeEach, describe, expect, it, jest } from "@jest/globals";

import { registerSmartCover, registry } from "@/engine/core/database";
import { SmartCover, SmartTerrain, SmartTerrainControl } from "@/engine/core/objects";
import { createStalkerAnimpointJobs } from "@/engine/core/utils/job/job_create/job_create_stalker_animpoint";
import { IJobListDescriptor } from "@/engine/core/utils/job/job_types";
import { ServerHumanObject } from "@/engine/lib/types";
import { readInGameTestLtx } from "@/fixtures/engine";
import { mockServerAlifeHumanStalker } from "@/fixtures/xray";

describe("jobs_general should correctly generate stalker animpoint jobs", () => {
  beforeEach(() => {
    registry.smartCovers = new LuaTable();
  });

  it("should correctly generate default animpoint jobs with no smart covers", async () => {
    const smartTerrain: SmartTerrain = new SmartTerrain("test_smart");

    jest.spyOn(smartTerrain, "name").mockImplementation(() => "test_smart");

    const jobs: IJobListDescriptor = { priority: 50, jobs: new LuaTable() };
    const [jobsList, ltx] = createStalkerAnimpointJobs(smartTerrain, jobs);

    expect(ltx).toBe("");
    expect(jobsList).toEqualLuaTables({ priority: 50, jobs: $fromArray([]) });
  });

  it("should correctly generate default animpoint jobs with available smart covers", async () => {
    const jobsLtx: string = await readInGameTestLtx(
      path.resolve(__dirname, "__test__", "job_create_stalker_animpoint.default.ltx")
    );

    const smartTerrain: SmartTerrain = new SmartTerrain("test_smart");
    const smartCover: SmartCover = new SmartCover("test_smart_cover");

    jest.spyOn(smartTerrain, "name").mockImplementation(() => "test_smart");
    jest.spyOn(smartCover, "name").mockImplementation(() => "test_smart_animpoint_1");

    registerSmartCover(smartCover);

    const jobs: IJobListDescriptor = { priority: 50, jobs: new LuaTable() };
    const [jobsList, ltx] = createStalkerAnimpointJobs(smartTerrain, jobs);

    expect(ltx).toBe(jobsLtx);
    expect(jobsList).toEqualLuaTables({
      priority: 50,
      jobs: $fromArray([
        {
          _precondition_function: expect.any(Function),
          _precondition_params: {},
          job_id: {
            job_type: "smartcover_job",
            section: "logic@test_smart_animpoint_1",
          },
          priority: 15,
        },
      ]),
    });
  });

  it("should correctly generate default animpoint jobs with defend restrictor", async () => {
    const jobsLtx: string = await readInGameTestLtx(
      path.resolve(__dirname, "__test__", "job_create_stalker_animpoint.restrictor.ltx")
    );

    const smartTerrain: SmartTerrain = new SmartTerrain("test_smart");
    const smartCover: SmartCover = new SmartCover("test_smart_cover");

    jest.spyOn(smartTerrain, "name").mockImplementation(() => "test_smart");
    jest.spyOn(smartCover, "name").mockImplementation(() => "test_smart_animpoint_1");

    smartTerrain.defendRestrictor = "test_defend_restrictor";

    registerSmartCover(smartCover);

    const jobs: IJobListDescriptor = { priority: 50, jobs: new LuaTable() };
    const [jobsList, ltx] = createStalkerAnimpointJobs(smartTerrain, jobs);

    expect(ltx).toBe(jobsLtx);
    expect(jobsList).toEqualLuaTables({
      priority: 50,
      jobs: $fromArray([
        {
          _precondition_function: expect.any(Function),
          _precondition_params: {},
          job_id: {
            job_type: "smartcover_job",
            section: "logic@test_smart_animpoint_1",
          },
          priority: 15,
        },
      ]),
    });
  });

  it("should correctly generate default animpoint jobs with ignore restrictor", async () => {
    const jobsLtx: string = await readInGameTestLtx(
      path.resolve(__dirname, "__test__", "job_create_stalker_animpoint.ignore.ltx")
    );

    const smartTerrain: SmartTerrain = new SmartTerrain("test_smart");
    const smartCover: SmartCover = new SmartCover("test_smart_cover");

    jest.spyOn(smartTerrain, "name").mockImplementation(() => "test_smart");
    jest.spyOn(smartCover, "name").mockImplementation(() => "test_smart_animpoint_1");

    smartTerrain.defendRestrictor = "test_defend_restrictor";
    smartTerrain.smartTerrainActorControl = { ignoreZone: "test_ignore_zone" } as SmartTerrainControl;

    registerSmartCover(smartCover);

    const jobs: IJobListDescriptor = { priority: 50, jobs: new LuaTable() };
    const [jobsList, ltx] = createStalkerAnimpointJobs(smartTerrain, jobs);

    expect(ltx).toBe(jobsLtx);
    expect(jobsList).toEqualLuaTables({
      priority: 50,
      jobs: $fromArray([
        {
          _precondition_function: expect.any(Function),
          _precondition_params: {},
          job_id: {
            job_type: "smartcover_job",
            section: "logic@test_smart_animpoint_1",
          },
          priority: 15,
        },
      ]),
    });
  });

  it("should correctly check preconditions", () => {
    const smartTerrain: SmartTerrain = new SmartTerrain("test_smart");
    const smartCover: SmartCover = new SmartCover("test_smart_cover");
    const stalker: ServerHumanObject = mockServerAlifeHumanStalker();

    jest.spyOn(smartTerrain, "name").mockImplementation(() => "test_smart");
    jest.spyOn(smartCover, "name").mockImplementation(() => "test_smart_animpoint_1");

    registerSmartCover(smartCover);

    const [jobsList] = createStalkerAnimpointJobs(smartTerrain, { priority: 50, jobs: new LuaTable() });
    const precondition = jobsList.jobs.get(1)._precondition_function;

    expect(precondition?.(stalker, smartTerrain, { is_safe_job: null }, {})).toBe(true);

    jest.spyOn(stalker, "community").mockImplementation(() => "zombied");
    expect(precondition?.(stalker, smartTerrain, {}, {})).toBe(false);

    jest.spyOn(stalker, "community").mockImplementation(() => "stalker");
    expect(precondition?.(stalker, smartTerrain, {}, {})).toBe(true);
  });
});
