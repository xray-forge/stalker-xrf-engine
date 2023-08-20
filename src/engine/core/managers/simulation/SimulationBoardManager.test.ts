import { beforeEach, describe, expect, it } from "@jest/globals";

import { disposeManager, getManagerInstance, registry } from "@/engine/core/database";
import { SimulationBoardManager } from "@/engine/core/managers/simulation/SimulationBoardManager";
import { EPacketDataType, mockNetPacket, mockNetProcessor, MockNetProcessor } from "@/fixtures/xray";

describe("SimulationBoardManager class", () => {
  beforeEach(() => {
    registry.managers = new LuaTable();
  });

  it("should correctly initialize and return values with getters", () => {
    const manager: SimulationBoardManager = getManagerInstance(SimulationBoardManager);

    expect(manager.areDefaultSimulationSquadsSpawned).toBe(false);
    expect(manager.getFactions()).toEqualLuaTables({});
    expect(manager.getSquads()).toEqualLuaTables({});
    expect(manager.getSmartTerrainDescriptors()).toEqualLuaTables({});
    expect(manager.getSmartTerrainByName("any")).toBeNull();
    expect(manager.getSmartTerrainDescriptor(123)).toBeNull();
  });

  it("should correctly save and load data", () => {
    const manager: SimulationBoardManager = getManagerInstance(SimulationBoardManager);
    const netProcessor: MockNetProcessor = new MockNetProcessor();

    manager.areDefaultSimulationSquadsSpawned = true;

    manager.save(mockNetPacket(netProcessor));

    expect(netProcessor.writeDataOrder).toEqual([EPacketDataType.BOOLEAN]);
    expect(netProcessor.dataList).toEqual([true]);

    disposeManager(SimulationBoardManager);

    const newManager: SimulationBoardManager = getManagerInstance(SimulationBoardManager);

    newManager.load(mockNetProcessor(netProcessor));

    expect(netProcessor.readDataOrder).toEqual(netProcessor.writeDataOrder);
    expect(netProcessor.dataList).toHaveLength(0);
    expect(newManager.areDefaultSimulationSquadsSpawned).toBe(true);
  });
});
