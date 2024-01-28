import { beforeEach, describe, expect, it, jest } from "@jest/globals";

import {
  getManager,
  getServerObjectByStoryId,
  IRegistryOfflineState,
  registerSimulator,
  registry,
} from "@/engine/core/database";
import { EGameEvent, EventsManager } from "@/engine/core/managers/events";
import { Monster } from "@/engine/core/objects/creature/Monster";
import { SmartTerrain } from "@/engine/core/objects/smart_terrain";
import { Squad } from "@/engine/core/objects/squad";
import { MAX_U16 } from "@/engine/lib/constants/memory";
import { GameObject } from "@/engine/lib/types";
import { MockSmartTerrain, MockSquad, resetRegistry } from "@/fixtures/engine";
import { EPacketDataType, MockAlifeObject, MockGameObject, MockIniFile, MockNetProcessor } from "@/fixtures/xray";

describe("Monster server object", () => {
  beforeEach(() => {
    resetRegistry();
    registerSimulator();
  });

  it("should check if can switch offline", () => {
    expect(new Monster("monster").can_switch_offline()).toBe(true);

    const monster: Monster = new Monster("monster");

    monster.group_id = MAX_U16;

    expect(monster.can_switch_offline()).toBe(true);

    MockAlifeObject.toMock(monster).canSwitchOffline = false;

    expect(monster.can_switch_offline()).toBe(false);
  });

  it("should check if can switch online", () => {
    expect(new Monster("monster").can_switch_online()).toBe(true);

    const monster: Monster = new Monster("monster");

    monster.group_id = MAX_U16;

    expect(monster.can_switch_online()).toBe(true);

    MockAlifeObject.toMock(monster).canSwitchOnline = false;

    expect(monster.can_switch_online()).toBe(false);
  });

  it("should correctly emit lifecycle events", () => {
    const eventsManager: EventsManager = getManager(EventsManager);
    const monster: Monster = new Monster("monster");

    const onMonsterRegister = jest.fn();
    const onMonsterUnregister = jest.fn();

    eventsManager.registerCallback(EGameEvent.MONSTER_REGISTER, onMonsterRegister);
    eventsManager.registerCallback(EGameEvent.MONSTER_UNREGISTER, onMonsterUnregister);

    monster.on_register();

    expect(onMonsterRegister).toHaveBeenCalledWith(monster);
    expect(onMonsterUnregister).not.toHaveBeenCalled();

    monster.on_unregister();

    expect(onMonsterRegister).toHaveBeenCalledWith(monster);
    expect(onMonsterUnregister).toHaveBeenCalledWith(monster);
  });

  it("should correctly handle registration events with linked smart terrain", () => {
    const monster: Monster = new Monster("monster");
    const terrain: SmartTerrain = MockSmartTerrain.mock("test-smart");

    jest.spyOn(monster, "spawn_ini").mockImplementation(() => {
      return MockIniFile.mock("test.ltx", {
        story_object: {
          story_id: "test-sid",
        },
        logic: {
          smart_terrain: terrain.name(),
        },
      });
    });

    jest.spyOn(terrain, "register_npc").mockImplementation(jest.fn(() => (monster.m_smart_terrain_id = terrain.id)));
    jest.spyOn(terrain, "unregister_npc").mockImplementation(jest.fn());

    terrain.on_before_register();

    monster.on_register();

    expect(registry.offlineObjects.length()).toBe(1);
    expect(registry.storyLink.sidById.length()).toBe(1);
    expect(registry.storyLink.idBySid.length()).toBe(1);

    expect(monster.brain().can_choose_alife_tasks).toHaveBeenCalledWith(false);
    expect(terrain.register_npc).toHaveBeenCalledWith(monster);

    expect(getServerObjectByStoryId("test-sid")).toBe(monster);

    monster.on_unregister();

    expect(registry.offlineObjects.length()).toBe(0);
    expect(registry.storyLink.sidById.length()).toBe(0);
    expect(registry.storyLink.idBySid.length()).toBe(0);

    expect(terrain.unregister_npc).toHaveBeenCalledWith(monster);
  });

  it("should correctly handle registration events without smart terrain and story ID", () => {
    const monster: Monster = new Monster("monster");

    monster.on_register();

    expect(monster.brain().can_choose_alife_tasks).toHaveBeenCalledWith(false);

    expect(registry.offlineObjects.length()).toBe(1);
    expect(registry.storyLink.sidById.length()).toBe(0);
    expect(registry.storyLink.idBySid.length()).toBe(0);

    monster.on_unregister();

    expect(registry.offlineObjects.length()).toBe(0);
  });

  it("should correctly handle death callback", () => {
    const eventsManager: EventsManager = getManager(EventsManager);
    const monster: Monster = new Monster("monster");
    const killer: Monster = new Monster("killer");
    const terrain: SmartTerrain = MockSmartTerrain.mock("test-smart");
    const squad: Squad = MockSquad.mock();
    const onMonsterDeath = jest.fn();

    monster.m_smart_terrain_id = terrain.id;
    monster.group_id = squad.id;

    jest.spyOn(squad, "onObjectDeath").mockImplementation(jest.fn());
    jest.spyOn(terrain, "onObjectDeath").mockImplementation(jest.fn());

    eventsManager.registerCallback(EGameEvent.MONSTER_DEATH_ALIFE, onMonsterDeath);

    monster.on_death(killer);

    expect(onMonsterDeath).toHaveBeenCalledTimes(1);
    expect(onMonsterDeath).toHaveBeenCalledWith(monster, killer);
    expect(squad.onObjectDeath).toHaveBeenCalledWith(monster);
    expect(terrain.onObjectDeath).toHaveBeenCalledWith(monster);
  });

  it("should correctly save and load data with offline state", () => {
    const monster: Monster = new Monster("monster");
    const netProcessor: MockNetProcessor = new MockNetProcessor();

    (monster as unknown as MockAlifeObject).online = false;

    monster.on_register();

    const state: IRegistryOfflineState = registry.offlineObjects.get(monster.id);

    state.levelVertexId = 450;
    state.activeSection = "scheme@test";

    monster.STATE_Write(netProcessor.asNetPacket());

    expect(netProcessor.writeDataOrder).toEqual([
      EPacketDataType.STRING,
      EPacketDataType.STRING,
      EPacketDataType.STRING,
    ]);
    expect(netProcessor.dataList).toEqual(["state_write_from_Monster", "450", "scheme@test"]);

    monster.on_unregister();

    const another: Monster = new Monster("monster");

    another.STATE_Read(netProcessor.asNetPacket(), 512);

    const anotherState: IRegistryOfflineState = registry.offlineObjects.get(another.id);

    expect(netProcessor.readDataOrder).toEqual(netProcessor.writeDataOrder);
    expect(netProcessor.dataList).toHaveLength(0);
    expect(anotherState.activeSection).toBe("scheme@test");
    expect(anotherState.levelVertexId).toBe(450);
  });

  it("should correctly save and load data with defaults", () => {
    const monster: Monster = new Monster("monster");
    const object: GameObject = MockGameObject.mock({ id: monster.id });
    const netProcessor: MockNetProcessor = new MockNetProcessor();

    (Monster as unknown as MockAlifeObject).online = true;
    monster.on_register();

    monster.STATE_Write(netProcessor.asNetPacket());

    expect(netProcessor.writeDataOrder).toEqual([
      EPacketDataType.STRING,
      EPacketDataType.STRING,
      EPacketDataType.STRING,
    ]);
    expect(netProcessor.dataList).toEqual(["state_write_from_Monster", String(object.level_vertex_id()), "nil"]);

    monster.on_unregister();

    const another: Monster = new Monster("monster");

    another.STATE_Read(netProcessor.asNetPacket(), 512);

    const anotherState: IRegistryOfflineState = registry.offlineObjects.get(another.id);

    expect(netProcessor.readDataOrder).toEqual(netProcessor.writeDataOrder);
    expect(netProcessor.dataList).toHaveLength(0);
    expect(anotherState.activeSection).toBeNull();
    expect(anotherState.levelVertexId).toBe(object.level_vertex_id());
  });
});
