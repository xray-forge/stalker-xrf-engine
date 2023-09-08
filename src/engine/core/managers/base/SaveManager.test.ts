import { beforeEach, describe, expect, it, jest } from "@jest/globals";

import { disposeManagers, initializeManager, registerActor, registry } from "@/engine/core/database";
import { EGameEvent, EventsManager } from "@/engine/core/managers";
import { TAbstractCoreManagerConstructor } from "@/engine/core/managers/base/AbstractCoreManager";
import { SaveManager } from "@/engine/core/managers/base/SaveManager";
import { AchievementsManager } from "@/engine/core/managers/interaction/achievements";
import { TaskManager } from "@/engine/core/managers/interaction/tasks";
import { ActorInputManager } from "@/engine/core/managers/interface";
import { GameSettingsManager } from "@/engine/core/managers/interface/GameSettingsManager";
import { StatisticsManager } from "@/engine/core/managers/interface/statistics/StatisticsManager";
import { SimulationBoardManager } from "@/engine/core/managers/simulation/SimulationBoardManager";
import { GlobalSoundManager } from "@/engine/core/managers/sounds/GlobalSoundManager";
import { PsyAntennaManager } from "@/engine/core/managers/world/PsyAntennaManager";
import { ReleaseBodyManager } from "@/engine/core/managers/world/ReleaseBodyManager";
import { SurgeManager } from "@/engine/core/managers/world/SurgeManager";
import { TreasureManager } from "@/engine/core/managers/world/treasures";
import { WeatherManager } from "@/engine/core/managers/world/WeatherManager";
import { AnyObject } from "@/engine/lib/types";
import { MockIoFile } from "@/fixtures/lua";
import { resetFunctionMock } from "@/fixtures/utils";
import { mockClientGameObject, mockNetPacket } from "@/fixtures/xray";

describe("SaveManager class", () => {
  const mockLifecycleMethods = () => {
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
  };

  beforeEach(() => {
    disposeManagers();
    resetFunctionMock(io.open);
  });

  it("should save and load data from managers in a strict order", () => {
    const expectedOrder: Array<TAbstractCoreManagerConstructor> = [
      WeatherManager,
      ReleaseBodyManager,
      SurgeManager,
      PsyAntennaManager,
      GlobalSoundManager,
      StatisticsManager,
      TreasureManager,
      TaskManager,
      AchievementsManager,
      ActorInputManager,
      GameSettingsManager,
    ];

    expectedOrder.forEach((it) => initializeManager(it));

    const [saveOrder, loadOrder] = mockLifecycleMethods();

    expect(saveOrder).toEqual([]);
    expect(loadOrder).toEqual([]);

    SaveManager.getInstance().clientSave(mockNetPacket());

    expect(saveOrder).toEqual(expectedOrder);
    expect(loadOrder).toEqual([]);

    SaveManager.getInstance().clientLoad(mockNetPacket());

    expect(saveOrder).toEqual(expectedOrder);
    expect(loadOrder).toEqual(expectedOrder);
  });

  it("should read and write data from managers in a strict order", () => {
    registerActor(mockClientGameObject());

    const expectedOrder: Array<TAbstractCoreManagerConstructor> = [SimulationBoardManager];

    expectedOrder.forEach((it) => initializeManager(it));

    const [saveOrder, loadOrder] = mockLifecycleMethods();

    expect(saveOrder).toEqual([]);
    expect(loadOrder).toEqual([]);

    SaveManager.getInstance().serverSave(mockNetPacket());

    expect(saveOrder).toEqual(expectedOrder);
    expect(loadOrder).toEqual([]);

    SaveManager.getInstance().serverLoad(mockNetPacket());

    expect(saveOrder).toEqual(expectedOrder);
    expect(loadOrder).toEqual(expectedOrder);
  });

  it("should have implementation base for save callbacks", () => {
    const saveManager: SaveManager = SaveManager.getInstance();

    expect(saveManager.onBeforeGameSave).toBeDefined();
    expect(saveManager.onGameSave).toBeDefined();
    expect(saveManager.onBeforeGameLoad).toBeDefined();
    expect(saveManager.onGameLoad).toBeDefined();
  });

  it("should properly create dynamic saves", () => {
    const saveManager: SaveManager = SaveManager.getInstance();
    const file: MockIoFile = new MockIoFile("test", "wb");

    const onSave = jest.fn((data: AnyObject) => {
      data.example = 123;
    });

    EventsManager.getInstance().registerCallback(EGameEvent.GAME_SAVE, onSave);

    jest.spyOn(io, "open").mockImplementationOnce(() => $multi(file.asMock()));

    saveManager.onBeforeGameSave("test.scop");

    expect(onSave).toHaveBeenCalledTimes(1);
    expect(io.open).toHaveBeenCalledWith("$game_saves$\\test.scopx", "wb");
    expect(file.write).toHaveBeenCalledWith(JSON.stringify({ generic: { example: 123 }, store: {} }));
    expect(file.close).toHaveBeenCalledTimes(1);
  });

  it("should properly load dynamic saves", () => {
    const saveManager: SaveManager = SaveManager.getInstance();
    const file: MockIoFile = new MockIoFile("test", "wb");

    file.content = JSON.stringify({ generic: { example: 123 }, store: {} });

    const onLoad = jest.fn((data: AnyObject) => {
      expect(data).toEqual({ example: 123 });
    });

    EventsManager.getInstance().registerCallback(EGameEvent.GAME_LOAD, onLoad);

    jest.spyOn(io, "open").mockImplementation(() => $multi(file.asMock()));

    const contentBefore: AnyObject = saveManager.dynamicData;

    saveManager.onBeforeGameLoad("F:\\\\parent\\\\test.scop");

    expect(marshal.decode).toHaveBeenCalledWith(file.content);
    expect(onLoad).toHaveBeenCalledTimes(1);
    expect(io.open).toHaveBeenCalledWith("F:\\\\parent\\\\test.scopx", "rb");
    expect(file.read).toHaveBeenCalledTimes(1);
    expect(file.close).toHaveBeenCalledTimes(1);
    expect(contentBefore).not.toBe(saveManager.dynamicData);

    // In case of empty file data should stay same.
    const contentAfter: AnyObject = saveManager.dynamicData;

    file.content = "";
    saveManager.onBeforeGameLoad("F:\\\\parent\\\\test.scop");
    expect(contentAfter).toBe(saveManager.dynamicData);

    file.content = null;
    saveManager.onBeforeGameLoad("F:\\\\parent\\\\test.scop");
    expect(contentAfter).toBe(saveManager.dynamicData);

    file.content = "{}";
    file.isOpen = false;
    saveManager.onBeforeGameLoad("F:\\\\parent\\\\test.scop");
    expect(contentAfter).toBe(saveManager.dynamicData);
  });
});
