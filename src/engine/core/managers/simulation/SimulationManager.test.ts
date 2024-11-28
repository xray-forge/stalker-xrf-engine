import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import { actor_stats } from "xray16";

import { disposeManager, getManager } from "@/engine/core/database";
import { EGameEvent, EventsManager } from "@/engine/core/managers/events";
import { ISmartTerrainDescriptor } from "@/engine/core/managers/simulation/simulation_types";
import { SimulationManager } from "@/engine/core/managers/simulation/SimulationManager";
import { SmartTerrain } from "@/engine/core/objects/smart_terrain";
import { Squad } from "@/engine/core/objects/squad";
import { ACTOR_ID } from "@/engine/lib/constants/ids";
import { Optional, TName, TNumberId } from "@/engine/lib/types";
import { mockRegisteredActor, MockSmartTerrain, MockSquad, resetRegistry } from "@/fixtures/engine";
import { EPacketDataType, MockNetProcessor } from "@/fixtures/xray";

describe("SimulationManager", () => {
  beforeEach(() => {
    resetRegistry();
  });

  it("should correctly create and return values with getters", () => {
    const manager: SimulationManager = getManager(SimulationManager);

    expect(manager.areDefaultSimulationSquadsSpawned).toBe(false);
    expect(manager.getSquads()).toEqualLuaTables({});
    expect(manager.getTerrainDescriptors()).toEqualLuaTables({});
    expect(manager.getTerrainByName("any")).toBeNull();
    expect(manager.getTerrainDescriptorById(123)).toBeNull();
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

  it("should correctly get squads", () => {
    mockRegisteredActor();

    const manager: SimulationManager = getManager(SimulationManager);

    expect(manager.getSquads().length()).toBe(0);

    const first: Squad = MockSquad.mockRegistered();
    const second: Squad = MockSquad.mockRegistered();
    const squads: LuaTable<TNumberId, Squad> = manager.getSquads();

    expect(squads.length()).toBe(2);
    expect(squads.get(first.id)).toBe(first);
    expect(squads.get(second.id)).toBe(second);
  });

  it.todo("should correctly get smart terrain descriptors, population and info");

  it("should correctly get smart terrain list", () => {
    mockRegisteredActor();

    const manager: SimulationManager = getManager(SimulationManager);
    const first: SmartTerrain = MockSmartTerrain.mockRegistered();
    const second: SmartTerrain = MockSmartTerrain.mockRegistered();

    const smartTerrains: LuaTable<TName, SmartTerrain> = manager.getTerrains();

    expect(smartTerrains.length()).toBe(2);
    expect(smartTerrains.get(first.name())).toBe(first);
    expect(smartTerrains.get(second.name())).toBe(second);
  });

  it("should correctly get smart terrain by name", () => {
    mockRegisteredActor();

    const manager: SimulationManager = getManager(SimulationManager);
    const first: SmartTerrain = MockSmartTerrain.mockRegistered();
    const second: SmartTerrain = MockSmartTerrain.mockRegistered();

    expect(manager.getTerrainByName(first.name())).toBe(first);
    expect(manager.getTerrainByName(second.name())).toBe(second);
  });

  it("should correctly get smart terrain descriptor by id", () => {
    mockRegisteredActor();

    const manager: SimulationManager = getManager(SimulationManager);
    const first: SmartTerrain = MockSmartTerrain.mockRegistered();
    const second: SmartTerrain = MockSmartTerrain.mockRegistered();

    const firstDescriptor: Optional<ISmartTerrainDescriptor> = manager.getTerrainDescriptorById(first.id);
    const secondDescriptor: Optional<ISmartTerrainDescriptor> = manager.getTerrainDescriptorById(second.id);

    expect(firstDescriptor?.terrain).toBe(first);
    expect(firstDescriptor?.assignedSquadsCount).toBe(0);
    expect(firstDescriptor?.assignedSquads).toEqualLuaTables({});

    expect(secondDescriptor?.terrain).toBe(second);
    expect(secondDescriptor?.assignedSquadsCount).toBe(0);
    expect(secondDescriptor?.assignedSquads).toEqualLuaTables({});
  });

  it("should correctly get smart terrain assigned squads count", () => {
    mockRegisteredActor();

    const manager: SimulationManager = getManager(SimulationManager);
    const terrain: SmartTerrain = MockSmartTerrain.mockRegistered();

    const first: Squad = MockSquad.mockRegistered();
    const second: Squad = MockSquad.mockRegistered();
    const third: Squad = MockSquad.mockRegistered();

    jest.spyOn(first, "getScriptedSimulationTarget").mockImplementation(() => 1);
    jest.spyOn(second, "getScriptedSimulationTarget").mockImplementation(() => 1);

    manager.assignSquadToTerrain(first, terrain.id);
    manager.assignSquadToTerrain(second, terrain.id);
    manager.assignSquadToTerrain(third, terrain.id);

    expect(manager.getTerrainAssignedSquadsCount(terrain.id)).toBe(1);

    jest.spyOn(second, "getScriptedSimulationTarget").mockImplementation(() => null);
    jest.spyOn(first, "getScriptedSimulationTarget").mockImplementation(() => null);

    expect(manager.getTerrainAssignedSquadsCount(terrain.id)).toBe(3);

    manager.assignSquadToTerrain(first, null);
    manager.assignSquadToTerrain(second, null);
    manager.assignSquadToTerrain(third, null);

    expect(manager.getTerrainAssignedSquadsCount(terrain.id)).toBe(0);
  });

  it("should correctly register/unregister smart terrains", () => {
    mockRegisteredActor();

    const manager: SimulationManager = getManager(SimulationManager);
    const terrain: SmartTerrain = MockSmartTerrain.mock();

    expect(manager.getTerrains().length()).toBe(0);
    expect(manager.getTerrainDescriptors().length()).toBe(0);

    manager.registerTerrain(terrain);

    expect(manager.getTerrains().length()).toBe(1);
    expect(manager.getTerrainDescriptors().length()).toBe(1);

    const descriptor: Optional<ISmartTerrainDescriptor> = manager.getTerrainDescriptorById(terrain.id);

    expect(descriptor?.assignedSquads).toEqualLuaTables({});
    expect(descriptor?.assignedSquadsCount).toBe(0);
    expect(descriptor?.terrain).toBe(terrain);

    expect(manager.getTerrainByName(terrain.name())).toBe(terrain);

    expect(() => manager.registerTerrain(terrain)).toThrow(
      `Smart terrain '${terrain.name()}' is already registered in simulation board.`
    );

    manager.unregisterTerrain(terrain);

    expect(manager.getTerrains().length()).toBe(0);
    expect(manager.getTerrainDescriptors().length()).toBe(0);
    expect(manager.getTerrainByName(terrain.name())).toBeNull();

    expect(() => manager.unregisterTerrain(terrain)).toThrow(
      `Trying to unregister not registered smart terrain '${terrain.name()}'.`
    );
  });

  it.todo("should correctly unregister smart terrains");

  it.todo("should correctly assign squads to smart terrains");

  it.todo("should correctly create squads");

  it.todo("should correctly release squads");

  it.todo("should correctly handle squads register/unregister");

  it.todo("should correctly handle smart terrain enter/exit");

  it.todo("should correctly setup squads for objects");

  it.todo("should correctly initialize smart terrains for simulation");

  it.todo("should correctly initialize default simulation squads");

  it("should correctly initialize default simulation squads on actor register", () => {
    const manager: SimulationManager = getManager(SimulationManager);

    jest.spyOn(manager, "initializeDefaultSimulationSquads");

    EventsManager.emitEvent(EGameEvent.ACTOR_REGISTER);

    expect(manager.initializeDefaultSimulationSquads).toHaveBeenCalledTimes(1);
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

    manager.areDefaultSimulationSquadsSpawned = true;

    manager.save(processor.asNetPacket());

    expect(processor.writeDataOrder).toEqual([EPacketDataType.BOOLEAN]);
    expect(processor.dataList).toEqual([true]);

    disposeManager(SimulationManager);

    const newManager: SimulationManager = getManager(SimulationManager);

    newManager.load(processor.asNetReader());

    expect(processor.readDataOrder).toEqual(processor.writeDataOrder);
    expect(processor.dataList).toHaveLength(0);
    expect(newManager.areDefaultSimulationSquadsSpawned).toBe(true);
  });
});
