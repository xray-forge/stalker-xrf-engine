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
import { AnyObject, GameObject, ServerHumanObject } from "@/engine/lib/types";
import { mockRegisteredActor, resetRegistry } from "@/fixtures/engine";
import {
  EPacketDataType,
  MockAlifeHumanStalker,
  MockGameObject,
  mockNetPacket,
  mockNetProcessor,
  MockNetProcessor,
} from "@/fixtures/xray";

describe("ReleaseBodyManager class", () => {
  beforeEach(() => {
    resetRegistry();
    registerSimulator();

    deathConfig.RELEASE_OBJECTS_REGISTRY = new LuaTable();
    deathConfig.MAX_BODY_COUNT = 5;

    jest.spyOn(Date, "now").mockImplementation(() => 60_000);
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
    const netProcessor: MockNetProcessor = new MockNetProcessor();

    deathConfig.RELEASE_OBJECTS_REGISTRY = $fromArray<IReleaseDescriptor>([
      { id: 10, diedAt: 4_000 },
      { id: 11, diedAt: 5_000 },
      { id: 12, diedAt: 6_000 },
      { id: 13, diedAt: null },
    ]);

    manager.save(mockNetPacket(netProcessor));

    expect(netProcessor.writeDataOrder).toEqual([
      EPacketDataType.U16,
      EPacketDataType.U16,
      EPacketDataType.U16,
      EPacketDataType.U16,
      EPacketDataType.U16,
      EPacketDataType.U16,
      EPacketDataType.U16,
    ]);
    expect(netProcessor.dataList).toEqual([4, 10, 11, 12, 13, 5120, 6]);

    disposeManager(ReleaseBodyManager);

    deathConfig.RELEASE_OBJECTS_REGISTRY = new LuaTable();

    getManager(ReleaseBodyManager).load(mockNetProcessor(netProcessor));

    expect(netProcessor.readDataOrder).toEqual(netProcessor.writeDataOrder);
    expect(netProcessor.dataList).toHaveLength(0);

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
    const netProcessor: MockNetProcessor = new MockNetProcessor();

    deathConfig.RELEASE_OBJECTS_REGISTRY = $fromArray<IReleaseDescriptor>([
      { id: 10, diedAt: 4_000 },
      { id: 11, diedAt: 5_000 },
    ]);

    manager.save(mockNetPacket(netProcessor));

    expect(netProcessor.writeDataOrder).toEqual([
      EPacketDataType.U16,
      EPacketDataType.U16,
      EPacketDataType.U16,
      EPacketDataType.U16,
      EPacketDataType.U16,
    ]);
    expect(netProcessor.dataList).toEqual([2, 10, 11, 5120, 4]);

    disposeManager(ReleaseBodyManager);

    (registry.actorServer as AnyObject).m_game_vertex_id = 1000;

    deathConfig.RELEASE_OBJECTS_REGISTRY = new LuaTable();

    getManager(ReleaseBodyManager).load(mockNetProcessor(netProcessor));

    expect(netProcessor.readDataOrder).toEqual(netProcessor.writeDataOrder);
    expect(netProcessor.dataList).toHaveLength(0);

    expect(deathConfig.RELEASE_OBJECTS_REGISTRY).toEqualLuaArrays([]);
  });
});
