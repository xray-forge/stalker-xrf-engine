import { beforeEach, describe, expect, it, jest } from "@jest/globals";

import { SmartTerrainBinder } from "@/engine/core/binders/smart_terrain/index";
import { registerSimulator, registry } from "@/engine/core/database";
import { EGameEvent, EventsManager } from "@/engine/core/managers/events";
import { GlobalSoundManager } from "@/engine/core/managers/sounds";
import { hasInfoPortion } from "@/engine/core/utils/info_portion";
import { ServerObject } from "@/engine/lib/types";
import { mockRegisteredActor, resetRegistry } from "@/fixtures/engine";
import {
  EPacketDataType,
  MockGameObject,
  mockNetPacket,
  MockNetProcessor,
  mockNetReader,
  mockServerAlifeObject,
} from "@/fixtures/xray";

describe("SmartTerrainBinder class", () => {
  beforeEach(() => {
    resetRegistry();
    registerSimulator();
  });

  it("should correctly initialize", () => {
    const binder: SmartTerrainBinder = new SmartTerrainBinder(MockGameObject.mock());

    expect(binder.isVisited).toBe(false);
    expect(binder.serverObject).toBeUndefined();
  });

  it("should be save relevant", () => {
    const binder: SmartTerrainBinder = new SmartTerrainBinder(MockGameObject.mock());

    expect(binder.net_save_relevant()).toBe(true);
  });

  it("should correctly handle going online/offline", () => {
    const binder: SmartTerrainBinder = new SmartTerrainBinder(MockGameObject.mock());
    const serverObject: ServerObject = mockServerAlifeObject({ id: binder.object.id() });
    const globalSoundManager: GlobalSoundManager = getManager(GlobalSoundManager);

    jest.spyOn(globalSoundManager, "stopSoundByObjectId").mockImplementation(jest.fn());

    binder.net_spawn(serverObject);

    expect(binder.serverObject).toBe(serverObject);
    expect(registry.smartTerrains.length()).toBe(1);
    expect(registry.zones.length()).toBe(1);
    expect(registry.objects.length()).toBe(1);

    binder.net_destroy();

    expect(registry.smartTerrains.length()).toBe(0);
    expect(registry.zones.length()).toBe(0);
    expect(registry.objects.length()).toBe(0);

    expect(globalSoundManager.stopSoundByObjectId).toHaveBeenCalledTimes(1);
    expect(globalSoundManager.stopSoundByObjectId).toHaveBeenCalledWith(serverObject.id);
  });

  it("should correctly handle update event", () => {
    mockRegisteredActor();

    const binder: SmartTerrainBinder = new SmartTerrainBinder(MockGameObject.mock());
    const serverObject: ServerObject = mockServerAlifeObject({ id: binder.object.id() });
    const onVisit = jest.fn();

    getManager(EventsManager).registerCallback(EGameEvent.SMART_TERRAIN_VISITED, onVisit);

    binder.net_spawn(serverObject);
    binder.update(255);

    expect(serverObject.update).toHaveBeenCalledTimes(1);
    expect(binder.isVisited).toBe(false);
    expect(hasInfoPortion(binder.object.name() + "_visited")).toBe(false);
    expect(onVisit).toHaveBeenCalledTimes(0);

    jest.spyOn(binder.object, "inside").mockImplementation(() => true);

    binder.update(312);

    expect(binder.isVisited).toBe(true);
    expect(hasInfoPortion(binder.object.name() + "_visited")).toBe(true);
    expect(onVisit).toHaveBeenCalledTimes(1);
    expect(onVisit).toHaveBeenCalledWith(binder.object, binder);

    binder.update(312);
    expect(onVisit).toHaveBeenCalledTimes(1);
  });

  it("should correctly handle save/load", () => {
    const netProcessor: MockNetProcessor = new MockNetProcessor();
    const binder: SmartTerrainBinder = new SmartTerrainBinder(MockGameObject.mock());

    binder.isVisited = true;

    binder.save(mockNetPacket(netProcessor));

    expect(netProcessor.writeDataOrder).toEqual([EPacketDataType.STRING, EPacketDataType.BOOLEAN, EPacketDataType.U16]);
    expect(netProcessor.dataList).toEqual(["save_from_SmartTerrainBinder", true, 2]);

    const newBinder: SmartTerrainBinder = new SmartTerrainBinder(MockGameObject.mock());

    newBinder.load(mockNetReader(netProcessor));

    expect(newBinder.isVisited).toBe(true);
    expect(netProcessor.readDataOrder).toEqual(netProcessor.writeDataOrder);
    expect(netProcessor.dataList).toHaveLength(0);
  });
});
