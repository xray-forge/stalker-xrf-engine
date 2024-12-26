import { beforeEach, describe, expect, it, jest } from "@jest/globals";

import {
  disposeManager,
  getManager,
  registerObject,
  registerSimulator,
  registerStoryLink,
  registry,
} from "@/engine/core/database";
import { IReleaseDescriptor } from "@/engine/core/managers/death/death_types";
import { deathConfig } from "@/engine/core/managers/death/DeathConfig";
import { ReleaseBodyManager } from "@/engine/core/managers/death/ReleaseBodyManager";
import { EGameEvent, EventsManager } from "@/engine/core/managers/events";
import { AnyObject, GameObject, ServerHumanObject } from "@/engine/lib/types";
import { mockRegisteredActor, resetRegistry } from "@/fixtures/engine";
import { EPacketDataType, MockAlifeHumanStalker, MockGameObject, MockNetProcessor } from "@/fixtures/xray";

describe("ReleaseBodyManager", () => {
  beforeEach(() => {
    resetRegistry();
    registerSimulator();

    deathConfig.RELEASE_OBJECTS_REGISTRY = new LuaTable();
    deathConfig.MAX_BODY_COUNT = 5;

    jest.spyOn(Date, "now").mockImplementation(() => 60_000);
  });

  it("should correctly initialize and destroy", () => {
    const eventsManager: EventsManager = getManager(EventsManager);

    expect(eventsManager.getSubscribersCount()).toBe(0);

    getManager(ReleaseBodyManager);

    expect(eventsManager.getSubscribersCount()).toBe(2);
    expect(eventsManager.getEventSubscribersCount(EGameEvent.DUMP_LUA_DATA)).toBe(1);
    expect(eventsManager.getEventSubscribersCount(EGameEvent.STALKER_DEATH)).toBe(1);

    disposeManager(ReleaseBodyManager);

    expect(eventsManager.getSubscribersCount()).toBe(0);
  });

  it("should correctly add dead bodies", () => {
    const manager: ReleaseBodyManager = getManager(ReleaseBodyManager);

    jest.spyOn(manager, "releaseCorpses").mockImplementation(jest.fn());

    for (let it = 0; it < deathConfig.MAX_BODY_COUNT; it++) {
      const object: GameObject = MockGameObject.mock();

      registerObject(object);

      manager.registerCorpse(object);
    }

    expect(deathConfig.RELEASE_OBJECTS_REGISTRY.length()).toBe(5);
    expect(manager.releaseCorpses).toHaveBeenCalledTimes(0);

    const objectOverLimit: GameObject = MockGameObject.mock();

    registerObject(objectOverLimit);

    manager.registerCorpse(objectOverLimit);

    expect(deathConfig.RELEASE_OBJECTS_REGISTRY.length()).toBe(6);
    expect(manager.releaseCorpses).toHaveBeenCalledTimes(1);

    const objectWithStoryId: GameObject = MockGameObject.mock();

    registerObject(objectOverLimit);
    registerStoryLink(objectWithStoryId.id(), "test_sid");

    manager.registerCorpse(objectWithStoryId);

    expect(deathConfig.RELEASE_OBJECTS_REGISTRY.length()).toBe(6);
    expect(manager.releaseCorpses).toHaveBeenCalledTimes(1);
  });

  it("should correctly try releasing", () => {
    mockRegisteredActor();

    const manager: ReleaseBodyManager = getManager(ReleaseBodyManager);
    const first: ServerHumanObject = MockAlifeHumanStalker.mock();
    const second: ServerHumanObject = MockAlifeHumanStalker.mock();

    jest.spyOn(first, "alive").mockImplementation(() => false);
    jest.spyOn(second, "alive").mockImplementation(() => false);

    jest.spyOn(registry.actor.position(), "distance_to_sqr").mockImplementation(() => deathConfig.MIN_DISTANCE_SQR + 1);

    deathConfig.RELEASE_OBJECTS_REGISTRY = $fromArray<IReleaseDescriptor>([
      { id: 10, diedAt: 40_000 },
      { id: 11, diedAt: 40_000 },
      { id: 12, diedAt: 40_000 },
      { id: 13, diedAt: 40_000 },
      { id: 14, diedAt: 40_000 },
      { id: 15, diedAt: 40_000 },
      { id: first.id, diedAt: 0 },
      { id: second.id, diedAt: null },
    ]);

    manager.releaseCorpses();

    expect(registry.simulator.release).toHaveBeenCalledTimes(2);
    expect(registry.simulator.release).toHaveBeenCalledWith(first, true);
    expect(registry.simulator.release).toHaveBeenCalledWith(second, true);
  });

  it("should correctly save/load", () => {
    mockRegisteredActor();

    const manager: ReleaseBodyManager = getManager(ReleaseBodyManager);
    const processor: MockNetProcessor = new MockNetProcessor();

    deathConfig.RELEASE_OBJECTS_REGISTRY = $fromArray<IReleaseDescriptor>([
      { id: 10, diedAt: 4_000 },
      { id: 11, diedAt: 5_000 },
      { id: 12, diedAt: 6_000 },
      { id: 13, diedAt: null },
    ]);

    manager.save(processor.asNetPacket());

    expect(processor.writeDataOrder).toEqual([
      EPacketDataType.U16,
      EPacketDataType.U16,
      EPacketDataType.U16,
      EPacketDataType.U16,
      EPacketDataType.U16,
      EPacketDataType.U16,
      EPacketDataType.U16,
    ]);
    expect(processor.dataList).toEqual([4, 10, 11, 12, 13, 5, 6]);

    disposeManager(ReleaseBodyManager);

    deathConfig.RELEASE_OBJECTS_REGISTRY = new LuaTable();

    getManager(ReleaseBodyManager).load(processor.asNetReader());

    expect(processor.readDataOrder).toEqual(processor.writeDataOrder);
    expect(processor.dataList).toHaveLength(0);

    expect(deathConfig.RELEASE_OBJECTS_REGISTRY).toEqualLuaArrays([
      { id: 10, diedAt: null },
      { id: 11, diedAt: null },
      { id: 12, diedAt: null },
      { id: 13, diedAt: null },
    ]);
  });

  it("should correctly save/load when level is changed", () => {
    mockRegisteredActor();

    const manager: ReleaseBodyManager = getManager(ReleaseBodyManager);
    const processor: MockNetProcessor = new MockNetProcessor();

    deathConfig.RELEASE_OBJECTS_REGISTRY = $fromArray<IReleaseDescriptor>([
      { id: 10, diedAt: 4_000 },
      { id: 11, diedAt: 5_000 },
    ]);

    manager.save(processor.asNetPacket());

    expect(processor.writeDataOrder).toEqual([
      EPacketDataType.U16,
      EPacketDataType.U16,
      EPacketDataType.U16,
      EPacketDataType.U16,
      EPacketDataType.U16,
    ]);
    expect(processor.dataList).toEqual([2, 10, 11, 5, 4]);

    disposeManager(ReleaseBodyManager);

    (registry.actorServer as AnyObject).m_game_vertex_id = 1000;

    deathConfig.RELEASE_OBJECTS_REGISTRY = new LuaTable();

    getManager(ReleaseBodyManager).load(processor.asNetReader());

    expect(processor.readDataOrder).toEqual(processor.writeDataOrder);
    expect(processor.dataList).toHaveLength(0);

    expect(deathConfig.RELEASE_OBJECTS_REGISTRY).toEqualLuaArrays([]);
  });

  it("should correctly handle object death", () => {
    const manager: ReleaseBodyManager = getManager(ReleaseBodyManager);
    const object: GameObject = MockGameObject.mock();
    const killer: GameObject = MockGameObject.mock();

    jest.spyOn(manager, "registerCorpse").mockImplementation(jest.fn());

    EventsManager.emitEvent(EGameEvent.STALKER_DEATH, object, killer);

    expect(manager.registerCorpse).toHaveBeenCalledTimes(1);
    expect(manager.registerCorpse).toHaveBeenCalledWith(object);
  });

  it("should correctly dump event", () => {
    const manager: ReleaseBodyManager = getManager(ReleaseBodyManager);
    const data: AnyObject = {};

    EventsManager.emitEvent(EGameEvent.DUMP_LUA_DATA, data);

    expect(data).toEqual({ ReleaseBodyManager: expect.any(Object) });
    expect(manager.onDebugDump({})).toEqual({ ReleaseBodyManager: expect.any(Object) });
  });
});
