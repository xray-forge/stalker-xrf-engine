import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import { CArtefact, clsid } from "xray16";

import { AnomalyZoneBinder } from "@/engine/core/binders/zones";
import { disposeManager, getManager, registry } from "@/engine/core/database";
import { EGameEvent, EventsManager } from "@/engine/core/managers/events";
import { surgeConfig } from "@/engine/core/managers/surge/SurgeConfig";
import { SurgeManager } from "@/engine/core/managers/surge/SurgeManager";
import { initializeSurgeCovers } from "@/engine/core/managers/surge/utils";
import { createVector } from "@/engine/core/utils/vector";
import { AnyObject, GameObject } from "@/engine/lib/types";
import { resetRegistry } from "@/fixtures/engine";
import { resetFunctionMock } from "@/fixtures/jest";
import { EPacketDataType, MockCArtefact, MockGameObject, MockNetProcessor } from "@/fixtures/xray";

jest.mock("@/engine/core/managers/surge/utils");

describe("SurgeManager", () => {
  beforeEach(() => {
    resetRegistry();

    resetFunctionMock(initializeSurgeCovers);
  });

  it("should correctly initialize and destroy", () => {
    const eventsManager: EventsManager = getManager(EventsManager);

    getManager(SurgeManager);

    expect(eventsManager.getSubscribersCount()).toBe(4);
    expect(eventsManager.getEventSubscribersCount(EGameEvent.DUMP_LUA_DATA)).toBe(1);
    expect(eventsManager.getEventSubscribersCount(EGameEvent.ACTOR_GO_ONLINE)).toBe(1);
    expect(eventsManager.getEventSubscribersCount(EGameEvent.ACTOR_UPDATE)).toBe(1);
    expect(eventsManager.getEventSubscribersCount(EGameEvent.ACTOR_ITEM_TAKE)).toBe(1);

    disposeManager(SurgeManager);

    expect(eventsManager.getSubscribersCount()).toBe(0);
  });

  it("should correctly handle saving/loading in general case", () => {
    const manager: SurgeManager = getManager(SurgeManager);
    const processor: MockNetProcessor = new MockNetProcessor();

    manager.nextScheduledSurgeDelay = 4500;

    manager.save(processor.asNetPacket());

    expect(manager.isAfterGameLoad).toBe(false);

    expect(processor.writeDataOrder).toEqual([
      EPacketDataType.BOOLEAN,
      EPacketDataType.BOOLEAN,
      EPacketDataType.U8,
      EPacketDataType.U8,
      EPacketDataType.U8,
      EPacketDataType.U8,
      EPacketDataType.U8,
      EPacketDataType.U8,
      EPacketDataType.U16,
      EPacketDataType.U32,
      EPacketDataType.U16,
      EPacketDataType.U16,
    ]);
    expect(processor.dataList).toEqual([true, false, 12, 6, 12, 9, 30, 0, 0, 4500, 0, 11]);

    disposeManager(SurgeManager);

    const newManager: SurgeManager = getManager(SurgeManager);

    newManager.load(processor.asNetReader());

    expect(newManager.isAfterGameLoad).toBe(true);
    expect(processor.readDataOrder).toEqual(processor.writeDataOrder);
    expect(processor.dataList).toHaveLength(0);
    expect(newManager).not.toBe(manager);

    expect(newManager.nextScheduledSurgeDelay).toBe(4500);
  });

  it("should correctly handle saving/loading when surge started", () => {
    surgeConfig.IS_STARTED = true;

    const manager: SurgeManager = getManager(SurgeManager);
    const processor: MockNetProcessor = new MockNetProcessor();

    manager.nextScheduledSurgeDelay = 530;

    manager.isTaskGiven = true;
    manager.isEffectorSet = true;
    manager.isSecondMessageGiven = true;
    manager.isUiDisabled = true;
    manager.isBlowoutSoundStarted = true;
    manager.surgeMessage = "test_message";
    manager.surgeTaskSection = "test_task";

    manager.respawnArtefactsForLevel.set("jupiter", true);
    manager.respawnArtefactsForLevel.set("new_level", true);

    manager.save(processor.asNetPacket());

    expect(manager.isAfterGameLoad).toBe(false);

    expect(processor.writeDataOrder).toEqual([
      EPacketDataType.BOOLEAN,
      EPacketDataType.BOOLEAN,
      EPacketDataType.U8,
      EPacketDataType.U8,
      EPacketDataType.U8,
      EPacketDataType.U8,
      EPacketDataType.U8,
      EPacketDataType.U8,
      EPacketDataType.U16,
      EPacketDataType.U8,
      EPacketDataType.U8,
      EPacketDataType.U8,
      EPacketDataType.U8,
      EPacketDataType.U8,
      EPacketDataType.U8,
      EPacketDataType.U16,
      EPacketDataType.BOOLEAN,
      EPacketDataType.BOOLEAN,
      EPacketDataType.BOOLEAN,
      EPacketDataType.BOOLEAN,
      EPacketDataType.BOOLEAN,
      EPacketDataType.STRING,
      EPacketDataType.STRING,
      EPacketDataType.U32,
      EPacketDataType.U16,
      EPacketDataType.STRING,
      EPacketDataType.STRING,
      EPacketDataType.U16,
    ]);
    expect(processor.dataList).toEqual([
      true,
      true,
      12,
      6,
      12,
      9,
      30,
      0,
      0,
      12,
      6,
      12,
      9,
      30,
      0,
      0,
      true,
      true,
      true,
      true,
      true,
      "test_message",
      "test_task",
      530,
      2,
      "jupiter",
      "new_level",
      27,
    ]);

    disposeManager(SurgeManager);

    const newManager: SurgeManager = getManager(SurgeManager);

    newManager.load(processor.asNetReader());

    expect(processor.readDataOrder).toEqual(processor.writeDataOrder);
    expect(processor.dataList).toHaveLength(0);
    expect(newManager).not.toBe(manager);

    expect(newManager.isAfterGameLoad).toBe(true);
    expect(newManager.nextScheduledSurgeDelay).toBe(530);
    expect(newManager.isTaskGiven).toBe(true);
    expect(newManager.isEffectorSet).toBe(true);
    expect(newManager.isSecondMessageGiven).toBe(true);
    expect(newManager.isUiDisabled).toBe(true);
    expect(newManager.isBlowoutSoundStarted).toBe(true);
    expect(newManager.surgeMessage).toBe("test_message");
    expect(newManager.surgeTaskSection).toBe("test_task");
    expect(newManager.respawnArtefactsForLevel).toEqualLuaTables({
      jupiter: true,
      new_level: true,
    });

    surgeConfig.IS_STARTED = false;
  });

  it.todo("should correctly get nearest available cover");

  it.todo("should correctly set skip resurrect message");

  it.todo("should correctly set surge task");

  it.todo("should correctly set surge message");

  it.todo("should correctly check if is killing all now");

  it.todo("should correctly request surge start");

  it.todo("should correctly request surge stop");

  it.todo("should correctly start");

  it.todo("should correctly skip surges");

  it.todo("should correctly end surges");

  it.todo("should correctly handle update event");

  it.todo("should correctly replace anomalies and respawn artefacts");

  it("should correctly handle actor going online", () => {
    const manager: SurgeManager = getManager(SurgeManager);

    expect(initializeSurgeCovers).toHaveBeenCalledTimes(0);

    manager.onActorGoOnline();

    expect(initializeSurgeCovers).toHaveBeenCalledTimes(1);
  });

  it("should correctly handle actor taking generic items", () => {
    const object: GameObject = MockGameObject.mock();
    const manager: SurgeManager = getManager(SurgeManager);

    manager.onActorItemTake(object);

    expect(object.get_artefact).toHaveBeenCalledTimes(0);
  });

  it("should correctly handle actor taking artefacts from anomaly zones", () => {
    const object: GameObject = MockGameObject.mock();
    const manager: SurgeManager = getManager(SurgeManager);
    const artefact: CArtefact = MockCArtefact.mock();
    const zone: AnomalyZoneBinder = new AnomalyZoneBinder(MockGameObject.mock());

    jest.spyOn(object, "clsid").mockImplementation(() => clsid.artefact_s);
    jest.spyOn(object, "get_artefact").mockImplementation(() => artefact);
    jest.spyOn(zone, "onArtefactTaken").mockImplementation(jest.fn());

    registry.artefacts.parentZones.set(object.id(), zone);

    manager.onActorItemTake(object);

    expect(zone.onArtefactTaken).toHaveBeenCalledTimes(1);
    expect(zone.onArtefactTaken).toHaveBeenCalledWith(object.id());
    expect(object.get_artefact).toHaveBeenCalledTimes(1);
    expect(artefact.FollowByPath).toHaveBeenCalledTimes(1);
    expect(artefact.FollowByPath).toHaveBeenCalledWith("NULL", 0, createVector(500, 500, 500));
  });

  it("should correctly handle actor taking artefacts from world", () => {
    const object: GameObject = MockGameObject.mock();
    const manager: SurgeManager = getManager(SurgeManager);
    const artefact: CArtefact = MockCArtefact.mock();

    jest.spyOn(object, "clsid").mockImplementation(() => clsid.artefact_s);
    jest.spyOn(object, "get_artefact").mockImplementation(() => artefact);

    registry.artefacts.ways.set(object.id(), "path_example");

    expect(registry.artefacts.ways.has(object.id())).toBe(true);

    manager.onActorItemTake(object);

    expect(object.get_artefact).toHaveBeenCalledTimes(1);
    expect(artefact.FollowByPath).toHaveBeenCalledTimes(1);
    expect(artefact.FollowByPath).toHaveBeenCalledWith("NULL", 0, createVector(500, 500, 500));
    expect(registry.artefacts.ways.has(object.id())).toBe(false);
  });

  it("should correctly handle debug dump event", () => {
    const manager: SurgeManager = getManager(SurgeManager);
    const data: AnyObject = {};

    EventsManager.emitEvent(EGameEvent.DUMP_LUA_DATA, data);

    expect(data).toEqual({ SurgeManager: expect.any(Object) });
    expect(manager.onDebugDump({})).toEqual({ SurgeManager: expect.any(Object) });
  });
});
