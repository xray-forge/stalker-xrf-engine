import { beforeEach, describe, expect, it } from "@jest/globals";

import { disposeManager, getManagerInstance } from "@/engine/core/database";
import { SimulationManager } from "@/engine/core/managers/simulation/SimulationManager";
import { resetRegistry } from "@/fixtures/engine";
import { EPacketDataType, mockNetPacket, mockNetProcessor, MockNetProcessor } from "@/fixtures/xray";

describe("SimulationBoardManager class", () => {
  beforeEach(() => {
    resetRegistry();
  });

  it("should correctly initialize and return values with getters", () => {
    const manager: SimulationManager = getManagerInstance(SimulationManager);

    expect(manager.areDefaultSimulationSquadsSpawned).toBe(false);
    expect(manager.getFactions()).toEqualLuaTables({});
    expect(manager.getSquads()).toEqualLuaTables({});
    expect(manager.getSmartTerrainDescriptors()).toEqualLuaTables({});
    expect(manager.getSmartTerrainByName("any")).toBeNull();
    expect(manager.getSmartTerrainDescriptor(123)).toBeNull();
  });

  it("should correctly save and load data", () => {
    const manager: SimulationManager = getManagerInstance(SimulationManager);
    const netProcessor: MockNetProcessor = new MockNetProcessor();

    manager.areDefaultSimulationSquadsSpawned = true;

    manager.save(mockNetPacket(netProcessor));

    expect(netProcessor.writeDataOrder).toEqual([EPacketDataType.BOOLEAN]);
    expect(netProcessor.dataList).toEqual([true]);

    disposeManager(SimulationManager);

    const newManager: SimulationManager = getManagerInstance(SimulationManager);

    newManager.load(mockNetProcessor(netProcessor));

    expect(netProcessor.readDataOrder).toEqual(netProcessor.writeDataOrder);
    expect(netProcessor.dataList).toHaveLength(0);
    expect(newManager.areDefaultSimulationSquadsSpawned).toBe(true);
  });

  it.todo("should correctly get factions");

  it.todo("should correctly get squads");

  it.todo("should correctly get smart terrain descriptors, population and info");

  it.todo("should correctly get squad simulation targets");

  it.todo("should correctly register smart terrains");

  it.todo("should correctly unregister smart terrains");

  it.todo("should correctly assign squads to smart terrains");

  it.todo("should correctly create squads");

  it.todo("should correctly release squads");

  it.todo("should correctly handle squads register/unregister");

  it.todo("should correctly handle smart terrain enter/exit");

  it.todo("should correctly setup squads for objects");

  it.todo("should correctly initialize smart terrains for simulation");

  it.todo("should correctly initialize default simulation squads");

  it.todo("should correctly handle actor going online/offline");
});
