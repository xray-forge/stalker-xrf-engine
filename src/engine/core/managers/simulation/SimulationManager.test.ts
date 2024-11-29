import { beforeEach, describe, expect, it } from "@jest/globals";
import { actor_stats } from "xray16";

import { disposeManager, getManager, initializeManager } from "@/engine/core/database";
import { EGameEvent, EventsManager } from "@/engine/core/managers/events";
import { ISmartTerrainDescriptor } from "@/engine/core/managers/simulation/simulation_types";
import { simulationConfig } from "@/engine/core/managers/simulation/SimulationConfig";
import { SimulationManager } from "@/engine/core/managers/simulation/SimulationManager";
import { destroySimulationData } from "@/engine/core/managers/simulation/utils";
import { SmartTerrain } from "@/engine/core/objects/smart_terrain";
import { Squad } from "@/engine/core/objects/squad";
import { ACTOR_ID } from "@/engine/lib/constants/ids";
import { TName, TNumberId } from "@/engine/lib/types";
import { MockSmartTerrain, MockSquad, resetRegistry } from "@/fixtures/engine";
import { EPacketDataType, MockNetProcessor } from "@/fixtures/xray";

describe("SimulationManager", () => {
  beforeEach(() => {
    resetRegistry();
    destroySimulationData();

    simulationConfig.IS_SIMULATION_INITIALIZED = false;
  });

  it("should correctly initialize", () => {
    const eventsManager: EventsManager = getManager(EventsManager);

    getManager(SimulationManager);

    expect(eventsManager.getSubscribersCount()).toBe(2);
    expect(eventsManager.getEventSubscribersCount(EGameEvent.ACTOR_REGISTER)).toBe(1);
    expect(eventsManager.getEventSubscribersCount(EGameEvent.ACTOR_GO_OFFLINE)).toBe(1);

    disposeManager(SimulationManager);

    expect(eventsManager.getSubscribersCount()).toBe(0);
  });

  it("should correctly destroy values", () => {
    getManager(SimulationManager);

    simulationConfig.IS_SIMULATION_INITIALIZED = true;
    simulationConfig.TERRAINS = $fromObject<TName, SmartTerrain>({ a: MockSmartTerrain.mock() });
    simulationConfig.TERRAIN_DESCRIPTORS = $fromObject<TNumberId, ISmartTerrainDescriptor>({
      1: { terrain: MockSmartTerrain.mock(), assignedSquads: new LuaTable(), assignedSquadsCount: 0 },
    });
    simulationConfig.SQUADS = $fromObject<TNumberId, Squad>({ 1: MockSquad.mock() });

    disposeManager(SimulationManager);

    expect(simulationConfig.IS_SIMULATION_INITIALIZED).toBe(false);
    expect(simulationConfig.SQUADS).toEqualLuaTables({});
    expect(simulationConfig.TEMPORARY_ASSIGNED_SQUADS).toEqualLuaTables({});
    expect(simulationConfig.TERRAIN_DESCRIPTORS).toEqualLuaTables({});
    expect(simulationConfig.TERRAINS).toEqualLuaTables({});
  });

  it("should correctly initialize default simulation squads on actor register", () => {
    expect(simulationConfig.IS_SIMULATION_INITIALIZED).toBe(false);

    initializeManager(SimulationManager);

    EventsManager.emitEvent(EGameEvent.ACTOR_REGISTER);

    expect(simulationConfig.IS_SIMULATION_INITIALIZED).toBe(true);
  });

  it("should correctly handle actor destroy", () => {
    getManager(SimulationManager);

    EventsManager.emitEvent(EGameEvent.ACTOR_GO_OFFLINE);

    expect(actor_stats.remove_from_ranking).toHaveBeenCalledTimes(1);
    expect(actor_stats.remove_from_ranking).toHaveBeenCalledWith(ACTOR_ID);
  });

  it("should correctly save and load data", () => {
    const manager: SimulationManager = getManager(SimulationManager);
    const processor: MockNetProcessor = new MockNetProcessor();

    simulationConfig.IS_SIMULATION_INITIALIZED = true;

    manager.save(processor.asNetPacket());

    expect(processor.writeDataOrder).toEqual([EPacketDataType.BOOLEAN]);
    expect(processor.dataList).toEqual([true]);

    disposeManager(SimulationManager);

    const newManager: SimulationManager = getManager(SimulationManager);

    newManager.load(processor.asNetReader());

    expect(processor.readDataOrder).toEqual(processor.writeDataOrder);
    expect(processor.dataList).toHaveLength(0);
    expect(simulationConfig.IS_SIMULATION_INITIALIZED).toBe(true);
  });
});
