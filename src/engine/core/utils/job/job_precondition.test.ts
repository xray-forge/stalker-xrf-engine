import { describe, expect, it, jest } from "@jest/globals";
import { level } from "xray16";

import { registerObject, registerSmartCover, registerZone } from "@/engine/core/database";
import { surgeConfig } from "@/engine/core/managers/surge/SurgeConfig";
import { SmartCover } from "@/engine/core/objects/server/smart_cover";
import { SmartTerrain } from "@/engine/core/objects/server/smart_terrain";
import { parseConditionsList } from "@/engine/core/utils/ini";
import { createStalkerAnimpointJobs } from "@/engine/core/utils/job/job_create/job_create_stalker_animpoint";
import { createStalkerCamperJobs } from "@/engine/core/utils/job/job_create/job_create_stalker_camper";
import { createStalkerCollectorJobs } from "@/engine/core/utils/job/job_create/job_create_stalker_collector";
import { createStalkerGuardJobs } from "@/engine/core/utils/job/job_create/job_create_stalker_guard";
import { createStalkerPatrolJobs } from "@/engine/core/utils/job/job_create/job_create_stalker_patrol";
import { createStalkerSleepJobs } from "@/engine/core/utils/job/job_create/job_create_stalker_sleep";
import { createStalkerSniperJobs } from "@/engine/core/utils/job/job_create/job_create_stalker_sniper";
import { createStalkerWalkerJobs } from "@/engine/core/utils/job/job_create/job_create_stalker_walker";
import {
  jobPreconditionAnimpoint,
  jobPreconditionCamper,
  jobPreconditionCollector,
  jobPreconditionExclusive,
  jobPreconditionGuard,
  jobPreconditionGuardFollower,
  jobPreconditionPatrol,
  jobPreconditionSleep,
  jobPreconditionSniper,
  jobPreconditionSurge,
  jobPreconditionWalker,
} from "@/engine/core/utils/job/job_precondition";
import { IObjectJobDescriptor } from "@/engine/core/utils/job/job_types";
import { StringBuilder } from "@/engine/core/utils/string";
import { AnyObject, ServerHumanObject } from "@/engine/lib/types";
import { mockSmartCover, mockSmartTerrain } from "@/fixtures/engine";
import { mockClientGameObject, MockCTime, mockServerAlifeHumanStalker } from "@/fixtures/xray";

describe("job_precondition utilities", () => {
  it("jobPreconditionWalker should correctly check", () => {
    const smartTerrain: SmartTerrain = mockSmartTerrain();
    const stalker: ServerHumanObject = mockServerAlifeHumanStalker();

    const [jobs] = createStalkerWalkerJobs(smartTerrain, new LuaTable(), new StringBuilder());
    const parameters: AnyObject = jobs.get(1).preconditionParameters as AnyObject;

    expect(jobPreconditionWalker(stalker, smartTerrain, parameters)).toBe(true);

    jest.spyOn(stalker, "community").mockImplementation(() => "zombied");
    expect(jobPreconditionWalker(stalker, smartTerrain, parameters)).toBe(true);

    jest.spyOn(stalker, "community").mockImplementation(() => "stalker");
    smartTerrain.alarmStartedAt = MockCTime.mock(1, 2, 3, 4, 5, 6, 7);
    expect(jobPreconditionWalker(stalker, smartTerrain, parameters)).toBe(true);

    smartTerrain.safeRestrictor = "safe_restrictor_test";
    expect(jobPreconditionWalker(stalker, smartTerrain, parameters)).toBe(true);

    expect(jobPreconditionWalker(stalker, smartTerrain, parameters)).toBe(true);
    expect(jobPreconditionWalker(stalker, smartTerrain, { ...parameters, isSafeJob: false })).toBe(false);

    registerZone(mockClientGameObject({ name: () => "safe_restrictor_test", inside: () => false }));
    expect(jobPreconditionWalker(stalker, smartTerrain, { ...parameters, isSafeJob: null })).toBe(false);

    registerZone(mockClientGameObject({ name: () => "safe_restrictor_test", inside: () => true }));
    expect(jobPreconditionWalker(stalker, smartTerrain, { ...parameters, isSafeJob: null })).toBe(true);
  });

  it("jobPreconditionSurge should correctly check with", () => {
    const smartTerrain: SmartTerrain = mockSmartTerrain();
    const stalker: ServerHumanObject = mockServerAlifeHumanStalker();

    const [jobs] = createStalkerWalkerJobs(smartTerrain, new LuaTable(), new StringBuilder());
    const parameters: AnyObject = jobs.get(1).preconditionParameters as AnyObject;

    surgeConfig.IS_STARTED = true;
    expect(jobPreconditionSurge(stalker, smartTerrain, parameters)).toBe(true);

    surgeConfig.IS_STARTED = false;
    expect(jobPreconditionSurge(stalker, smartTerrain, parameters)).toBe(false);
  });

  it("jobPreconditionSniper should correctly check sniper jobs preconditions with", async () => {
    const smartTerrain: SmartTerrain = mockSmartTerrain();
    const stalker: ServerHumanObject = mockServerAlifeHumanStalker();

    const [jobs] = createStalkerSniperJobs(smartTerrain, new LuaTable(), new StringBuilder());
    const parameters: AnyObject = jobs.get(1).preconditionParameters as AnyObject;

    expect(jobPreconditionSniper(stalker, smartTerrain, parameters)).toBe(true);

    jest.spyOn(stalker, "community").mockImplementation(() => "zombied");
    expect(jobPreconditionSniper(stalker, smartTerrain, parameters)).toBe(false);

    jest.spyOn(stalker, "community").mockImplementation(() => "stalker");
    expect(jobPreconditionSniper(stalker, smartTerrain, parameters)).toBe(true);
  });

  it("jobPreconditionAnimpoint should correctly check animpoint preconditions", () => {
    const smartTerrain: SmartTerrain = mockSmartTerrain();
    const smartCover: SmartCover = mockSmartCover("test_smart_animpoint_1");
    const stalker: ServerHumanObject = mockServerAlifeHumanStalker();

    registerSmartCover(smartCover);

    const [jobs] = createStalkerAnimpointJobs(smartTerrain, new LuaTable(), new StringBuilder());
    const parameters: AnyObject = jobs.get(1).preconditionParameters as AnyObject;

    expect(jobPreconditionAnimpoint(stalker, smartTerrain, { ...parameters, isSafeJob: null })).toBe(true);

    jest.spyOn(stalker, "community").mockImplementation(() => "zombied");
    expect(jobPreconditionAnimpoint(stalker, smartTerrain, parameters)).toBe(false);

    jest.spyOn(stalker, "community").mockImplementation(() => "stalker");
    expect(jobPreconditionAnimpoint(stalker, smartTerrain, parameters)).toBe(true);
  });

  it("jobPreconditionCamper should correctly check camper jobs preconditions", async () => {
    const smartTerrain: SmartTerrain = mockSmartTerrain();
    const stalker: ServerHumanObject = mockServerAlifeHumanStalker();

    const [jobs] = createStalkerCamperJobs(smartTerrain, new LuaTable(), new StringBuilder());
    const parameters: AnyObject = jobs.get(1).preconditionParameters as AnyObject;

    expect(jobPreconditionCamper(stalker, smartTerrain, parameters)).toBe(true);
  });

  it("jobPreconditionCollector should correctly check collector jobs preconditions", async () => {
    const smartTerrain: SmartTerrain = mockSmartTerrain();
    const stalker: ServerHumanObject = mockServerAlifeHumanStalker();

    const [jobs] = createStalkerCollectorJobs(smartTerrain, new LuaTable(), new StringBuilder());
    const parameters: AnyObject = jobs.get(1).preconditionParameters as AnyObject;

    expect(jobPreconditionCollector(stalker, smartTerrain, parameters)).toBe(false);

    registerObject(
      mockClientGameObject({
        idOverride: stalker.id,
        object: (section: string) => {
          return section === "detector_elite" ? mockClientGameObject() : null;
        },
      })
    );
    expect(jobPreconditionCollector(stalker, smartTerrain, parameters)).toBe(true);

    jest.spyOn(stalker, "community").mockImplementation(() => "zombied");
    expect(jobPreconditionCollector(stalker, smartTerrain, parameters)).toBe(false);
  });

  it("parameters should correctly check guard jobs preconditions", async () => {
    const smartTerrain: SmartTerrain = mockSmartTerrain();
    const stalker: ServerHumanObject = mockServerAlifeHumanStalker();

    const [jobs] = createStalkerGuardJobs(smartTerrain, new LuaTable(), new StringBuilder());
    const parameters: AnyObject = jobs.get(1).preconditionParameters as AnyObject;

    expect(jobPreconditionGuard(stalker, smartTerrain, parameters)).toBe(true);

    smartTerrain.alarmStartedAt = MockCTime.mock(1, 2, 3, 4, 5, 6, 7);
    expect(jobPreconditionGuard(stalker, smartTerrain, parameters)).toBe(true);

    smartTerrain.safeRestrictor = "safe_restrictor_test";
    expect(jobPreconditionGuard(stalker, smartTerrain, parameters)).toBe(true);

    expect(jobPreconditionGuard(stalker, smartTerrain, parameters)).toBe(true);
    expect(jobPreconditionGuard(stalker, smartTerrain, { ...parameters, isSafeJob: false })).toBe(false);

    registerZone(mockClientGameObject({ name: () => "safe_restrictor_test", inside: () => true }));
    expect(jobPreconditionGuard(stalker, smartTerrain, { ...parameters, isSafeJob: null })).toBe(true);

    registerZone(mockClientGameObject({ name: () => "safe_restrictor_test", inside: () => false }));
    expect(jobPreconditionGuard(stalker, smartTerrain, { ...parameters, isSafeJob: null })).toBe(false);
  });

  it("jobPreconditionGuardFollower should correctly check guard follower jobs preconditions", async () => {
    const smartTerrain: SmartTerrain = mockSmartTerrain();
    const stalker: ServerHumanObject = mockServerAlifeHumanStalker();

    const [jobs] = createStalkerGuardJobs(smartTerrain, new LuaTable(), new StringBuilder());
    const parameters: AnyObject = jobs.get(2).preconditionParameters as AnyObject;

    expect(jobPreconditionGuardFollower(stalker, smartTerrain, parameters, {} as IObjectJobDescriptor)).toBe(false);
    expect(
      jobPreconditionGuardFollower(stalker, smartTerrain, parameters, {
        desiredJob: "logic@test_smart_guard_1_walk",
      } as IObjectJobDescriptor)
    ).toBe(true);
    expect(
      jobPreconditionGuardFollower(
        stalker,
        smartTerrain,
        { ...parameters, nextDesiredJob: "1" },
        {} as IObjectJobDescriptor
      )
    ).toBe(false);
    expect(
      jobPreconditionGuardFollower(stalker, smartTerrain, { ...parameters, nextDesiredJob: "1" }, {
        desiredJob: "2",
      } as IObjectJobDescriptor)
    ).toBe(false);
    expect(
      jobPreconditionGuardFollower(stalker, smartTerrain, { ...parameters, nextDesiredJob: "3" }, {
        desiredJob: "3",
      } as IObjectJobDescriptor)
    ).toBe(true);
  });

  it("jobPreconditionPatrol should correctly check patrol jobs preconditions", async () => {
    const smartTerrain: SmartTerrain = mockSmartTerrain();
    const stalker: ServerHumanObject = mockServerAlifeHumanStalker();

    const [jobs] = createStalkerPatrolJobs(smartTerrain, new LuaTable(), new StringBuilder());
    const parameters: AnyObject = jobs.get(1).preconditionParameters as AnyObject;

    expect(jobPreconditionPatrol(stalker, smartTerrain, {})).toBe(true);

    smartTerrain.alarmStartedAt = MockCTime.mock(1, 2, 3, 4, 5, 6, 7);
    expect(jobPreconditionPatrol(stalker, smartTerrain, parameters)).toBe(true);

    smartTerrain.safeRestrictor = "safe_restrictor_test";
    expect(jobPreconditionPatrol(stalker, smartTerrain, parameters)).toBe(true);

    expect(jobPreconditionPatrol(stalker, smartTerrain, parameters)).toBe(true);
    expect(jobPreconditionPatrol(stalker, smartTerrain, { ...parameters, isSafeJob: false })).toBe(false);

    registerZone(mockClientGameObject({ name: () => "safe_restrictor_test", inside: () => false }));
    expect(jobPreconditionPatrol(stalker, smartTerrain, { ...parameters, isSafeJob: null })).toBe(false);

    registerZone(mockClientGameObject({ name: () => "safe_restrictor_test", inside: () => true }));
    expect(jobPreconditionPatrol(stalker, smartTerrain, { ...parameters, isSafeJob: null })).toBe(true);
  });

  it("jobPreconditionSleep should correctly use sleep preconditions", () => {
    const smartTerrain: SmartTerrain = mockSmartTerrain();
    const stalker: ServerHumanObject = mockServerAlifeHumanStalker();

    const [jobs] = createStalkerSleepJobs(smartTerrain, new LuaTable(), new StringBuilder());
    const parameters: AnyObject = jobs.get(1).preconditionParameters as AnyObject;

    expect(jobPreconditionSleep(stalker, smartTerrain, { ...parameters, isSafeJob: null })).toBe(false);

    jest.spyOn(level, "get_time_hours").mockImplementation(() => 23);
    expect(jobPreconditionSleep(stalker, smartTerrain, { ...parameters, isSafeJob: null })).toBe(true);

    jest.spyOn(stalker, "community").mockImplementation(() => "zombied");
    expect(jobPreconditionSleep(stalker, smartTerrain, { ...parameters, isSafeJob: true })).toBe(false);

    jest.spyOn(stalker, "community").mockImplementation(() => "stalker");
    smartTerrain.alarmStartedAt = MockCTime.mock(2014, 2, 3, 4, 20, 30, 400);
    expect(jobPreconditionSleep(stalker, smartTerrain, { ...parameters, isSafeJob: null })).toBe(true);

    smartTerrain.safeRestrictor = "sleep_test_restrictor";
    registerZone(mockClientGameObject({ name: () => "sleep_test_restrictor", inside: () => true }));
    expect(jobPreconditionSleep(stalker, smartTerrain, { ...parameters, isSafeJob: null })).toBe(true);

    registerZone(mockClientGameObject({ name: () => "sleep_test_restrictor", inside: () => false }));
    expect(jobPreconditionSleep(stalker, smartTerrain, { ...parameters, isSafeJob: null })).toBe(false);

    smartTerrain.safeRestrictor = "another_sleep_test_restrictor";
    expect(jobPreconditionSleep(stalker, smartTerrain, { ...parameters, isSafeJob: true })).toBe(true);
    expect(jobPreconditionSleep(stalker, smartTerrain, { ...parameters, isSafeJob: false })).toBe(false);
  });

  it("jobPreconditionExclusive should correctly use condlist preconditions", () => {
    const smartTerrain: SmartTerrain = mockSmartTerrain();
    const stalker: ServerHumanObject = mockServerAlifeHumanStalker();

    expect(jobPreconditionExclusive(stalker, smartTerrain, { condlist: parseConditionsList("true") })).toBe(true);
    expect(jobPreconditionExclusive(stalker, smartTerrain, { condlist: parseConditionsList("false") })).toBe(false);
    expect(
      jobPreconditionExclusive(stalker, smartTerrain, { condlist: parseConditionsList("{-some_info} true, false") })
    ).toBe(true);
  });
});
