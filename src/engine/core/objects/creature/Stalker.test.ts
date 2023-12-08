import { beforeEach, describe, expect, it, jest } from "@jest/globals";

import { getManager, IRegistryOfflineState, registerSimulator, registry } from "@/engine/core/database";
import { EGameEvent, EventsManager } from "@/engine/core/managers/events";
import { SimulationManager } from "@/engine/core/managers/simulation";
import { Stalker } from "@/engine/core/objects/creature/Stalker";
import { SmartTerrain } from "@/engine/core/objects/smart_terrain";
import { Squad } from "@/engine/core/objects/squad";
import { MAX_U16 } from "@/engine/lib/constants/memory";
import { NIL } from "@/engine/lib/constants/words";
import { AnyObject } from "@/engine/lib/types";
import { MockSmartTerrain, MockSquad, resetRegistry } from "@/fixtures/engine";
import {
  EPacketDataType,
  MockGameObject,
  mockIniFile,
  MockNetProcessor,
  mockServerAlifeHumanStalker,
} from "@/fixtures/xray";

describe("Stalker server object", () => {
  beforeEach(() => {
    resetRegistry();
    registerSimulator();
  });

  it("should correctly check can switch online", () => {
    const stalker: Stalker = new Stalker("stalker");

    stalker.group_id = 1;
    expect(stalker.can_switch_online()).toBe(true);

    stalker.group_id = MAX_U16;
    expect(stalker.can_switch_online()).toBe(false);
  });

  it("should correctly check can switch offline", () => {
    const stalker: Stalker = new Stalker("stalker");

    expect(stalker.can_switch_offline()).toBe(false);

    stalker.group_id = 1;
    expect(stalker.can_switch_offline()).toBe(true);

    stalker.group_id = MAX_U16;
    expect(stalker.can_switch_offline()).toBe(false);
  });

  it("should correctly handle creation", () => {
    const stalker: Stalker = new Stalker("stalker");

    expect(stalker.isCorpseLootDropped).toBe(false);
    expect(registry.offlineObjects.length()).toBe(1);
    expect(registry.offlineObjects.get(stalker.id)).toEqualLuaTables({
      activeSection: null,
      levelVertexId: null,
    });
  });

  it("should correctly handle register", () => {
    const eventsManager: EventsManager = getManager(EventsManager);
    const stalker: Stalker = new Stalker("stalker");
    const fn = jest.fn();

    registry.offlineObjects = new LuaTable();

    jest.spyOn(stalker, "spawn_ini").mockImplementation(() => {
      return mockIniFile("test.ltx", {
        story_object: {
          story_id: "test_sid",
        },
      });
    });

    eventsManager.registerCallback(EGameEvent.STALKER_REGISTER, fn);

    stalker.on_register();

    expect(fn).toHaveBeenCalledTimes(1);
    expect(fn).toHaveBeenCalledWith(stalker);

    expect(registry.storyLink.sidById.get(stalker.id)).toBe("test_sid");
    expect(registry.storyLink.idBySid.get("test_sid")).toBe(stalker.id);
    expect(stalker.brain().can_choose_alife_tasks).toHaveBeenCalledWith(false);
    expect(registry.offlineObjects.get(stalker.id)).toEqualLuaTables({
      activeSection: null,
      levelVertexId: null,
    });
  });

  it("should correctly handle unregister", () => {
    const eventsManager: EventsManager = getManager(EventsManager);
    const stalker: Stalker = new Stalker("stalker");
    const fn = jest.fn();

    jest.spyOn(stalker, "spawn_ini").mockImplementation(() => {
      return mockIniFile("test.ltx", {
        story_object: {
          story_id: "test_stalker_sid",
        },
      });
    });
    eventsManager.registerCallback(EGameEvent.STALKER_UNREGISTER, fn);

    stalker.on_register();
    stalker.on_unregister();

    expect(fn).toHaveBeenCalledTimes(1);
    expect(fn).toHaveBeenCalledWith(stalker);
    expect(registry.offlineObjects.length()).toBe(0);
    expect(registry.storyLink.sidById.length()).toBe(0);
    expect(registry.storyLink.idBySid.length()).toBe(0);
  });

  it("should correctly handle register/unregister with smart terrain", () => {
    const stalker: Stalker = new Stalker("stalker");
    const smartTerrain: SmartTerrain = MockSmartTerrain.mock();

    jest.spyOn(stalker, "spawn_ini").mockImplementation(() => {
      return mockIniFile("test.ltx", {
        logic: {
          smart_terrain: smartTerrain.name(),
        },
      });
    });

    stalker.m_smart_terrain_id = smartTerrain.id;

    smartTerrain.register_npc = jest.fn();
    smartTerrain.unregister_npc = jest.fn();

    getManager(SimulationManager).registerSmartTerrain(smartTerrain);

    stalker.on_register();
    stalker.on_unregister();

    expect(smartTerrain.register_npc).toHaveBeenCalledWith(stalker);
    expect(smartTerrain.unregister_npc).toHaveBeenCalledWith(stalker);
  });

  it("should correctly handle spawn", () => {
    const eventsManager: EventsManager = getManager(EventsManager);
    const stalker: Stalker = new Stalker("stalker");
    const fn = jest.fn();

    eventsManager.registerCallback(EGameEvent.STALKER_SPAWN, fn);

    stalker.on_spawn();

    expect(fn).toHaveBeenCalledTimes(1);
    expect(fn).toHaveBeenCalledWith(stalker);
  });

  it("should correctly handle death callback", () => {
    const stalker: Stalker = new Stalker("stalker");
    const squad: Squad = MockSquad.mock();
    const smartTerrain: SmartTerrain = MockSmartTerrain.mock();

    jest.spyOn(smartTerrain, "onObjectDeath").mockImplementation(jest.fn());
    jest.spyOn(squad, "onMemberDeath").mockImplementation(jest.fn());

    stalker.m_smart_terrain_id = smartTerrain.id;
    stalker.group_id = squad.id;

    stalker.on_death(mockServerAlifeHumanStalker());

    expect(smartTerrain.onObjectDeath).toHaveBeenCalledTimes(1);
    expect(smartTerrain.onObjectDeath).toHaveBeenCalledWith(stalker);
    expect(squad.onMemberDeath).toHaveBeenCalledTimes(1);
    expect(squad.onMemberDeath).toHaveBeenCalledWith(stalker);
  });

  it("should correctly handle death callback if squad or smart does not exist", () => {
    const stalker: Stalker = new Stalker("stalker");
    const squad: Squad = MockSquad.mock();
    const smartTerrain: SmartTerrain = MockSmartTerrain.mock();

    jest.spyOn(smartTerrain, "onObjectDeath").mockImplementation(jest.fn());
    jest.spyOn(squad, "onMemberDeath").mockImplementation(jest.fn());

    stalker.m_smart_terrain_id = 65000;
    stalker.group_id = 65001;

    expect(() => stalker.on_death(mockServerAlifeHumanStalker())).toThrow("a");

    stalker.m_smart_terrain_id = smartTerrain.id;
    expect(() => stalker.on_death(mockServerAlifeHumanStalker())).toThrow("a");

    stalker.group_id = squad.id;
    expect(() => stalker.on_death(mockServerAlifeHumanStalker())).not.toThrow("a");
  });

  it.todo("should correctly handle registration events with smart terrains");

  it("should correctly save and load data with defaults", () => {
    const stalker: Stalker = new Stalker("stalker");
    const netProcessor: MockNetProcessor = new MockNetProcessor();

    stalker.STATE_Write(netProcessor.asMockNetPacket());

    expect(netProcessor.writeDataOrder).toEqual([
      EPacketDataType.STRING,
      EPacketDataType.STRING,
      EPacketDataType.STRING,
      EPacketDataType.BOOLEAN,
    ]);
    expect(netProcessor.dataList).toEqual(["Stalker", NIL, NIL, false]);

    const another: Stalker = new Stalker("stalker");

    another.STATE_Read(netProcessor.asMockNetPacket(), 0);

    expect(netProcessor.readDataOrder).toEqual(netProcessor.writeDataOrder);
    expect(netProcessor.dataList).toHaveLength(0);

    expect(another.isCorpseLootDropped).toBe(false);
    expect(registry.offlineObjects.get(another.id)).toEqualLuaTables({
      activeSection: null,
      levelVertexId: null,
    });
  });

  it("should correctly save and load data with custom data offline", () => {
    const stalker: Stalker = new Stalker("stalker");
    const netProcessor: MockNetProcessor = new MockNetProcessor();

    (stalker as AnyObject)["online"] = false;
    stalker.isCorpseLootDropped = true;

    const offlineState: IRegistryOfflineState = registry.offlineObjects.get(stalker.id);

    offlineState.activeSection = "test_section";
    offlineState.levelVertexId = 435;

    stalker.STATE_Write(netProcessor.asMockNetPacket());

    expect(netProcessor.writeDataOrder).toEqual([
      EPacketDataType.STRING,
      EPacketDataType.STRING,
      EPacketDataType.STRING,
      EPacketDataType.BOOLEAN,
    ]);
    expect(netProcessor.dataList).toEqual(["Stalker", "435", "test_section", true]);

    const another: Stalker = new Stalker("stalker");

    another.STATE_Read(netProcessor.asMockNetPacket(), 0);

    expect(netProcessor.readDataOrder).toEqual(netProcessor.writeDataOrder);
    expect(netProcessor.dataList).toHaveLength(0);

    expect(another.isCorpseLootDropped).toBe(true);
    expect(registry.offlineObjects.get(another.id)).toEqualLuaTables({
      activeSection: "test_section",
      levelVertexId: 435,
    });
  });

  it("should correctly save and load data with custom data online", () => {
    const stalker: Stalker = new Stalker("stalker");
    const netProcessor: MockNetProcessor = new MockNetProcessor();

    MockGameObject.mock({ idOverride: stalker.id, level_vertex_id: () => 311 });

    (stalker as AnyObject)["online"] = true;
    stalker.isCorpseLootDropped = true;

    const offlineState: IRegistryOfflineState = registry.offlineObjects.get(stalker.id);

    offlineState.activeSection = "test_section";

    stalker.STATE_Write(netProcessor.asMockNetPacket());

    expect(netProcessor.writeDataOrder).toEqual([
      EPacketDataType.STRING,
      EPacketDataType.STRING,
      EPacketDataType.STRING,
      EPacketDataType.BOOLEAN,
    ]);
    expect(netProcessor.dataList).toEqual(["Stalker", "311", "test_section", true]);

    const another: Stalker = new Stalker("stalker");

    another.STATE_Read(netProcessor.asMockNetPacket(), 0);

    expect(netProcessor.readDataOrder).toEqual(netProcessor.writeDataOrder);
    expect(netProcessor.dataList).toHaveLength(0);

    expect(another.isCorpseLootDropped).toBe(true);
    expect(registry.offlineObjects.get(another.id)).toEqualLuaTables({
      activeSection: "test_section",
      levelVertexId: 311,
    });
  });

  it("should correctly overwrite current vertex only if it is not null on load", () => {
    const stalker: Stalker = new Stalker("stalker");
    const netProcessor: MockNetProcessor = new MockNetProcessor();

    (stalker as AnyObject)["online"] = false;
    stalker.isCorpseLootDropped = true;

    const offlineState: IRegistryOfflineState = registry.offlineObjects.get(stalker.id);

    offlineState.activeSection = "test_section";

    stalker.STATE_Write(netProcessor.asMockNetPacket());

    expect(netProcessor.writeDataOrder).toEqual([
      EPacketDataType.STRING,
      EPacketDataType.STRING,
      EPacketDataType.STRING,
      EPacketDataType.BOOLEAN,
    ]);
    expect(netProcessor.dataList).toEqual(["Stalker", NIL, "test_section", true]);

    const another: Stalker = new Stalker("stalker");

    registry.offlineObjects.get(another.id).levelVertexId = 730;

    another.STATE_Read(netProcessor.asMockNetPacket(), 0);

    expect(netProcessor.readDataOrder).toEqual(netProcessor.writeDataOrder);
    expect(netProcessor.dataList).toHaveLength(0);

    expect(another.isCorpseLootDropped).toBe(true);
    expect(registry.offlineObjects.get(another.id)).toEqualLuaTables({
      activeSection: "test_section",
      levelVertexId: 730,
    });
  });
});
