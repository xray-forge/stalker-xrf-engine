import { beforeEach, describe, expect, it, jest } from "@jest/globals";

import { registerSimulator } from "@/engine/core/database";
import {
  selectTerrainObjectJob,
  switchTerrainObjectToDesiredJob,
  updateTerrainJobs,
} from "@/engine/core/objects/smart_terrain/job/job_execution";
import { EJobPathType, EJobType } from "@/engine/core/objects/smart_terrain/job/job_types";
import { SmartTerrain } from "@/engine/core/objects/smart_terrain/SmartTerrain";
import { MAX_ALIFE_ID } from "@/engine/lib/constants/memory";
import { AnyObject, IniFile, ServerHumanObject, ServerMonsterBaseObject } from "@/engine/lib/types";
import { mockRegisteredActor, resetRegistry } from "@/fixtures/engine";
import { MockAlifeHumanStalker, MockAlifeMonsterBase } from "@/fixtures/xray";

describe("job_execution logic", () => {
  beforeEach(() => {
    resetRegistry();
    registerSimulator();
    mockRegisteredActor();
  });

  it("should correctly create jobs on register", () => {
    const terrain: SmartTerrain = new SmartTerrain("test_smart");

    terrain.ini = terrain.spawn_ini() as IniFile;
    jest.spyOn(terrain, "name").mockImplementation(() => "test_smart");

    terrain.on_register();

    expect(terrain.jobs.length()).toBe(54);
    expect(terrain.objectJobDescriptors.length()).toBe(0);
    expect(terrain.objectByJobSection.length()).toBe(0);
    expect(terrain.jobDeadTimeById.length()).toBe(0);
    expect(terrain.stayingObjectsCount).toBe(0);
  });

  it("should correctly assign jobs on new stalker arriving when not registered", () => {
    const terrain: SmartTerrain = new SmartTerrain("test_smart");
    const first: ServerHumanObject = MockAlifeHumanStalker.mock();
    const second: ServerHumanObject = MockAlifeHumanStalker.mock();

    terrain.ini = terrain.spawn_ini() as IniFile;
    jest.spyOn(terrain, "name").mockImplementation(() => "test_smart");

    terrain.register_npc(first);
    terrain.register_npc(first);
    terrain.register_npc(first);

    expect(terrain.stayingObjectsCount).toBe(0);
    expect(terrain.objectsToRegister.length()).toBe(1);
    expect(terrain.objectsToRegister.get(first.id)).toBe(first);
    expect(first.smart_terrain_task_activate).not.toHaveBeenCalled();
    expect(first.m_smart_terrain_id).toBe(MAX_ALIFE_ID);

    terrain.register_npc(second);
    terrain.register_npc(second);
    terrain.register_npc(second);

    expect(terrain.stayingObjectsCount).toBe(0);
    expect(terrain.objectsToRegister.length()).toBe(2);
    expect(terrain.objectsToRegister.get(first.id)).toBe(first);
    expect(terrain.objectsToRegister.get(second.id)).toBe(second);
    expect(first.smart_terrain_task_activate).not.toHaveBeenCalled();
    expect(first.m_smart_terrain_id).toBe(MAX_ALIFE_ID);
    expect(second.smart_terrain_task_activate).not.toHaveBeenCalled();
    expect(second.m_smart_terrain_id).toBe(MAX_ALIFE_ID);
  });

  it("should correctly assign jobs on new stalker arriving when registered and arriving", () => {
    const terrain: SmartTerrain = new SmartTerrain("test_smart");
    const stalker: ServerHumanObject = MockAlifeHumanStalker.mock();

    terrain.ini = terrain.spawn_ini() as IniFile;
    jest.spyOn(terrain, "name").mockImplementation(() => "test_smart");

    expect(stalker.m_smart_terrain_id).toBe(MAX_ALIFE_ID);

    (stalker as AnyObject).m_game_vertex_id = 400;
    (stalker as AnyObject).m_level_vertex_id = 401;

    terrain.on_register();
    terrain.register_npc(stalker);

    expect(terrain.stayingObjectsCount).toBe(1);
    expect(terrain.objectsToRegister.length()).toBe(0);
    expect(terrain.arrivingObjects.length()).toBe(1);
    expect(stalker.smart_terrain_task_activate).not.toHaveBeenCalled();
    expect(stalker.m_smart_terrain_id).toBe(terrain.id);
  });

  it("should correctly assign jobs on new stalker arriving when registered and arrived", () => {
    const terrain: SmartTerrain = new SmartTerrain("test_smart");
    const stalker: ServerHumanObject = MockAlifeHumanStalker.mock();

    terrain.ini = terrain.spawn_ini() as IniFile;
    jest.spyOn(terrain, "name").mockImplementation(() => "test_smart");

    (terrain as AnyObject).m_game_vertex_id = 512;
    (stalker as AnyObject).m_game_vertex_id = 512;

    expect(stalker.m_smart_terrain_id).toBe(MAX_ALIFE_ID);

    terrain.on_register();
    terrain.register_npc(stalker);

    expect(terrain.stayingObjectsCount).toBe(1);
    expect(terrain.objectsToRegister.length()).toBe(0);
    expect(terrain.arrivingObjects.length()).toBe(0);
    expect(stalker.smart_terrain_task_activate).not.toHaveBeenCalled();
    expect(stalker.m_smart_terrain_id).toBe(terrain.id);

    expect(terrain.objectByJobSection.length()).toBe(1);
    expect(terrain.objectJobDescriptors.length()).toBe(1);
    expect(terrain.objectJobDescriptors.get(stalker.id)).toEqual({
      object: stalker,
      isBegun: true,
      isMonster: false,
      jobId: 4,
      job: {
        preconditionFunction: expect.any(Function),
        isMonsterJob: false,
        preconditionParameters: {
          wayName: "test_smart_camper_1_walk",
        },
        id: 4,
        alifeTask: {
          gameVertexId: 20001,
          levelVertexId: 20002,
          taskPosition: {
            x: 10,
            y: 20,
            z: 30,
          },
        },
        gameVertexId: 20001,
        pathType: EJobPathType.PATH,
        levelId: 200010,
        position: {
          x: 10,
          y: 20,
          z: 30,
        },
        section: "logic@test_smart_camper_1_walk",
        type: EJobType.CAMPER,
        objectId: stalker.id,
        priority: 45,
      },
      jobPriority: 45,
      desiredJob: "nil",
      schemeType: 1,
    });
  });

  it("should correctly assign jobs on few stalkers", () => {
    const terrain: SmartTerrain = new SmartTerrain("test_smart");
    const firstStalker: ServerHumanObject = MockAlifeHumanStalker.mock();
    const secondStalker: ServerHumanObject = MockAlifeHumanStalker.mock();

    terrain.ini = terrain.spawn_ini() as IniFile;
    jest.spyOn(terrain, "name").mockImplementation(() => "test_smart");

    (terrain as AnyObject).m_game_vertex_id = 512;
    (firstStalker as AnyObject).m_game_vertex_id = 510;
    (secondStalker as AnyObject).m_game_vertex_id = 512;

    expect(secondStalker.m_smart_terrain_id).toBe(MAX_ALIFE_ID);

    terrain.on_register();

    terrain.register_npc(firstStalker);
    terrain.register_npc(secondStalker);

    expect(terrain.stayingObjectsCount).toBe(2);
    expect(terrain.objectsToRegister.length()).toBe(0);
    expect(terrain.arrivingObjects.length()).toBe(1);
    expect(firstStalker.m_smart_terrain_id).toBe(terrain.id);
    expect(secondStalker.m_smart_terrain_id).toBe(terrain.id);
    expect(terrain.objectByJobSection.length()).toBe(1);
    expect(terrain.objectJobDescriptors.length()).toBe(1);

    // Arrived.
    (firstStalker as AnyObject).m_game_vertex_id = 512;

    updateTerrainJobs(terrain);

    expect(terrain.objectByJobSection.length()).toBe(2);
    expect(terrain.objectJobDescriptors.length()).toBe(2);

    expect(terrain.objectByJobSection).toEqualLuaTables({
      "logic@test_smart_camper_1_walk": secondStalker.id,
      "logic@test_smart_sniper_1_walk": firstStalker.id,
    });

    expect(terrain.objectJobDescriptors).toEqualLuaTables({
      [firstStalker.id]: {
        object: firstStalker,
        isBegun: true,
        isMonster: false,
        jobId: 5,
        job: {
          preconditionFunction: expect.any(Function),
          isMonsterJob: false,
          preconditionParameters: {
            wayName: "test_smart_sniper_1_walk",
          },
          id: 5,
          alifeTask: {
            gameVertexId: 20001,
            levelVertexId: 20002,
            taskPosition: {
              x: 10,
              y: 20,
              z: 30,
            },
          },
          gameVertexId: 20001,
          pathType: EJobPathType.PATH,
          levelId: 200010,
          position: {
            x: 10,
            y: 20,
            z: 30,
          },
          section: "logic@test_smart_sniper_1_walk",
          type: EJobType.SNIPER,
          objectId: firstStalker.id,
          priority: 30,
        },
        jobPriority: 30,
        desiredJob: "nil",
        schemeType: 1,
      },
      [secondStalker.id]: {
        object: secondStalker,
        isBegun: true,
        isMonster: false,
        jobId: 4,
        job: {
          preconditionFunction: expect.any(Function),
          isMonsterJob: false,
          preconditionParameters: {
            wayName: "test_smart_camper_1_walk",
          },
          id: 4,
          alifeTask: {
            gameVertexId: 20001,
            levelVertexId: 20002,
            taskPosition: {
              x: 10,
              y: 20,
              z: 30,
            },
          },
          gameVertexId: 20001,
          pathType: EJobPathType.PATH,
          levelId: 200010,
          position: {
            x: 10,
            y: 20,
            z: 30,
          },
          section: "logic@test_smart_camper_1_walk",
          type: EJobType.CAMPER,
          objectId: secondStalker.id,
          priority: 45,
        },
        jobPriority: 45,
        desiredJob: "nil",
        schemeType: 1,
      },
    });
  });

  it("should correctly assign jobs on new monsters arriving when registered and arrived", () => {
    const terrain: SmartTerrain = new SmartTerrain("test_smart");
    const monster: ServerMonsterBaseObject = MockAlifeMonsterBase.mock();

    terrain.ini = terrain.spawn_ini() as IniFile;
    jest.spyOn(terrain, "name").mockImplementation(() => "test_smart");

    (terrain as AnyObject).m_game_vertex_id = 512;
    (monster as AnyObject).m_game_vertex_id = 512;

    expect(monster.m_smart_terrain_id).toBe(MAX_ALIFE_ID);

    terrain.on_register();
    terrain.register_npc(monster);

    expect(terrain.stayingObjectsCount).toBe(1);
    expect(terrain.objectsToRegister.length()).toBe(0);
    expect(terrain.arrivingObjects.length()).toBe(0);
    expect(monster.smart_terrain_task_activate).toHaveBeenCalled();
    expect(monster.m_smart_terrain_id).toBe(terrain.id);

    expect(terrain.objectByJobSection.length()).toBe(1);
    expect(terrain.objectJobDescriptors.length()).toBe(1);
    expect(terrain.objectJobDescriptors.get(monster.id)).toEqual({
      object: monster,
      isBegun: true,
      isMonster: true,
      jobId: 15,
      job: {
        id: 15,
        isMonsterJob: true,
        alifeTask: {
          gameVertexId: 512,
          levelVertexId: 255,
          taskPosition: {
            x: 1,
            y: 2,
            z: 3,
          },
        },
        gameVertexId: 512,
        pathType: EJobPathType.POINT,
        levelId: 5120,
        position: {
          x: 1,
          y: 2,
          z: 3,
        },
        priority: 10,
        type: EJobType.MONSTER_HOME,
        section: "logic@test_smart_home_1",
        objectId: monster.id,
      },
      jobPriority: 10,
      desiredJob: "nil",
      schemeType: 2,
    });
  });
});

describe("switchSmartTerrainObjectToDesiredJob util", () => {
  beforeEach(() => {
    resetRegistry();
  });

  it("should correctly switch objects to desired jobs", () => {
    const terrain: SmartTerrain = new SmartTerrain("test_smart");
    const firstStalker: ServerHumanObject = MockAlifeHumanStalker.mock();
    const secondStalker: ServerHumanObject = MockAlifeHumanStalker.mock();

    terrain.ini = terrain.spawn_ini() as IniFile;
    jest.spyOn(terrain, "name").mockImplementation(() => "test_smart");

    (terrain as AnyObject).m_game_vertex_id = 512;
    (firstStalker as AnyObject).m_game_vertex_id = 512;
    (secondStalker as AnyObject).m_game_vertex_id = 512;

    terrain.on_register();

    terrain.register_npc(firstStalker);
    terrain.register_npc(secondStalker);

    expect(terrain.objectByJobSection).toEqualLuaTables({
      "logic@test_smart_camper_1_walk": firstStalker.id,
      "logic@test_smart_sniper_1_walk": secondStalker.id,
    });

    terrain.objectJobDescriptors.get(firstStalker.id).desiredJob = "logic@test_smart_sniper_1_walk";
    switchTerrainObjectToDesiredJob(terrain, firstStalker.id);

    expect(terrain.objectByJobSection).toEqualLuaTables({
      "logic@test_smart_sniper_1_walk": firstStalker.id,
      "logic@test_smart_camper_1_walk": secondStalker.id,
    });

    terrain.objectJobDescriptors.get(firstStalker.id).desiredJob = "logic@test_smart_camper_1_walk";
    switchTerrainObjectToDesiredJob(terrain, firstStalker.id);

    expect(terrain.objectByJobSection).toEqualLuaTables({
      "logic@test_smart_camper_1_walk": firstStalker.id,
      "logic@test_smart_sniper_1_walk": secondStalker.id,
    });

    terrain.objectJobDescriptors.get(firstStalker.id).desiredJob = "logic@test_smart_sniper_1_walk";
    switchTerrainObjectToDesiredJob(terrain, firstStalker.id);
    updateTerrainJobs(terrain);

    expect(terrain.objectByJobSection).toEqualLuaTables({
      "logic@test_smart_sniper_1_walk": firstStalker.id,
      "logic@test_smart_camper_1_walk": secondStalker.id,
    });
  });
});

describe("selectSmartTerrainObjectJob util", () => {
  beforeEach(() => {
    resetRegistry();
  });

  it("should correctly re-select jobs with few stalkers", () => {
    const terrain: SmartTerrain = new SmartTerrain("test_smart");
    const firstStalker: ServerHumanObject = MockAlifeHumanStalker.mock();
    const secondStalker: ServerHumanObject = MockAlifeHumanStalker.mock();

    terrain.ini = terrain.spawn_ini() as IniFile;
    jest.spyOn(terrain, "name").mockImplementation(() => "test_smart");

    (terrain as AnyObject).m_game_vertex_id = 512;
    (firstStalker as AnyObject).m_game_vertex_id = 512;
    (secondStalker as AnyObject).m_game_vertex_id = 512;

    terrain.on_register();

    terrain.register_npc(firstStalker);
    terrain.register_npc(secondStalker);

    const [firstJobId, firstJob] = selectTerrainObjectJob(terrain, terrain.objectJobDescriptors.get(secondStalker.id));

    const [secondJobId, secondJob] = selectTerrainObjectJob(terrain, terrain.objectJobDescriptors.get(firstStalker.id));
    const [thirdJobId, thirdJob] = selectTerrainObjectJob(terrain, terrain.objectJobDescriptors.get(secondStalker.id));
    const [fourthJobId, fourthJob] = selectTerrainObjectJob(terrain, terrain.objectJobDescriptors.get(firstStalker.id));

    expect(firstJobId).toBe(5);
    expect(secondJobId).toBe(4);
    expect(thirdJobId).toBe(5);
    expect(fourthJobId).toBe(4);

    expect(firstJob).toBe(thirdJob);
    expect(secondJob).toBe(fourthJob);

    // Works in determined way, always same even after multiple calls.

    expect(terrain.objectByJobSection).toEqualLuaTables({
      "logic@test_smart_camper_1_walk": firstStalker.id,
      "logic@test_smart_sniper_1_walk": secondStalker.id,
    });

    expect(terrain.objectJobDescriptors).toEqualLuaTables({
      [firstStalker.id]: {
        object: firstStalker,
        isBegun: true,
        isMonster: false,
        jobId: 4,
        job: {
          preconditionFunction: expect.any(Function),
          isMonsterJob: false,
          preconditionParameters: {
            wayName: "test_smart_camper_1_walk",
          },
          id: 4,
          alifeTask: {
            gameVertexId: 20001,
            levelVertexId: 20002,
            taskPosition: {
              x: 10,
              y: 20,
              z: 30,
            },
          },
          gameVertexId: 20001,
          pathType: EJobPathType.PATH,
          levelId: 200010,
          position: {
            x: 10,
            y: 20,
            z: 30,
          },
          priority: 45,
          type: EJobType.CAMPER,
          section: "logic@test_smart_camper_1_walk",
          objectId: firstStalker.id,
        },
        jobPriority: 45,
        desiredJob: "nil",
        schemeType: 1,
      },
      [secondStalker.id]: {
        object: secondStalker,
        isBegun: true,
        isMonster: false,
        jobId: 5,
        job: {
          preconditionFunction: expect.any(Function),
          isMonsterJob: false,
          preconditionParameters: {
            wayName: "test_smart_sniper_1_walk",
          },
          id: 5,
          alifeTask: {
            gameVertexId: 20001,
            levelVertexId: 20002,
            taskPosition: {
              x: 10,
              y: 20,
              z: 30,
            },
          },
          gameVertexId: 20001,
          pathType: EJobPathType.PATH,
          levelId: 200010,
          position: {
            x: 10,
            y: 20,
            z: 30,
          },
          priority: 30,
          type: EJobType.SNIPER,
          section: "logic@test_smart_sniper_1_walk",
          objectId: secondStalker.id,
        },
        jobPriority: 30,
        desiredJob: "nil",
        schemeType: 1,
      },
    });
  });
});
