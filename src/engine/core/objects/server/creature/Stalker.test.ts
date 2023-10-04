import { beforeEach, describe, expect, it, jest } from "@jest/globals";

import { IStoredOfflineObject, registry } from "@/engine/core/database";
import { EGameEvent, EventsManager } from "@/engine/core/managers/events";
import { Stalker } from "@/engine/core/objects/server/creature/Stalker";
import { MAX_U16 } from "@/engine/lib/constants/memory";
import { NIL } from "@/engine/lib/constants/words";
import { AnyObject } from "@/engine/lib/types";
import { resetManagers, resetOfflineObjects } from "@/fixtures/engine";
import { EPacketDataType, mockClientGameObject, MockNetProcessor } from "@/fixtures/xray";

describe("Stalker server object", () => {
  beforeEach(() => {
    resetManagers();
    resetOfflineObjects();
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

    expect(stalker.can_switch_offline()).toBe(true);

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
    const eventsManager: EventsManager = EventsManager.getInstance();
    const stalker: Stalker = new Stalker("stalker");
    const fn = jest.fn();

    eventsManager.registerCallback(EGameEvent.STALKER_REGISTER, fn);

    stalker.on_register();

    expect(fn).toHaveBeenCalledTimes(1);
    expect(fn).toHaveBeenCalledWith(stalker);
  });

  it("should correctly handle unregister", () => {
    const eventsManager: EventsManager = EventsManager.getInstance();
    const stalker: Stalker = new Stalker("stalker");
    const fn = jest.fn();

    eventsManager.registerCallback(EGameEvent.STALKER_UNREGISTER, fn);

    stalker.on_unregister();

    expect(fn).toHaveBeenCalledTimes(1);
    expect(fn).toHaveBeenCalledWith(stalker);
  });

  it("should correctly handle spawn", () => {
    const eventsManager: EventsManager = EventsManager.getInstance();
    const stalker: Stalker = new Stalker("stalker");
    const fn = jest.fn();

    eventsManager.registerCallback(EGameEvent.STALKER_SPAWN, fn);

    stalker.on_spawn();

    expect(fn).toHaveBeenCalledTimes(1);
    expect(fn).toHaveBeenCalledWith(stalker);
  });

  it.todo("should correctly handle death callback");

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
    expect(netProcessor.dataList).toEqual(["cse_alife_object", NIL, NIL, false]);

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

    const offlineState: IStoredOfflineObject = registry.offlineObjects.get(stalker.id);

    offlineState.activeSection = "test_section";
    offlineState.levelVertexId = 435;

    stalker.STATE_Write(netProcessor.asMockNetPacket());

    expect(netProcessor.writeDataOrder).toEqual([
      EPacketDataType.STRING,
      EPacketDataType.STRING,
      EPacketDataType.STRING,
      EPacketDataType.BOOLEAN,
    ]);
    expect(netProcessor.dataList).toEqual(["cse_alife_object", "435", "test_section", true]);

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

    mockClientGameObject({ idOverride: stalker.id, level_vertex_id: () => 311 });

    (stalker as AnyObject)["online"] = true;
    stalker.isCorpseLootDropped = true;

    const offlineState: IStoredOfflineObject = registry.offlineObjects.get(stalker.id);

    offlineState.activeSection = "test_section";

    stalker.STATE_Write(netProcessor.asMockNetPacket());

    expect(netProcessor.writeDataOrder).toEqual([
      EPacketDataType.STRING,
      EPacketDataType.STRING,
      EPacketDataType.STRING,
      EPacketDataType.BOOLEAN,
    ]);
    expect(netProcessor.dataList).toEqual(["cse_alife_object", "311", "test_section", true]);

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

    const offlineState: IStoredOfflineObject = registry.offlineObjects.get(stalker.id);

    offlineState.activeSection = "test_section";

    stalker.STATE_Write(netProcessor.asMockNetPacket());

    expect(netProcessor.writeDataOrder).toEqual([
      EPacketDataType.STRING,
      EPacketDataType.STRING,
      EPacketDataType.STRING,
      EPacketDataType.BOOLEAN,
    ]);
    expect(netProcessor.dataList).toEqual(["cse_alife_object", NIL, "test_section", true]);

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
