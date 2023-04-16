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
    const store: Array<string> = [];

    for (const [managerClass, managerInstance] of registry.managers) {
      (managerClass as AnyObject).save = jest.fn(() => store.push(managerClass.name));

      managerInstance.save = jest.fn(() => store.push(managerClass.name));
      managerInstance.initialize = jest.fn();
    }

    return store;
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

    const saveOrder: Array<string> = mockLifecycleMethods();

    expect(saveOrder).toEqual([]);
    SaveManager.getInstance().save(mockNetPacket());
    expect(saveOrder).toEqual(expectedOrder.map((it) => it.name));
  });
});
