import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import { CALifeSmartTerrainTask, level } from "xray16";

import { registerOfflineObject, registerSimulator, registerZone, registry } from "@/engine/core/database";
import { ESimulationTerrainRole } from "@/engine/core/managers/simulation/types";
import { assignSimulationSquadToTerrain } from "@/engine/core/managers/simulation/utils";
import { ESmartTerrainStatus, SmartTerrainControl } from "@/engine/core/objects/smart_terrain";
import { parseConditionsList } from "@/engine/core/utils/ini";
import { communities } from "@/engine/lib/constants/communities";
import { FALSE, TRUE } from "@/engine/lib/constants/words";
import { GameObject, ServerHumanObject } from "@/engine/lib/types";
import { mockRegisteredActor, MockSmartTerrain, MockSquad, resetRegistry } from "@/fixtures/engine";
import { MockAlifeHumanStalker, MockGameObject, MockIniFile } from "@/fixtures/xray";

describe("Squad server object", () => {
  beforeEach(() => {
    resetRegistry();
  });

  it("should correctly check if squad simulation is enabled by condlist", () => {
    const squad: MockSquad = MockSquad.mock();

    squad.isSimulationAvailableConditionList = parseConditionsList(TRUE);
    expect(squad.isSimulationAvailable()).toBe(true);

    squad.isSimulationAvailableConditionList = parseConditionsList(FALSE);
    expect(squad.isSimulationAvailable()).toBe(false);
  });

  it("should correctly check if squad simulation is enabled by no combat zone", () => {
    mockRegisteredActor();
    registerSimulator();

    const squad: MockSquad = MockSquad.mock();
    const terrain: MockSmartTerrain = MockSmartTerrain.mock();
    const zone: GameObject = MockGameObject.mock({ id: terrain.id });

    jest.spyOn(terrain, "name").mockImplementation(jest.fn(() => "zat_stalker_base_smart"));
    jest.spyOn(zone, "name").mockImplementation(jest.fn(() => "zat_a2_sr_no_assault"));

    terrain.on_before_register();
    terrain.on_register();

    registerZone(zone);

    terrain.terrainControl = new SmartTerrainControl(
      terrain,
      MockIniFile.mock("test.ltx", {
        test_control: {
          noweap_zone: "no_weap_test",
          ignore_zone: "ignore_zone_test",
          alarm_start_sound: "start_sound.ogg",
          alarm_stop_sound: "stop_sound.ogg",
        },
      }),
      "test_control"
    );
    terrain.terrainControl.status = ESmartTerrainStatus.NORMAL;

    squad.isSimulationAvailableConditionList = parseConditionsList(TRUE);
    expect(squad.isSimulationAvailable()).toBe(true);

    jest.spyOn(zone, "inside").mockImplementation(() => true);
    expect(squad.isSimulationAvailable()).toBe(false);

    terrain.terrainControl.status = ESmartTerrainStatus.ALARM;
    expect(squad.isSimulationAvailable()).toBe(true);
  });

  it("should correctly check if squad simulation is enabled by assigned base smart terrain", () => {
    mockRegisteredActor();
    registerSimulator();

    const squad: MockSquad = MockSquad.mock();
    const terrain: MockSmartTerrain = MockSmartTerrain.mockRegistered();

    assignSimulationSquadToTerrain(squad, terrain.id);
    expect(squad.isSimulationAvailable()).toBe(true);

    terrain.simulationProperties.set(ESimulationTerrainRole.BASE, 1);
    expect(squad.isSimulationAvailable()).toBe(false);

    squad.assignedTerrainId = null;
    expect(squad.isSimulationAvailable()).toBe(true);
  });

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

    const first: ServerHumanObject = MockAlifeHumanStalker.mock();
    const second: ServerHumanObject = MockAlifeHumanStalker.mock();

    another.mockAddMember(first);
    another.mockAddMember(second);

    registerOfflineObject(first.id, { levelVertexId: 10, activeSection: "test_section" });
    registerOfflineObject(second.id, { levelVertexId: 11, activeSection: "test_section" });

    jest.spyOn(another, "setLocationTypes").mockImplementation(jest.fn());
    jest.spyOn(another, "assignToTerrain").mockImplementation(jest.fn());

    squad.onSimulationTargetSelected(another);

    expect(another.setLocationTypes).toHaveBeenCalledTimes(1);
    expect(another.assignToTerrain).toHaveBeenCalledWith(null);

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
