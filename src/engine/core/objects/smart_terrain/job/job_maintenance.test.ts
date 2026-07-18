import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import { IniFile, ServerHumanObject } from "xray16/alias";
import { AnyObject, TNumberId } from "xray16/lib";
import { MockAlifeHumanStalker, MockGameObject } from "xray16/mocks";

import { registerObject, registerSimulator } from "@/engine/core/database";
import { surgeConfig } from "@/engine/core/managers/surge/SurgeConfig";
import {
  markTerrainJobsDirty,
  switchTerrainObjectToDesiredJob,
  updateTerrainJobs,
} from "@/engine/core/objects/smart_terrain/job/job_execution";
import {
  EJobPathType,
  EJobType,
  IObjectJobState,
  ISmartTerrainJobDescriptor,
} from "@/engine/core/objects/smart_terrain/job/job_types";
import { SmartTerrain } from "@/engine/core/objects/smart_terrain/SmartTerrain";
import { smartTerrainConfig } from "@/engine/core/objects/smart_terrain/SmartTerrainConfig";
import { mockRegisteredActor, resetRegistry } from "@/fixtures/engine";

// Scheme setup requires real logic ini sections - out of scope for maintenance mechanism tests.
jest.mock("@/engine/core/schemes/runtime/scheme_job");
jest.mock("@/engine/core/schemes/runtime/scheme_switch");

/**
 * Mechanism suite for incremental job maintenance (plan 02 stage B):
 * bounded cursor stepping, strictly-higher acceptance, jobless leniency and dirty lifecycle.
 */

function mockTerrain(): SmartTerrain {
  const terrain: SmartTerrain = new SmartTerrain("test_smart");

  terrain.ini = terrain.spawn_ini() as IniFile;
  jest.spyOn(terrain, "name").mockImplementation(() => "test_smart");
  (terrain as AnyObject).m_game_vertex_id = 512;

  terrain.on_register();

  return terrain;
}

function mockArrivedStalker(terrain: SmartTerrain): ServerHumanObject {
  const stalker: ServerHumanObject = MockAlifeHumanStalker.mock();

  (stalker as AnyObject).m_game_vertex_id = 512;

  terrain.register_npc(stalker);

  return stalker;
}

function injectTopPriorityJob(terrain: SmartTerrain, job: ISmartTerrainJobDescriptor): void {
  for (let index = terrain.jobs.length(); index >= 1; index -= 1) {
    terrain.jobs.set(index + 1, terrain.jobs.get(index));
  }

  terrain.jobs.set(1, job);

  for (const [index, it] of terrain.jobs) {
    it.id = index as TNumberId;
  }
}

describe("smart terrain job maintenance mechanisms", () => {
  beforeEach(() => {
    resetRegistry();
    registerSimulator();
    mockRegisteredActor();

    surgeConfig.IS_STARTED = false;
  });

  it("should probe a bounded persistent slice of jobs per clean tick and wrap at the end", () => {
    const terrain: SmartTerrain = mockTerrain();
    const online: ServerHumanObject = mockArrivedStalker(terrain);
    const offline: ServerHumanObject = mockArrivedStalker(terrain);

    registerObject(MockGameObject.mock({ id: online.id }));

    updateTerrainJobs(terrain);

    expect(terrain.jobsDirty).toBe(false);

    const onlineDescriptor: IObjectJobState = terrain.objectJobDescriptors.get(online.id);
    const offlineDescriptor: IObjectJobState = terrain.objectJobDescriptors.get(offline.id);

    expect(onlineDescriptor.scanCursor).toBe(1);
    expect(offlineDescriptor.scanCursor).toBe(1);

    updateTerrainJobs(terrain);

    expect(onlineDescriptor.scanCursor).toBe(1 + smartTerrainConfig.JOB_SCAN_STEP_ONLINE);
    expect(offlineDescriptor.scanCursor).toBe(1 + smartTerrainConfig.JOB_SCAN_STEP_OFFLINE);

    updateTerrainJobs(terrain);

    expect(onlineDescriptor.scanCursor).toBe(1 + 2 * smartTerrainConfig.JOB_SCAN_STEP_ONLINE);
    expect(offlineDescriptor.scanCursor).toBe(1 + 2 * smartTerrainConfig.JOB_SCAN_STEP_OFFLINE);

    // Wrapping resumes from the list head on the next tick.
    onlineDescriptor.scanCursor = terrain.jobs.length();

    updateTerrainJobs(terrain);

    expect(onlineDescriptor.scanCursor).toBe(1);
  });

  it("should accept only strictly higher priority openings from the cursor probe", () => {
    const terrain: SmartTerrain = mockTerrain();

    let isHighPriorityUnlocked: boolean = false;

    // Equal-priority available job (camper priority matches) is inserted first, locked job on top.
    injectTopPriorityJob(terrain, {
      section: "logic@maintenance_equal",
      priority: smartTerrainConfig.JOBS.STALKER_CAMPER.PRIORITY,
      type: EJobType.POINT,
      pathType: EJobPathType.POINT,
      isMonsterJob: false,
    });
    injectTopPriorityJob(terrain, {
      section: "logic@maintenance_high",
      priority: 100,
      type: EJobType.EXCLUSIVE,
      pathType: EJobPathType.POINT,
      isMonsterJob: false,
      preconditionFunction: () => isHighPriorityUnlocked,
    });

    const stalker: ServerHumanObject = mockArrivedStalker(terrain);

    registerObject(MockGameObject.mock({ id: stalker.id }));

    updateTerrainJobs(terrain);

    const descriptor: IObjectJobState = terrain.objectJobDescriptors.get(stalker.id);
    const initialSection: string = descriptor.job?.section as string;

    // Sweep the whole list on clean ticks - equal priority openings are never taken.
    for (const _ of $range(1, math.ceil(terrain.jobs.length() / smartTerrainConfig.JOB_SCAN_STEP_ONLINE) + 1)) {
      updateTerrainJobs(terrain);
    }

    expect(descriptor.job?.section).toBe(initialSection);

    // Strictly higher priority opening is taken once the cursor reaches it, cursor resets.
    isHighPriorityUnlocked = true;
    descriptor.scanCursor = 1;

    updateTerrainJobs(terrain);

    expect(descriptor.job?.section).toBe("logic@maintenance_high");
    expect(descriptor.scanCursor).toBe(1);
  });

  it("should keep objects jobless without throwing when no job fits and retry on later ticks", () => {
    const terrain: SmartTerrain = mockTerrain();

    // Single monster-only job - stalkers can never take it.
    terrain.jobs = new LuaTable();
    terrain.jobs.set(1, {
      id: 1,
      section: "logic@maintenance_mob",
      priority: 10,
      type: EJobType.MONSTER_HOME,
      pathType: EJobPathType.POINT,
      isMonsterJob: true,
    });

    const stalker: ServerHumanObject = mockArrivedStalker(terrain);
    const descriptor: IObjectJobState = terrain.objectJobDescriptors.get(stalker.id);

    expect(descriptor.job).toBeNull();
    expect(descriptor.jobId).toBe(-1);

    registerObject(MockGameObject.mock({ id: stalker.id }));

    updateTerrainJobs(terrain);

    expect(descriptor.job).toBeNull();
    expect(terrain.jobsDirty).toBe(false);

    // A suitable job appears - jobless online objects retry with a full scan on clean ticks.
    terrain.jobs.set(2, {
      id: 2,
      section: "logic@maintenance_point",
      priority: 5,
      type: EJobType.POINT,
      pathType: EJobPathType.POINT,
      isMonsterJob: false,
    });

    updateTerrainJobs(terrain);

    expect(descriptor.job?.section).toBe("logic@maintenance_point");
    expect(terrain.objectByJobSection.get("logic@maintenance_point")).toBe(stalker.id);
  });

  it("should probe bounded slices for jobless offline objects", () => {
    const terrain: SmartTerrain = mockTerrain();

    terrain.jobs = new LuaTable();
    terrain.jobs.set(1, {
      id: 1,
      section: "logic@maintenance_mob",
      priority: 10,
      type: EJobType.MONSTER_HOME,
      pathType: EJobPathType.POINT,
      isMonsterJob: true,
    });
    terrain.jobs.set(2, {
      id: 2,
      section: "logic@maintenance_point",
      priority: 5,
      type: EJobType.POINT,
      pathType: EJobPathType.POINT,
      isMonsterJob: false,
    });

    const stalker: ServerHumanObject = mockArrivedStalker(terrain);
    const descriptor: IObjectJobState = terrain.objectJobDescriptors.get(stalker.id);

    // Consume dirty state from the arrival first, then make the object jobless again.
    updateTerrainJobs(terrain);
    expect(terrain.jobsDirty).toBe(false);

    descriptor.job!.objectId = null;
    terrain.objectByJobSection.delete("logic@maintenance_point");
    descriptor.job = null;
    descriptor.jobId = -1;
    descriptor.jobPriority = -1;
    descriptor.scanCursor = 1;

    // Offline jobless step is 1: first tick examines the monster job, second tick assigns.
    updateTerrainJobs(terrain);
    expect(descriptor.job).toBeNull();

    updateTerrainJobs(terrain);
    expect(terrain.objectJobDescriptors.get(stalker.id).job?.section).toBe("logic@maintenance_point");
  });

  it("should survive desired job switches when the desired holder is jobless", () => {
    const terrain: SmartTerrain = mockTerrain();
    const first: ServerHumanObject = mockArrivedStalker(terrain);
    const second: ServerHumanObject = mockArrivedStalker(terrain);

    updateTerrainJobs(terrain);

    const firstDescriptor: IObjectJobState = terrain.objectJobDescriptors.get(first.id);
    const secondDescriptor: IObjectJobState = terrain.objectJobDescriptors.get(second.id);
    const desiredSection: string = secondDescriptor.job?.section as string;

    // Make the desired holder transiently jobless while its section link lingers.
    secondDescriptor.job!.objectId = null;
    secondDescriptor.job = null;
    secondDescriptor.jobId = -1;
    secondDescriptor.jobPriority = -1;

    firstDescriptor.desiredJob = desiredSection;

    expect(() => switchTerrainObjectToDesiredJob(terrain, first.id)).not.toThrow();
    expect(firstDescriptor.job).not.toBeNull();
  });

  it("should mark and consume dirty state around full passes", () => {
    const terrain: SmartTerrain = mockTerrain();

    expect(terrain.jobsDirty).toBe(true);
    expect(terrain.jobsDirtyReason).toBeNull();

    const first: ServerHumanObject = mockArrivedStalker(terrain);

    expect(terrain.jobsDirty).toBe(true);
    expect(terrain.jobsDirtyReason).toBe("arrival");

    updateTerrainJobs(terrain);

    expect(terrain.jobsDirty).toBe(false);
    expect(terrain.jobsDirtyReason).toBeNull();

    // Clean ticks do not set dirty state.
    updateTerrainJobs(terrain);

    expect(terrain.jobsDirty).toBe(false);

    terrain.onObjectDeath(first);

    expect(terrain.jobsDirty).toBe(true);
    expect(terrain.jobsDirtyReason).toBe("death");

    updateTerrainJobs(terrain);

    const second: ServerHumanObject = mockArrivedStalker(terrain);

    updateTerrainJobs(terrain);

    expect(terrain.jobsDirty).toBe(false);

    terrain.unregister_npc(second);

    expect(terrain.jobsDirty).toBe(true);
    expect(terrain.jobsDirtyReason).toBe("departure");
  });

  it("should defer clean maintenance but immediately process dirty job state", () => {
    const terrain: SmartTerrain = mockTerrain();
    const stalker: ServerHumanObject = mockArrivedStalker(terrain);

    registerObject(MockGameObject.mock({ id: stalker.id }));
    expect(updateTerrainJobs(terrain)).toBe(true);

    const descriptor: IObjectJobState = terrain.objectJobDescriptors.get(stalker.id);
    const initialCursor: TNumberId = descriptor.scanCursor;

    expect(updateTerrainJobs(terrain, false)).toBe(false);
    expect(descriptor.scanCursor).toBe(initialCursor);

    markTerrainJobsDirty(terrain, "test");

    expect(updateTerrainJobs(terrain, false)).toBe(true);
    expect(terrain.jobsDirty).toBe(false);
  });

  it("should run a full pass on surge transitions detected as environment edges", () => {
    const terrain: SmartTerrain = mockTerrain();
    const stalker: ServerHumanObject = mockArrivedStalker(terrain);

    updateTerrainJobs(terrain);

    const descriptor: IObjectJobState = terrain.objectJobDescriptors.get(stalker.id);

    expect(terrain.jobsSurgeState).toBe(false);
    expect(descriptor.job?.type).not.toBe(EJobType.SURGE);

    // Surge start unlocks higher priority surge jobs - full pass picks them up the same tick.
    surgeConfig.IS_STARTED = true;

    updateTerrainJobs(terrain);

    expect(terrain.jobsSurgeState).toBe(true);
    expect(terrain.jobsDirty).toBe(false);
    expect(descriptor.job?.type).toBe(EJobType.SURGE);

    // Surge end fails the keep-check inputs - full pass downgrades the same tick.
    surgeConfig.IS_STARTED = false;

    updateTerrainJobs(terrain);

    expect(terrain.jobsSurgeState).toBe(false);
    expect(descriptor.job?.type).not.toBe(EJobType.SURGE);
  });
});
