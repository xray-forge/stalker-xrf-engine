import { beforeEach, describe, expect, it } from "@jest/globals";

import { disposeManager, getManagerInstance, registry } from "@/engine/core/database";
import { surgeConfig } from "@/engine/core/managers/surge/SurgeConfig";
import { SurgeManager } from "@/engine/core/managers/surge/SurgeManager";
import { EPacketDataType, mockNetPacket, mockNetProcessor, MockNetProcessor } from "@/fixtures/xray";

describe("SurgeManager class", () => {
  beforeEach(() => {
    registry.managers = new LuaTable();
  });

  it.todo("should correctly initialize and destroy");

  it.todo("should correctly initialize covers");

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

  it.todo("should correctly replace anomalies and respawn artefacts");

  it.todo("should correctly handle actor going online");

  it.todo("should correctly handle actor taking items");

  it.todo("should correctly handle update event");

  it("should correctly handle saving/loading in general case", () => {
    const manager: SurgeManager = SurgeManager.getInstance();
    const netProcessor: MockNetProcessor = new MockNetProcessor();

    manager.nextScheduledSurgeDelay = 4500;

    manager.save(mockNetPacket(netProcessor));

    expect(manager.isAfterGameLoad).toBe(false);

    expect(netProcessor.writeDataOrder).toEqual([
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
    expect(netProcessor.dataList).toEqual([true, false, 12, 6, 12, 9, 30, 0, 0, 4500, 0, 11]);

    disposeManager(SurgeManager);

    const newManager: SurgeManager = getManagerInstance(SurgeManager);

    newManager.load(mockNetProcessor(netProcessor));

    expect(newManager.isAfterGameLoad).toBe(true);
    expect(netProcessor.readDataOrder).toEqual(netProcessor.writeDataOrder);
    expect(netProcessor.dataList).toHaveLength(0);
    expect(newManager).not.toBe(manager);

    expect(newManager.nextScheduledSurgeDelay).toBe(4500);
  });

  it("should correctly handle saving/loading when surge started", () => {
    surgeConfig.IS_STARTED = true;

    const manager: SurgeManager = SurgeManager.getInstance();
    const netProcessor: MockNetProcessor = new MockNetProcessor();

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

    manager.save(mockNetPacket(netProcessor));

    expect(manager.isAfterGameLoad).toBe(false);

    expect(netProcessor.writeDataOrder).toEqual([
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
    expect(netProcessor.dataList).toEqual([
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

    const newManager: SurgeManager = getManagerInstance(SurgeManager);

    newManager.load(mockNetProcessor(netProcessor));

    expect(netProcessor.readDataOrder).toEqual(netProcessor.writeDataOrder);
    expect(netProcessor.dataList).toHaveLength(0);
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
});
