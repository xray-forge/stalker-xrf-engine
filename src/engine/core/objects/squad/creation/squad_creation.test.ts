import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import { patrol } from "xray16";

import { registerSimulator, SYSTEM_INI } from "@/engine/core/database";
import { createSquadMembers } from "@/engine/core/objects/squad/creation/squad_creation";
import { communities } from "@/engine/lib/constants/communities";
import { AnyObject, Patrol, ServerCreatureObject } from "@/engine/lib/types";
import { mockRegisteredActor, MockSmartTerrain, MockSquad, resetRegistry } from "@/fixtures/engine";
import { MockIniFile } from "@/fixtures/xray";

describe("createSquadMembers util", () => {
  beforeEach(() => {
    resetRegistry();
    registerSimulator();
    mockRegisteredActor();
  });

  it("should correctly fail when have no squad members sections exist", () => {
    (SYSTEM_INI as unknown as MockIniFile<AnyObject>).data["test_squad_without_members"] = {
      faction: communities.stalker,
    };

    const squad: MockSquad = MockSquad.mock("test_squad_without_members");
    const smartTerrain: MockSmartTerrain = MockSmartTerrain.mock();

    expect(() => createSquadMembers(squad, smartTerrain)).toThrow(
      "Unexpected attempt to spawn an empty squad 'test_squad_without_members'."
    );
  });

  it("should correctly spawn with few member options and smart terrain target", () => {
    (SYSTEM_INI as unknown as MockIniFile<AnyObject>).data["test_squad_without_members"] = {
      faction: communities.stalker,
      npc: "variantA, variantB",
    };

    const squad: MockSquad = MockSquad.mock("test_squad_without_members");
    const smartTerrain: MockSmartTerrain = MockSmartTerrain.mock();

    jest.spyOn(squad, "addMember").mockImplementation(jest.fn(() => null as unknown as ServerCreatureObject));
    jest.spyOn(squad.mapDisplayManager, "updateSquadMapSpot").mockImplementation(jest.fn());

    createSquadMembers(squad, smartTerrain);

    expect(squad.smartTerrainId).toBe(smartTerrain.id);
    expect(squad.mapDisplayManager.updateSquadMapSpot).toHaveBeenCalledWith(squad);
    expect(squad.addMember).toHaveBeenCalledTimes(2);
    expect(squad.addMember).toHaveBeenCalledWith(
      "variantA",
      smartTerrain.position,
      smartTerrain.m_level_vertex_id,
      smartTerrain.m_game_vertex_id
    );
    expect(squad.addMember).toHaveBeenCalledWith(
      "variantB",
      smartTerrain.position,
      smartTerrain.m_level_vertex_id,
      smartTerrain.m_game_vertex_id
    );
  });

  it("should correctly spawn with custom respawn point name", () => {
    (SYSTEM_INI as unknown as MockIniFile<AnyObject>).data["test_squad_without_members"] = {
      faction: communities.stalker,
      npc: "variantA, variantB",
      spawn_point: "",
    };

    const squad: MockSquad = MockSquad.mock("test_squad_without_members");
    const smartTerrain: MockSmartTerrain = MockSmartTerrain.mock();

    smartTerrain.spawnPointName = "test-wp";

    const spawnPatrol: Patrol = new patrol("test-wp");

    jest.spyOn(squad, "addMember").mockImplementation(jest.fn(() => null as unknown as ServerCreatureObject));
    jest.spyOn(squad.mapDisplayManager, "updateSquadMapSpot").mockImplementation(jest.fn());

    createSquadMembers(squad, smartTerrain);

    expect(squad.smartTerrainId).toBe(smartTerrain.id);
    expect(squad.mapDisplayManager.updateSquadMapSpot).toHaveBeenCalledWith(squad);
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
    (SYSTEM_INI as unknown as MockIniFile<AnyObject>).data["test_squad_without_members"] = {
      faction: communities.stalker,
      npc: "variantA, variantB",
      spawn_point: "test-wp",
    };

    const squad: MockSquad = MockSquad.mock("test_squad_without_members");
    const smartTerrain: MockSmartTerrain = MockSmartTerrain.mock();

    const spawnPatrol: Patrol = new patrol("test-wp");

    jest.spyOn(squad, "addMember").mockImplementation(jest.fn(() => null as unknown as ServerCreatureObject));
    jest.spyOn(squad.mapDisplayManager, "updateSquadMapSpot").mockImplementation(jest.fn());

    createSquadMembers(squad, smartTerrain);

    expect(squad.smartTerrainId).toBe(smartTerrain.id);
    expect(squad.mapDisplayManager.updateSquadMapSpot).toHaveBeenCalledWith(squad);
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
    (SYSTEM_INI as unknown as MockIniFile<AnyObject>).data["test_squad_without_members"] = {
      faction: communities.stalker,
      npc: "variantA, variantB",
      npc_random: "variantC, variantD",
      npc_in_squad: "1, 1",
    };

    const squad: MockSquad = MockSquad.mock("test_squad_without_members");
    const smartTerrain: MockSmartTerrain = MockSmartTerrain.mock();

    jest.spyOn(squad, "addMember").mockImplementation(jest.fn(() => null as unknown as ServerCreatureObject));
    jest.spyOn(squad.mapDisplayManager, "updateSquadMapSpot").mockImplementation(jest.fn());

    createSquadMembers(squad, smartTerrain);

    expect(squad.smartTerrainId).toBe(smartTerrain.id);
    expect(squad.mapDisplayManager.updateSquadMapSpot).toHaveBeenCalledWith(squad);
    expect(squad.addMember).toHaveBeenCalledTimes(3);
    expect(squad.addMember).toHaveBeenCalledWith(
      "variantA",
      smartTerrain.position,
      smartTerrain.m_level_vertex_id,
      smartTerrain.m_game_vertex_id
    );
    expect(squad.addMember).toHaveBeenCalledWith(
      "variantB",
      smartTerrain.position,
      smartTerrain.m_level_vertex_id,
      smartTerrain.m_game_vertex_id
    );
    expect(squad.addMember).toHaveBeenCalledWith(
      expect.stringMatching(/variantC|variantD/),
      smartTerrain.position,
      smartTerrain.m_level_vertex_id,
      smartTerrain.m_game_vertex_id
    );
  });

  it("should fail if min > max for random sapwn", () => {
    (SYSTEM_INI as unknown as MockIniFile<AnyObject>).data["test_squad_without_members"] = {
      faction: communities.stalker,
      npc: "variantA, variantB",
      npc_random: "variantC, variantD",
      npc_in_squad: "2, 1",
    };

    const squad: MockSquad = MockSquad.mock("test_squad_without_members");
    const smartTerrain: MockSmartTerrain = MockSmartTerrain.mock();

    jest.spyOn(squad, "addMember").mockImplementation(jest.fn(() => null as unknown as ServerCreatureObject));
    jest.spyOn(squad.mapDisplayManager, "updateSquadMapSpot").mockImplementation(jest.fn());

    expect(() => createSquadMembers(squad, smartTerrain)).toThrow(
      "When spawning squad min count can't be greater then max count in 'test_squad_without_members'."
    );
  });
});
