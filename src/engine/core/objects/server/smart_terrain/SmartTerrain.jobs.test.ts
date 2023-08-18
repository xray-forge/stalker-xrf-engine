import { describe, expect, it, jest } from "@jest/globals";

import { SmartTerrain } from "@/engine/core/objects";
import { EJobPathType, EJobType } from "@/engine/core/utils/job";
import { MAX_U16 } from "@/engine/lib/constants/memory";
import { AnyObject, ServerHumanObject, ServerMonsterBaseObject } from "@/engine/lib/types";
import { mockServerAlifeHumanStalker, mockServerAlifeMonsterBase } from "@/fixtures/xray";

describe("SmartTerrain class jobs logic", () => {
  it("should correctly create jobs on register", () => {
    const smartTerrain: SmartTerrain = new SmartTerrain("test_smart");

    smartTerrain.ini = smartTerrain.spawn_ini();
    jest.spyOn(smartTerrain, "name").mockImplementation(() => "test_smart");

    smartTerrain.on_register();

    expect(smartTerrain.jobs.length()).toBe(54);
    expect(smartTerrain.objectJobDescriptors.length()).toBe(0);
    expect(smartTerrain.objectByJobSection.length()).toBe(0);
    expect(smartTerrain.jobDeadTimeById.length()).toBe(0);
    expect(smartTerrain.population).toBe(0);
  });

  it("should correctly assign jobs on new stalker arriving when not registered", () => {
    const smartTerrain: SmartTerrain = new SmartTerrain("test_smart");
    const stalker: ServerHumanObject = mockServerAlifeHumanStalker();

    smartTerrain.ini = smartTerrain.spawn_ini();
    jest.spyOn(smartTerrain, "name").mockImplementation(() => "test_smart");

    smartTerrain.register_npc(stalker);

    expect(smartTerrain.population).toBe(1);
    expect(smartTerrain.objectsToRegister.length()).toBe(1);
    expect(smartTerrain.objectsToRegister.get(1)).toBe(stalker);
    expect(stalker.smart_terrain_task_activate).not.toHaveBeenCalled();
    expect(stalker.m_smart_terrain_id).toBe(MAX_U16);
  });

  it("should correctly assign jobs on new stalker arriving when registered and arriving", () => {
    const smartTerrain: SmartTerrain = new SmartTerrain("test_smart");
    const stalker: ServerHumanObject = mockServerAlifeHumanStalker();

    smartTerrain.ini = smartTerrain.spawn_ini();
    jest.spyOn(smartTerrain, "name").mockImplementation(() => "test_smart");

    expect(stalker.m_smart_terrain_id).toBe(MAX_U16);

    smartTerrain.on_register();
    smartTerrain.register_npc(stalker);

    expect(smartTerrain.population).toBe(1);
    expect(smartTerrain.objectsToRegister.length()).toBe(0);
    expect(smartTerrain.arrivingObjects.length()).toBe(1);
    expect(stalker.smart_terrain_task_activate).not.toHaveBeenCalled();
    expect(stalker.m_smart_terrain_id).toBe(smartTerrain.id);
  });

  it("should correctly assign jobs on new stalker arriving when registered and arrived", () => {
    const smartTerrain: SmartTerrain = new SmartTerrain("test_smart");
    const stalker: ServerHumanObject = mockServerAlifeHumanStalker();

    smartTerrain.ini = smartTerrain.spawn_ini();
    jest.spyOn(smartTerrain, "name").mockImplementation(() => "test_smart");

    (smartTerrain as AnyObject).m_game_vertex_id = 512;
    (stalker as AnyObject).m_game_vertex_id = 512;

    expect(stalker.m_smart_terrain_id).toBe(MAX_U16);

    smartTerrain.on_register();
    smartTerrain.register_npc(stalker);

    expect(smartTerrain.population).toBe(1);
    expect(smartTerrain.objectsToRegister.length()).toBe(0);
    expect(smartTerrain.arrivingObjects.length()).toBe(0);
    expect(stalker.smart_terrain_task_activate).not.toHaveBeenCalled();
    expect(stalker.m_smart_terrain_id).toBe(smartTerrain.id);

    expect(smartTerrain.objectByJobSection.length()).toBe(1);
    expect(smartTerrain.objectJobDescriptors.length()).toBe(1);
    expect(smartTerrain.objectJobDescriptors.get(stalker.id)).toEqual({
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
    const smartTerrain: SmartTerrain = new SmartTerrain("test_smart");
    const firstStalker: ServerHumanObject = mockServerAlifeHumanStalker();
    const secondStalker: ServerHumanObject = mockServerAlifeHumanStalker();

    smartTerrain.ini = smartTerrain.spawn_ini();
    jest.spyOn(smartTerrain, "name").mockImplementation(() => "test_smart");

    (smartTerrain as AnyObject).m_game_vertex_id = 512;
    (firstStalker as AnyObject).m_game_vertex_id = 510;
    (secondStalker as AnyObject).m_game_vertex_id = 512;

    expect(secondStalker.m_smart_terrain_id).toBe(MAX_U16);

    smartTerrain.on_register();

    smartTerrain.register_npc(firstStalker);
    smartTerrain.register_npc(secondStalker);

    expect(smartTerrain.population).toBe(2);
    expect(smartTerrain.objectsToRegister.length()).toBe(0);
    expect(smartTerrain.arrivingObjects.length()).toBe(1);
    expect(firstStalker.m_smart_terrain_id).toBe(smartTerrain.id);
    expect(secondStalker.m_smart_terrain_id).toBe(smartTerrain.id);
    expect(smartTerrain.objectByJobSection.length()).toBe(1);
    expect(smartTerrain.objectJobDescriptors.length()).toBe(1);

    // Arrived.
    (firstStalker as AnyObject).m_game_vertex_id = 512;

    smartTerrain.updateJobs();

    expect(smartTerrain.objectByJobSection.length()).toBe(2);
    expect(smartTerrain.objectJobDescriptors.length()).toBe(2);

    expect(smartTerrain.objectByJobSection).toEqualLuaTables({
      "logic@test_smart_camper_1_walk": secondStalker.id,
      "logic@test_smart_sniper_1_walk": firstStalker.id,
    });

    expect(smartTerrain.objectJobDescriptors).toEqualLuaTables({
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
    const smartTerrain: SmartTerrain = new SmartTerrain("test_smart");
    const monster: ServerMonsterBaseObject = mockServerAlifeMonsterBase();

    smartTerrain.ini = smartTerrain.spawn_ini();
    jest.spyOn(smartTerrain, "name").mockImplementation(() => "test_smart");

    (smartTerrain as AnyObject).m_game_vertex_id = 512;
    (monster as AnyObject).m_game_vertex_id = 512;

    expect(monster.m_smart_terrain_id).toBe(MAX_U16);

    smartTerrain.on_register();
    smartTerrain.register_npc(monster);

    expect(smartTerrain.population).toBe(1);
    expect(smartTerrain.objectsToRegister.length()).toBe(0);
    expect(smartTerrain.arrivingObjects.length()).toBe(0);
    expect(monster.smart_terrain_task_activate).toHaveBeenCalled();
    expect(monster.m_smart_terrain_id).toBe(smartTerrain.id);

    expect(smartTerrain.objectByJobSection.length()).toBe(1);
    expect(smartTerrain.objectJobDescriptors.length()).toBe(1);
    expect(smartTerrain.objectJobDescriptors.get(monster.id)).toEqual({
      object: monster,
      isBegun: true,
      isMonster: true,
      jobId: 15,
      job: {
        id: 15,
        isMonsterJob: true,
        alifeTask: {
          gameVertexId: 512,
          levelVertexId: 250,
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

  it("should correctly re-select jobs with few stalkers", () => {
    const smartTerrain: SmartTerrain = new SmartTerrain("test_smart");
    const firstStalker: ServerHumanObject = mockServerAlifeHumanStalker();
    const secondStalker: ServerHumanObject = mockServerAlifeHumanStalker();

    smartTerrain.ini = smartTerrain.spawn_ini();
    jest.spyOn(smartTerrain, "name").mockImplementation(() => "test_smart");

    (smartTerrain as AnyObject).m_game_vertex_id = 512;
    (firstStalker as AnyObject).m_game_vertex_id = 512;
    (secondStalker as AnyObject).m_game_vertex_id = 512;

    smartTerrain.on_register();

    smartTerrain.register_npc(firstStalker);
    smartTerrain.register_npc(secondStalker);

    smartTerrain.selectObjectJob(smartTerrain.objectJobDescriptors.get(secondStalker.id));
    smartTerrain.selectObjectJob(smartTerrain.objectJobDescriptors.get(firstStalker.id));
    smartTerrain.selectObjectJob(smartTerrain.objectJobDescriptors.get(secondStalker.id));
    smartTerrain.selectObjectJob(smartTerrain.objectJobDescriptors.get(firstStalker.id));

    // Works in determined way, always same even after multiple calls.

    expect(smartTerrain.objectByJobSection).toEqualLuaTables({
      "logic@test_smart_camper_1_walk": firstStalker.id,
      "logic@test_smart_sniper_1_walk": secondStalker.id,
    });

    expect(smartTerrain.objectJobDescriptors).toEqualLuaTables({
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

  it("should correctly get job section and job descriptor from smart terrain", () => {
    const smartTerrain: SmartTerrain = new SmartTerrain("test_smart");
    const firstStalker: ServerHumanObject = mockServerAlifeHumanStalker();
    const secondStalker: ServerHumanObject = mockServerAlifeHumanStalker();

    smartTerrain.ini = smartTerrain.spawn_ini();
    jest.spyOn(smartTerrain, "name").mockImplementation(() => "test_smart");

    (smartTerrain as AnyObject).m_game_vertex_id = 512;
    (firstStalker as AnyObject).m_game_vertex_id = 512;
    (secondStalker as AnyObject).m_game_vertex_id = 512;

    smartTerrain.on_register();

    smartTerrain.register_npc(firstStalker);
    smartTerrain.register_npc(secondStalker);

    expect(smartTerrain.getJobByObjectId(firstStalker.id)).toEqual({
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
      objectId: firstStalker.id,
      id: 4,
      type: EJobType.CAMPER,
      levelId: 200010,
      position: {
        x: 10,
        y: 20,
        z: 30,
      },
      priority: 45,
      section: "logic@test_smart_camper_1_walk",
      preconditionFunction: expect.any(Function),
      isMonsterJob: false,
      preconditionParameters: {
        wayName: "test_smart_camper_1_walk",
      },
    });

    expect(smartTerrain.getObjectIdByJobSection("logic@test_smart_camper_1_walk")).toBe(firstStalker.id);
  });

  it("should correctly switch objects to desired jobs", () => {
    const smartTerrain: SmartTerrain = new SmartTerrain("test_smart");
    const firstStalker: ServerHumanObject = mockServerAlifeHumanStalker();
    const secondStalker: ServerHumanObject = mockServerAlifeHumanStalker();

    smartTerrain.ini = smartTerrain.spawn_ini();
    jest.spyOn(smartTerrain, "name").mockImplementation(() => "test_smart");

    (smartTerrain as AnyObject).m_game_vertex_id = 512;
    (firstStalker as AnyObject).m_game_vertex_id = 512;
    (secondStalker as AnyObject).m_game_vertex_id = 512;

    smartTerrain.on_register();

    smartTerrain.register_npc(firstStalker);
    smartTerrain.register_npc(secondStalker);

    expect(smartTerrain.objectByJobSection).toEqualLuaTables({
      "logic@test_smart_camper_1_walk": firstStalker.id,
      "logic@test_smart_sniper_1_walk": secondStalker.id,
    });

    smartTerrain.objectJobDescriptors.get(firstStalker.id).desiredJob = "logic@test_smart_sniper_1_walk";
    smartTerrain.switchObjectToDesiredJob(firstStalker.id);

    expect(smartTerrain.objectByJobSection).toEqualLuaTables({
      "logic@test_smart_sniper_1_walk": firstStalker.id,
      "logic@test_smart_camper_1_walk": secondStalker.id,
    });

    smartTerrain.objectJobDescriptors.get(firstStalker.id).desiredJob = "logic@test_smart_camper_1_walk";
    smartTerrain.switchObjectToDesiredJob(firstStalker.id);

    expect(smartTerrain.objectByJobSection).toEqualLuaTables({
      "logic@test_smart_camper_1_walk": firstStalker.id,
      "logic@test_smart_sniper_1_walk": secondStalker.id,
    });

    smartTerrain.objectJobDescriptors.get(firstStalker.id).desiredJob = "logic@test_smart_sniper_1_walk";
    smartTerrain.switchObjectToDesiredJob(firstStalker.id);
    smartTerrain.updateJobs();

    expect(smartTerrain.objectByJobSection).toEqualLuaTables({
      "logic@test_smart_sniper_1_walk": firstStalker.id,
      "logic@test_smart_camper_1_walk": secondStalker.id,
    });
  });
});
