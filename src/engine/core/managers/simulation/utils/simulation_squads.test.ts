import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import { patrol } from "xray16";

import { registerSimulator, SYSTEM_INI } from "@/engine/core/database";
import { updateSquadMapSpot } from "@/engine/core/managers/map/utils";
import { getSimulationSquads } from "@/engine/core/managers/simulation/utils/simulation_data";
import { destroySimulationData } from "@/engine/core/managers/simulation/utils/simulation_initialization";
import {
  createSimulationSquadMembers,
  registerSimulationSquad,
  unRegisterSimulationSquad,
} from "@/engine/core/managers/simulation/utils/simulation_squads";
import { Squad } from "@/engine/core/objects/squad";
import { communities } from "@/engine/lib/constants/communities";
import { Patrol, ServerCreatureObject, TNumberId } from "@/engine/lib/types";
import { mockRegisteredActor, MockSmartTerrain, MockSquad, resetRegistry } from "@/fixtures/engine";
import { resetFunctionMock } from "@/fixtures/jest";
import { MockIniFile } from "@/fixtures/xray";

jest.mock("@/engine/core/managers/map/utils/map_spot_squad");

describe("registerSimulationSquad / unRegisterSimulationSquad util", () => {
  beforeEach(() => {
    resetRegistry();
    registerSimulator();
    destroySimulationData();
  });

  it("should correctly register and unregister squads", () => {
    mockRegisteredActor();

    expect(getSimulationSquads().length()).toBe(0);

    const first: Squad = MockSquad.mockRegistered();
    const second: Squad = MockSquad.mockRegistered();
    const squads: LuaTable<TNumberId, Squad> = getSimulationSquads();

    expect(squads.length()).toBe(2);
    expect(squads.get(first.id)).toBe(first);
    expect(squads.get(second.id)).toBe(second);

    unRegisterSimulationSquad(first);

    expect(squads.length()).toBe(1);
    expect(squads.get(second.id)).toBe(second);

    unRegisterSimulationSquad(second);

    expect(squads.length()).toBe(0);

    registerSimulationSquad(first);

    expect(squads.length()).toBe(1);
    expect(squads.get(first.id)).toBe(first);
  });
});

describe("createSimulationSquad util", () => {
  it.todo("should correctly create squads for terrains");
});

describe("createSimulationSquadMembers util", () => {
  beforeEach(() => {
    resetRegistry();
    registerSimulator();
    mockRegisteredActor();
    resetFunctionMock(updateSquadMapSpot);
  });

  it("should correctly fail when have no squad members sections exist", () => {
    (SYSTEM_INI as unknown as MockIniFile).data["test_squad_without_members"] = {
      faction: communities.stalker,
    };

    const squad: MockSquad = MockSquad.mock({ section: "test_squad_without_members" });
    const terrain: MockSmartTerrain = MockSmartTerrain.mock();

    expect(() => createSimulationSquadMembers(squad, terrain)).toThrow(
      "Unexpected attempt to spawn an empty squad 'test_squad_without_members'."
    );
  });

  it("should correctly spawn with few member options and smart terrain target", () => {
    (SYSTEM_INI as unknown as MockIniFile).data["test_squad_without_members"] = {
      faction: communities.stalker,
      npc: "variantA, variantB",
    };

    const squad: MockSquad = MockSquad.mock({ section: "test_squad_without_members" });
    const terrain: MockSmartTerrain = MockSmartTerrain.mock();

    jest.spyOn(squad, "addMember").mockImplementation(jest.fn(() => null as unknown as ServerCreatureObject));

    createSimulationSquadMembers(squad, terrain);

    expect(squad.assignedTerrainId).toBe(terrain.id);
    expect(updateSquadMapSpot).toHaveBeenCalledWith(squad);
    expect(squad.addMember).toHaveBeenCalledTimes(2);
    expect(squad.addMember).toHaveBeenCalledWith(
      "variantA",
      terrain.position,
      terrain.m_level_vertex_id,
      terrain.m_game_vertex_id
    );
    expect(squad.addMember).toHaveBeenCalledWith(
      "variantB",
      terrain.position,
      terrain.m_level_vertex_id,
      terrain.m_game_vertex_id
    );
  });

  it("should correctly spawn with custom respawn point name", () => {
    (SYSTEM_INI as unknown as MockIniFile).data["test_squad_without_members"] = {
      faction: communities.stalker,
      npc: "variantA, variantB",
      spawn_point: "",
    };

    const squad: MockSquad = MockSquad.mock({ section: "test_squad_without_members" });
    const terrain: MockSmartTerrain = MockSmartTerrain.mock();

    terrain.spawnPointName = "test-wp";

    const spawnPatrol: Patrol = new patrol("test-wp");

    jest.spyOn(squad, "addMember").mockImplementation(jest.fn(() => null as unknown as ServerCreatureObject));

    createSimulationSquadMembers(squad, terrain);

    expect(squad.assignedTerrainId).toBe(terrain.id);
    expect(updateSquadMapSpot).toHaveBeenCalledWith(squad);
    expect(squad.addMember).toHaveBeenCalledTimes(2);
    expect(squad.addMember).toHaveBeenCalledWith(
      "variantA",
      spawnPatrol.point(0),
      spawnPatrol.level_vertex_id(0),
      spawnPatrol.game_vertex_id(0)
    );
    expect(squad.addMember).toHaveBeenCalledWith(
      "variantB",
      spawnPatrol.point(0),
      spawnPatrol.level_vertex_id(0),
      spawnPatrol.game_vertex_id(0)
    );
  });

  it("should correctly spawn with custom ini spawn point name", () => {
    (SYSTEM_INI as unknown as MockIniFile).data["test_squad_without_members"] = {
      faction: communities.stalker,
      npc: "variantA, variantB",
      spawn_point: "test-wp",
    };

    const squad: MockSquad = MockSquad.mock({ section: "test_squad_without_members" });
    const terrain: MockSmartTerrain = MockSmartTerrain.mock();

    const spawnPatrol: Patrol = new patrol("test-wp");

    jest.spyOn(squad, "addMember").mockImplementation(jest.fn(() => null as unknown as ServerCreatureObject));

    createSimulationSquadMembers(squad, terrain);

    expect(squad.assignedTerrainId).toBe(terrain.id);
    expect(updateSquadMapSpot).toHaveBeenCalledWith(squad);
    expect(squad.addMember).toHaveBeenCalledTimes(2);
    expect(squad.addMember).toHaveBeenCalledWith(
      "variantA",
      spawnPatrol.point(0),
      spawnPatrol.level_vertex_id(0),
      spawnPatrol.game_vertex_id(0)
    );
    expect(squad.addMember).toHaveBeenCalledWith(
      "variantB",
      spawnPatrol.point(0),
      spawnPatrol.level_vertex_id(0),
      spawnPatrol.game_vertex_id(0)
    );
  });

  it("should correctly spawn with random spawn config", () => {
    (SYSTEM_INI as unknown as MockIniFile).data["test_squad_without_members"] = {
      faction: communities.stalker,
      npc: "variantA, variantB",
      npc_random: "variantC, variantD",
      npc_in_squad: "1, 1",
    };

    const squad: MockSquad = MockSquad.mock({ section: "test_squad_without_members" });
    const terrain: MockSmartTerrain = MockSmartTerrain.mock();

    jest.spyOn(squad, "addMember").mockImplementation(jest.fn(() => null as unknown as ServerCreatureObject));

    createSimulationSquadMembers(squad, terrain);

    expect(squad.assignedTerrainId).toBe(terrain.id);
    expect(updateSquadMapSpot).toHaveBeenCalledWith(squad);
    expect(squad.addMember).toHaveBeenCalledTimes(3);
    expect(squad.addMember).toHaveBeenCalledWith(
      "variantA",
      terrain.position,
      terrain.m_level_vertex_id,
      terrain.m_game_vertex_id
    );
    expect(squad.addMember).toHaveBeenCalledWith(
      "variantB",
      terrain.position,
      terrain.m_level_vertex_id,
      terrain.m_game_vertex_id
    );
    expect(squad.addMember).toHaveBeenCalledWith(
      expect.stringMatching(/variantC|variantD/),
      terrain.position,
      terrain.m_level_vertex_id,
      terrain.m_game_vertex_id
    );
  });

  it("should fail if min > max for random sapwn", () => {
    (SYSTEM_INI as unknown as MockIniFile).data["test_squad_without_members"] = {
      faction: communities.stalker,
      npc: "variantA, variantB",
      npc_random: "variantC, variantD",
      npc_in_squad: "2, 1",
    };

    const squad: MockSquad = MockSquad.mock({ section: "test_squad_without_members" });
    const terrain: MockSmartTerrain = MockSmartTerrain.mock();

    jest.spyOn(squad, "addMember").mockImplementation(jest.fn(() => null as unknown as ServerCreatureObject));

    expect(() => createSimulationSquadMembers(squad, terrain)).toThrow(
      "When spawning squad min count can't be greater then max count in 'test_squad_without_members'."
    );
  });
});

describe("releaseSimulationSquad util", () => {
  it.todo("should correctly release squads");
});

describe("setupSimulationObjectSquadAndGroup util", () => {
  it.todo("should correctly setup objects");
});

describe("assignSimulationSquadToTerrain util", () => {
  it.todo("should correctly assign terrains for squads");
});
