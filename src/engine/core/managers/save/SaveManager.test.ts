import { beforeEach, describe, expect, it, jest } from "@jest/globals";

import {
  disposeManager,
  getManager,
  initializeManager,
  isManagerInitialized,
  registerActor,
  registry,
} from "@/engine/core/database";
import { TAbstractCoreManagerConstructor } from "@/engine/core/managers/abstract";
import { ActorInputManager } from "@/engine/core/managers/actor";
import { ReleaseBodyManager } from "@/engine/core/managers/death/ReleaseBodyManager";
import { EGameEvent, EventsManager } from "@/engine/core/managers/events";
import { PsyAntennaManager } from "@/engine/core/managers/psy/PsyAntennaManager";
import { SaveManager } from "@/engine/core/managers/save";
import { GameSettingsManager } from "@/engine/core/managers/settings/GameSettingsManager";
import { SimulationManager } from "@/engine/core/managers/simulation/SimulationManager";
import { SoundManager } from "@/engine/core/managers/sounds/SoundManager";
import { StatisticsManager } from "@/engine/core/managers/statistics";
import { SurgeManager } from "@/engine/core/managers/surge/SurgeManager";
import { TaskManager } from "@/engine/core/managers/tasks";
import { TreasureManager } from "@/engine/core/managers/treasures";
import { WeatherManager } from "@/engine/core/managers/weather/WeatherManager";
import { IExtensionsDescriptor } from "@/engine/core/utils/extensions";
import { AnyObject } from "@/engine/lib/types";
import { mockExtension, resetRegistry } from "@/fixtures/engine";
import { resetFunctionMock } from "@/fixtures/jest";
import { MockIoFile } from "@/fixtures/lua";
import { MockGameObject, MockNetProcessor } from "@/fixtures/xray";

function mockLifecycleMethods(): [Array<TAbstractCoreManagerConstructor>, Array<TAbstractCoreManagerConstructor>] {
  const saveOrder: Array<TAbstractCoreManagerConstructor> = [];
  const loadOrder: Array<TAbstractCoreManagerConstructor> = [];

  for (const [managerClass, managerInstance] of registry.managers) {
    (managerClass as AnyObject).save = jest.fn(() => saveOrder.push(managerClass));
    (managerClass as AnyObject).load = jest.fn(() => loadOrder.push(managerClass));

    managerInstance.save = jest.fn(() => saveOrder.push(managerClass));
    managerInstance.load = jest.fn(() => loadOrder.push(managerClass));
    managerInstance.initialize = jest.fn();
  }

  return [saveOrder, loadOrder];
}

describe("SaveManager", () => {
  beforeEach(() => {
    resetRegistry();
    resetFunctionMock(io.open);
  });

  it("should correctly initialize", () => {
    const eventsManager: EventsManager = getManager(EventsManager);

    expect(eventsManager.getSubscribersCount()).toBe(0);

    initializeManager(SaveManager);
    expect(eventsManager.getSubscribersCount()).toBe(1);

    disposeManager(SaveManager);
    expect(eventsManager.getSubscribersCount()).toBe(0);
  });

  it("should correctly force init of surge manager on actor init", () => {
    const eventsManager: EventsManager = getManager(EventsManager);

    expect(isManagerInitialized(SaveManager)).toBe(false);
    expect(isManagerInitialized(SurgeManager)).toBe(false);

    initializeManager(SaveManager);

    expect(isManagerInitialized(SaveManager)).toBe(true);
    expect(isManagerInitialized(SurgeManager)).toBe(false);

    eventsManager.emitEvent(EGameEvent.ACTOR_REINIT, null);

    expect(isManagerInitialized(SaveManager)).toBe(true);
    expect(isManagerInitialized(SurgeManager)).toBe(true);
  });

  it("should save and load data from managers in a same order", () => {
    const expectedOrder: Array<TAbstractCoreManagerConstructor> = [
      WeatherManager,
      ReleaseBodyManager,
      SurgeManager,
      PsyAntennaManager,
      SoundManager,
      StatisticsManager,
      TreasureManager,
      TaskManager,
      ActorInputManager,
      GameSettingsManager,
    ];

    expectedOrder.forEach((it) => initializeManager(it));

    const [saveOrder, loadOrder] = mockLifecycleMethods();

    expect(saveOrder).toEqual([]);
    expect(loadOrder).toEqual([]);

    getManager(SaveManager).clientSave(MockNetProcessor.mockNetPacket());

    expect(saveOrder).toEqual(expectedOrder);
    expect(loadOrder).toEqual([]);

    getManager(SaveManager).clientLoad(MockNetProcessor.mockNetPacket());

    expect(saveOrder).toEqual(expectedOrder);
    expect(loadOrder).toEqual(expectedOrder);
  });

  it("should read and write data from managers in a strict order", () => {
    registerActor(MockGameObject.mock());

    const expectedOrder: Array<TAbstractCoreManagerConstructor> = [SimulationManager];

    expectedOrder.forEach((it) => initializeManager(it));

    const [saveOrder, loadOrder] = mockLifecycleMethods();

    expect(saveOrder).toEqual([]);
    expect(loadOrder).toEqual([]);

    getManager(SaveManager).serverSave(MockNetProcessor.mockNetPacket());

    expect(saveOrder).toEqual(expectedOrder);
    expect(loadOrder).toEqual([]);

    getManager(SaveManager).serverLoad(MockNetProcessor.mockNetPacket());

    expect(saveOrder).toEqual(expectedOrder);
    expect(loadOrder).toEqual(expectedOrder);
  });

  it("should have implementation base for save callbacks", () => {
    const saveManager: SaveManager = getManager(SaveManager);

    expect(saveManager.onBeforeGameSave).toBeDefined();
    expect(saveManager.onGameSave).toBeDefined();
    expect(saveManager.onBeforeGameLoad).toBeDefined();
    expect(saveManager.onGameLoad).toBeDefined();
  });

  it("should properly create dynamic saves", () => {
    const saveManager: SaveManager = getManager(SaveManager);
    const file: MockIoFile = new MockIoFile("test", "wb");
    const firstExtension: IExtensionsDescriptor = mockExtension({ name: "first" });
    const secondExtension: IExtensionsDescriptor = mockExtension({ name: "second" });

    registry.dynamicData.extensions[firstExtension.name] = { a: 1, b: true, c: null };
    registry.dynamicData.extensions[secondExtension.name] = { a: "a", b: "b" };
    registry.dynamicData.extensions["not-existing"] = { a: "not-existing" };

    registry.extensions.set(firstExtension.name, firstExtension);
    registry.extensions.set(secondExtension.name, secondExtension);

    const onSave = jest.fn((data: AnyObject) => {
      data.example = 123;
    });

    getManager(EventsManager).registerCallback(EGameEvent.GAME_SAVE, onSave);

    jest.spyOn(io, "open").mockImplementationOnce(() => $multi(file.asMock()));

    saveManager.onBeforeGameSave("test.scop");

    expect(onSave).toHaveBeenCalledTimes(1);
    expect(io.open).toHaveBeenCalledWith("$game_saves$\\test.scopx", "wb");
    expect(file.write).toHaveBeenCalledWith(
      JSON.stringify({
        event: { example: 123 },
        extensions: {
          first: { a: 1, b: true, c: null },
          second: { a: "a", b: "b" },
          "not-existing": { a: "not-existing" },
        },
        store: {},
        objects: {},
      })
    );
    expect(file.close).toHaveBeenCalledTimes(1);
  });

  it("should properly load dynamic saves", () => {
    const saveManager: SaveManager = getManager(SaveManager);
    const file: MockIoFile = new MockIoFile("test", "wb");
    const firstExtension: IExtensionsDescriptor = mockExtension({ name: "first" });
    const secondExtension: IExtensionsDescriptor = mockExtension({ name: "second" });

    registry.extensions.set(firstExtension.name, firstExtension);
    registry.extensions.set(secondExtension.name, secondExtension);

    file.content = JSON.stringify({
      event: { example: 123 },
      store: {},
      extensions: {
        first: { a: 1, b: true, c: null },
        second: { a: "a", b: "b" },
        third: { a: "not-registered" },
      },
      objects: {},
    });

    const onLoad = jest.fn((data: AnyObject) => {
      expect(data).toEqual({ example: 123 });
    });

    getManager(EventsManager).registerCallback(EGameEvent.GAME_LOAD, onLoad);

    jest.spyOn(io, "open").mockImplementation(() => $multi(file.asMock()));

    const contentBefore: AnyObject = registry.dynamicData;

    saveManager.onBeforeGameLoad("F:\\\\parent\\\\test.scop");

    expect(marshal.decode).toHaveBeenCalledWith(file.content);
    expect(onLoad).toHaveBeenCalledTimes(1);
    expect(io.open).toHaveBeenCalledWith("F:\\\\parent\\\\test.scopx", "rb");
    expect(file.read).toHaveBeenCalledTimes(1);
    expect(file.close).toHaveBeenCalledTimes(1);
    expect(contentBefore).not.toBe(registry.dynamicData);
    expect(registry.dynamicData.extensions).toEqual({
      first: {
        a: 1,
        b: true,
        c: null,
      },
      second: {
        a: "a",
        b: "b",
      },
      third: {
        a: "not-registered",
      },
    });

    // In case of empty file data should stay same.
    const contentAfter: AnyObject = registry.dynamicData;

    file.content = "";
    saveManager.onBeforeGameLoad("F:\\\\parent\\\\test.scop");
    expect(contentAfter).toBe(registry.dynamicData);

    file.content = null;
    saveManager.onBeforeGameLoad("F:\\\\parent\\\\test.scop");
    expect(contentAfter).toBe(registry.dynamicData);

    file.content = "{}";
    file.isOpen = false;
    saveManager.onBeforeGameLoad("F:\\\\parent\\\\test.scop");
    expect(contentAfter).toBe(registry.dynamicData);
  });
});
