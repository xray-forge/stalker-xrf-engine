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
        _precondition_function: expect.any(Function),
        _precondition_params: {
          way_name: "test_smart_camper_1_walk",
        },
        job_id: 3,
        npc_id: 100006,
        priority: 45,
      },
      job_prior: 45,
      need_job: "nil",
      schemeType: 1,
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
        npc_id: 100008,
        priority: 40,
      },
      job_prior: 40,
      need_job: "nil",
      schemeType: 2,
    });
  });
});
