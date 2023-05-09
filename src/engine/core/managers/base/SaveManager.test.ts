import { beforeEach, describe, expect, it, jest } from "@jest/globals";

import { disposeManagers, initializeManager, registerActor, registry } from "@/engine/core/database";
import { TAbstractCoreManagerConstructor } from "@/engine/core/managers/base/AbstractCoreManager";
import { SaveManager } from "@/engine/core/managers/base/SaveManager";
import { AchievementsManager } from "@/engine/core/managers/interaction/achievements";
import { SimulationBoardManager } from "@/engine/core/managers/interaction/SimulationBoardManager";
import { TaskManager } from "@/engine/core/managers/interaction/tasks";
import { ActorInputManager } from "@/engine/core/managers/interface";
import { StatisticsManager } from "@/engine/core/managers/interface/StatisticsManager";
import { GlobalSoundManager } from "@/engine/core/managers/sounds/GlobalSoundManager";
import { PsyAntennaManager } from "@/engine/core/managers/world/PsyAntennaManager";
import { ReleaseBodyManager } from "@/engine/core/managers/world/ReleaseBodyManager";
import { SurgeManager } from "@/engine/core/managers/world/SurgeManager";
import { TreasureManager } from "@/engine/core/managers/world/TreasureManager";
import { WeatherManager } from "@/engine/core/managers/world/WeatherManager";
import { AnyObject } from "@/engine/lib/types";
import { mockClientGameObject } from "@/fixtures/xray";
import { mockNetPacket } from "@/fixtures/xray/mocks/save";

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
  });

  it("Should save and load data from managers in a strict order", () => {
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
    ];

    expectedOrder.forEach((it) => initializeManager(it));

    const [saveOrder, loadOrder] = mockLifecycleMethods();

    expect(saveOrder).toEqual([]);
    expect(loadOrder).toEqual([]);

    SaveManager.getInstance().save(mockNetPacket());

    expect(saveOrder).toEqual(expectedOrder);
    expect(loadOrder).toEqual([]);

    SaveManager.getInstance().load(mockNetPacket());

    expect(saveOrder).toEqual(expectedOrder);
    expect(loadOrder).toEqual(expectedOrder);
  });

  it("Should read and write data from managers in a strict order", () => {
    registerActor(mockClientGameObject());

    const expectedOrder: Array<TAbstractCoreManagerConstructor> = [SimulationBoardManager];

    expectedOrder.forEach((it) => initializeManager(it));

    const [saveOrder, loadOrder] = mockLifecycleMethods();

    expect(saveOrder).toEqual([]);
    expect(loadOrder).toEqual([]);

    SaveManager.getInstance().writeState(mockNetPacket());

    expect(saveOrder).toEqual(expectedOrder);
    expect(loadOrder).toEqual([]);

    SaveManager.getInstance().readState(mockNetPacket());

    expect(saveOrder).toEqual(expectedOrder);
    expect(loadOrder).toEqual(expectedOrder);
  });
});
