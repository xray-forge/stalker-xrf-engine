import { beforeEach, describe, expect, it, jest } from "@jest/globals";

import { disposeManagers, initializeManager, registry } from "@/engine/core/database";
import {
  AchievementsManager,
  GlobalSoundManager,
  PsyAntennaManager,
  ReleaseBodyManager,
  SaveManager,
  StatisticsManager,
  SurgeManager,
  TaskManager,
  TreasureManager,
  WeatherManager,
} from "@/engine/core/managers";
import { TAbstractCoreManagerConstructor } from "@/engine/core/managers/base/AbstractCoreManager";
import { AnyObject } from "@/engine/lib/types";
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

  it("Should save data from managers in a strict order", () => {
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
});
