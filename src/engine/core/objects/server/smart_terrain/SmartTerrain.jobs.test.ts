import { describe, expect, it, jest } from "@jest/globals";

import { SmartTerrain } from "@/engine/core/objects";
import { MAX_U16 } from "@/engine/lib/constants/memory";
import { AnyObject, ServerHumanObject, ServerMonsterBaseObject } from "@/engine/lib/types";
import { mockServerAlifeHumanStalker, mockServerAlifeMonsterBase } from "@/fixtures/xray";

describe("SmartTerrain class jobs logic", () => {
  it("should correctly create jobs on register", () => {
    const smartTerrain: SmartTerrain = new SmartTerrain("test_smart");

    smartTerrain.ini = smartTerrain.spawn_ini();
    jest.spyOn(smartTerrain, "name").mockImplementation(() => "test_smart");

    smartTerrain.on_register();

    expect(smartTerrain.jobs.length()).toBe(2);
    expect(smartTerrain.jobsData.length()).toBe(54);
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
      serverObject: stalker,
      begin_job: true,
      isMonster: false,
      job_id: 3,
      job_link: {
        preconditionFunction: expect.any(Function),
        preconditionParameters: {
          way_name: "test_smart_camper_1_walk",
        },
        job_id: 3,
        npc_id: stalker.id,
        priority: 45,
      },
      job_prior: 45,
      need_job: "nil",
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
        serverObject: firstStalker,
        begin_job: true,
        isMonster: false,
        job_id: 4,
        job_link: {
          preconditionFunction: expect.any(Function),
          preconditionParameters: {
            way_name: "test_smart_sniper_1_walk",
          },
          job_id: 4,
          npc_id: firstStalker.id,
          priority: 30,
        },
        job_prior: 30,
        need_job: "nil",
        schemeType: 1,
      },
      [secondStalker.id]: {
        serverObject: secondStalker,
        begin_job: true,
        isMonster: false,
        job_id: 3,
        job_link: {
          preconditionFunction: expect.any(Function),
          preconditionParameters: {
            way_name: "test_smart_camper_1_walk",
          },
          job_id: 3,
          npc_id: secondStalker.id,
          priority: 45,
        },
        job_prior: 45,
        need_job: "nil",
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
      serverObject: monster,
      begin_job: true,
      isMonster: true,
      job_id: 34,
      job_link: {
        job_id: 34,
        npc_id: monster.id,
        priority: 40,
      },
      job_prior: 40,
      need_job: "nil",
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
        serverObject: firstStalker,
        begin_job: true,
        isMonster: false,
        job_id: 3,
        job_link: {
          preconditionFunction: expect.any(Function),
          preconditionParameters: {
            way_name: "test_smart_camper_1_walk",
          },
          job_id: 3,
          npc_id: firstStalker.id,
          priority: 45,
        },
        job_prior: 45,
        need_job: "nil",
        schemeType: 1,
      },
      [secondStalker.id]: {
        serverObject: secondStalker,
        begin_job: true,
        isMonster: false,
        job_id: 4,
        job_link: {
          preconditionFunction: expect.any(Function),
          preconditionParameters: {
            way_name: "test_smart_sniper_1_walk",
          },
          job_id: 4,
          npc_id: secondStalker.id,
          priority: 30,
        },
        job_prior: 30,
        need_job: "nil",
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
      alife_task: {
        gameVertexId: 20001,
        levelVertexId: 20002,
        taskPosition: {
          x: 10,
          y: 20,
          z: 30,
        },
      },
      game_vertex_id: 20001,
      job_type: "path_job",
      level_id: 200010,
      position: {
        x: 10,
        y: 20,
        z: 30,
      },
      priority: 45,
      section: "logic@test_smart_camper_1_walk",
    });

    expect(smartTerrain.getObjectIdByJobId("logic@test_smart_camper_1_walk")).toBe(firstStalker.id);
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

    smartTerrain.objectJobDescriptors.get(firstStalker.id).need_job = "logic@test_smart_sniper_1_walk";
    smartTerrain.switchObjectToDesiredJob(firstStalker.id);

    expect(smartTerrain.objectByJobSection).toEqualLuaTables({
      "logic@test_smart_sniper_1_walk": firstStalker.id,
      "logic@test_smart_camper_1_walk": secondStalker.id,
    });

    smartTerrain.objectJobDescriptors.get(firstStalker.id).need_job = "logic@test_smart_camper_1_walk";
    smartTerrain.switchObjectToDesiredJob(firstStalker.id);

    expect(smartTerrain.objectByJobSection).toEqualLuaTables({
      "logic@test_smart_camper_1_walk": firstStalker.id,
      "logic@test_smart_sniper_1_walk": secondStalker.id,
    });

    smartTerrain.objectJobDescriptors.get(firstStalker.id).need_job = "logic@test_smart_sniper_1_walk";
    smartTerrain.switchObjectToDesiredJob(firstStalker.id);
    smartTerrain.updateJobs();

    expect(smartTerrain.objectByJobSection).toEqualLuaTables({
      "logic@test_smart_sniper_1_walk": firstStalker.id,
      "logic@test_smart_camper_1_walk": secondStalker.id,
    });
  });
});
