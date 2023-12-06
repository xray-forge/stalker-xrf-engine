import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import { CALifeSmartTerrainTask, level } from "xray16";

import { registerOfflineObject, registry } from "@/engine/core/database";
import { SimulationManager } from "@/engine/core/managers/simulation";
import { communities } from "@/engine/lib/constants/communities";
import { ServerHumanObject } from "@/engine/lib/types";
import { MockSquad, resetRegistry } from "@/fixtures/engine";
import { MockAlifeHumanStalker } from "@/fixtures/xray";

describe("Squad server object", () => {
  beforeEach(() => {
    resetRegistry();
  });

  it.todo("should correctly check if squad simulation is enabled");

  it("should correctly check if squad is valid target", () => {
    const squad: MockSquad = MockSquad.mock();
    const another: MockSquad = MockSquad.mock();

    expect(squad.isValidSimulationTarget(another)).toBe(false);

    another.faction = communities.stalker;
    squad.faction = communities.monster;

    expect(squad.isValidSimulationTarget(another)).toBe(false);

    another.faction = communities.dolg;
    squad.faction = communities.monster_predatory_day;

    jest.spyOn(level, "get_time_hours").mockImplementation(() => 7);
    expect(squad.isValidSimulationTarget(another)).toBe(false);

    jest.spyOn(level, "get_time_hours").mockImplementation(() => 8);
    expect(squad.isValidSimulationTarget(another)).toBe(true);

    jest.spyOn(level, "get_time_hours").mockImplementation(() => 18);
    expect(squad.isValidSimulationTarget(another)).toBe(true);

    jest.spyOn(level, "get_time_hours").mockImplementation(() => 19);
    expect(squad.isValidSimulationTarget(another)).toBe(false);
  });

  it("should correctly check if squad is reached", () => {
    const squad: MockSquad = MockSquad.mock();
    const another: MockSquad = MockSquad.mock();
    const stalker: ServerHumanObject = MockAlifeHumanStalker.mock();

    expect(squad.isReachedBySimulationObject(another)).toBe(true);

    squad.mockAddMember(stalker);

    expect(squad.isReachedBySimulationObject(another)).toBe(false);

    squad.mockRemoveMember(stalker);

    expect(squad.isReachedBySimulationObject(another)).toBe(true);
  });

  it("should correctly get simulation task", () => {
    const squad: MockSquad = MockSquad.mock();
    const task: CALifeSmartTerrainTask = squad.getSimulationTask();

    expect(task.level_vertex_id()).toBe(squad.m_level_vertex_id);
    expect(task.game_vertex_id()).toBe(squad.m_game_vertex_id);
  });

  it("should correctly handle simulation target selection", () => {
    const squad: MockSquad = MockSquad.mock();
    const another: MockSquad = MockSquad.mock();
    const simulationManager: SimulationManager = SimulationManager.getInstance();

    const first: ServerHumanObject = MockAlifeHumanStalker.mock();
    const second: ServerHumanObject = MockAlifeHumanStalker.mock();

    another.mockAddMember(first);
    another.mockAddMember(second);

    registerOfflineObject(first.id, { levelVertexId: 10, activeSection: "test_section" });
    registerOfflineObject(second.id, { levelVertexId: 11, activeSection: "test_section" });

    jest.spyOn(another, "setLocationTypes").mockImplementation(jest.fn());
    jest.spyOn(simulationManager, "assignSquadToSmartTerrain").mockImplementation(jest.fn());

    squad.onSimulationTargetSelected(another);

    expect(another.setLocationTypes).toHaveBeenCalledTimes(1);
    expect(simulationManager.assignSquadToSmartTerrain).toHaveBeenCalledWith(another, null);

    expect(registry.offlineObjects.length()).toBe(2);
    expect(registry.offlineObjects.get(first.id)).toEqual({
      levelVertexId: null,
      activeSection: null,
    });
    expect(registry.offlineObjects.get(second.id)).toEqual({
      levelVertexId: null,
      activeSection: null,
    });
  });

  it("should correctly handle simulation target deselection", () => {
    const squad: MockSquad = MockSquad.mock();
    const another: MockSquad = MockSquad.mock();

    expect(() => squad.onSimulationTargetDeselected(another)).not.toThrow();
  });
});
