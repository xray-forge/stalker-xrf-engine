import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import { GameObject, IniFile, ServerHumanObject, ServerMonsterBaseObject } from "xray16/alias";
import { AnyObject, createTime, TNumberId } from "xray16/lib";
import { MockAlifeHumanStalker, MockAlifeMonsterBase, MockGameObject } from "xray16/mocks";

import { registerSimulator, registerZone } from "@/engine/core/database";
import { markTerrainJobsDirty, updateTerrainJobs } from "@/engine/core/objects/smart_terrain/job/job_execution";
import { jobPreconditionWalker } from "@/engine/core/objects/smart_terrain/job/job_precondition";
import { EJobPathType, EJobType, ISmartTerrainJobDescriptor } from "@/engine/core/objects/smart_terrain/job/job_types";
import { SmartTerrain } from "@/engine/core/objects/smart_terrain/SmartTerrain";
import { mockRegisteredActor, resetRegistry } from "@/fixtures/engine";

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

/**
 * Insert a job at the head of the priority-sorted list and restore the `id == index`
 * invariant relied on by section linking and post-load re-linking.
 */
function injectTopPriorityJob(terrain: SmartTerrain, job: ISmartTerrainJobDescriptor): void {
  // Shift existing jobs one slot down, place the new job at the head.
  for (let index = terrain.jobs.length(); index >= 1; index -= 1) {
    terrain.jobs.set(index + 1, terrain.jobs.get(index));
  }

  terrain.jobs.set(1, job);

  for (const [index, it] of terrain.jobs) {
    it.id = index as TNumberId;
  }
}

describe("smart terrain job maintenance parity", () => {
  beforeEach(() => {
    resetRegistry();
    registerSimulator();
    mockRegisteredActor();
  });

  it("should lock jobs of dead workers and free them for higher-priority pickup after expiry", () => {
    const terrain: SmartTerrain = mockTerrain();
    const first: ServerHumanObject = mockArrivedStalker(terrain);
    const second: ServerHumanObject = mockArrivedStalker(terrain);

    expect(terrain.objectByJobSection.get("logic@test_smart_camper_1_walk")).toBe(first.id);
    expect(terrain.objectByJobSection.get("logic@test_smart_sniper_1_walk")).toBe(second.id);

    terrain.onObjectDeath(first);

    expect(terrain.jobDeadTimeById.length()).toBe(1);
    expect(terrain.jobDeadTimeById.has(4)).toBe(true);
    expect(terrain.objectJobDescriptors.has(first.id)).toBe(false);

    // Dead-time lock: full pass does not upgrade the survivor onto the locked job.
    updateTerrainJobs(terrain);

    expect(terrain.objectJobDescriptors.get(second.id).jobId).toBe(25);

    // Simulate DEATH_IDLE_TIME expiry (the terrain update loop deletes the entry and marks dirty).
    terrain.jobDeadTimeById.delete(4);
    markTerrainJobsDirty(terrain, "dead_time_expiry");

    updateTerrainJobs(terrain);

    expect(terrain.objectJobDescriptors.get(second.id).jobId).toBe(4);
    expect(terrain.objectByJobSection.get("logic@test_smart_camper_1_walk")).toBe(second.id);
    expect(terrain.objectByJobSection.has("logic@test_smart_sniper_1_walk")).toBe(false);
  });

  it("should wipe dead-time locks on arrival so arriving objects always find jobs", () => {
    const terrain: SmartTerrain = mockTerrain();
    const first: ServerHumanObject = mockArrivedStalker(terrain);
    const second: ServerHumanObject = mockArrivedStalker(terrain);

    terrain.onObjectDeath(first);

    expect(terrain.jobDeadTimeById.length()).toBe(1);

    const third: ServerHumanObject = MockAlifeHumanStalker.mock();

    (third as AnyObject).m_game_vertex_id = 430;
    terrain.register_npc(third);

    expect(terrain.arrivingObjects.has(third.id)).toBe(true);

    (third as AnyObject).m_game_vertex_id = 512;

    updateTerrainJobs(terrain);

    expect(terrain.jobDeadTimeById.length()).toBe(0);
    expect(terrain.objectJobDescriptors.get(third.id).jobId).toBe(4);
    expect(terrain.objectJobDescriptors.get(second.id).jobId).toBe(25);
  });

  it("should keep monster and stalker jobs segregated across repeated passes", () => {
    const terrain: SmartTerrain = mockTerrain();
    const stalker: ServerHumanObject = mockArrivedStalker(terrain);
    const monster: ServerMonsterBaseObject = MockAlifeMonsterBase.mock();

    (monster as AnyObject).m_game_vertex_id = 512;
    terrain.register_npc(monster);

    expect(terrain.objectJobDescriptors.get(stalker.id).job?.isMonsterJob).toBe(false);
    expect(terrain.objectJobDescriptors.get(monster.id).job?.isMonsterJob).toBe(true);

    updateTerrainJobs(terrain);
    updateTerrainJobs(terrain);

    expect(terrain.objectJobDescriptors.get(stalker.id).jobId).toBe(4);
    expect(terrain.objectJobDescriptors.get(monster.id).jobId).toBe(5);
  });

  it("should reassign between safe and unsafe jobs on alarm transitions", () => {
    const terrain: SmartTerrain = mockTerrain();

    injectTopPriorityJob(terrain, {
      section: "logic@parity_unsafe_walker",
      priority: 70,
      type: EJobType.WALKER,
      pathType: EJobPathType.PATH,
      isMonsterJob: false,
      preconditionParameters: { wayName: "test_smart_walker_1_walk" },
      preconditionFunction: jobPreconditionWalker,
    });

    const stalker: ServerHumanObject = mockArrivedStalker(terrain);

    // Highest priority walker job is taken while no alarm is up.
    expect(terrain.objectJobDescriptors.get(stalker.id).job?.section).toBe("logic@parity_unsafe_walker");

    // Alarm starts and the way is outside the safe restrictor -> downgraded on the next pass.
    terrain.alarmStartedAt = createTime(2012, 6, 12, 20, 15, 30, 500);
    terrain.safeRestrictor = "parity_safe_restr";

    const zone: GameObject = MockGameObject.mock({ name: "parity_safe_restr" });

    jest.spyOn(zone, "inside").mockImplementation(() => false);
    registerZone(zone);

    updateTerrainJobs(terrain);

    expect(terrain.objectJobDescriptors.get(stalker.id).job?.section).toBe("logic@test_smart_camper_1_walk");

    // Alarm ends -> upgraded back on the next pass.
    terrain.alarmStartedAt = null;

    updateTerrainJobs(terrain);

    expect(terrain.objectJobDescriptors.get(stalker.id).job?.section).toBe("logic@parity_unsafe_walker");
  });

  it("should reassign when a high-priority job precondition flips", () => {
    const terrain: SmartTerrain = mockTerrain();

    let isJobUnlocked: boolean = false;

    injectTopPriorityJob(terrain, {
      section: "logic@parity_exclusive",
      priority: 100,
      type: EJobType.EXCLUSIVE,
      pathType: EJobPathType.POINT,
      isMonsterJob: false,
      preconditionFunction: () => isJobUnlocked,
    });

    const stalker: ServerHumanObject = mockArrivedStalker(terrain);

    expect(terrain.objectJobDescriptors.get(stalker.id).job?.section).toBe("logic@test_smart_camper_1_walk");

    isJobUnlocked = true;

    updateTerrainJobs(terrain);

    expect(terrain.objectJobDescriptors.get(stalker.id).job?.section).toBe("logic@parity_exclusive");

    isJobUnlocked = false;

    updateTerrainJobs(terrain);

    expect(terrain.objectJobDescriptors.get(stalker.id).job?.section).toBe("logic@test_smart_camper_1_walk");
  });
});
