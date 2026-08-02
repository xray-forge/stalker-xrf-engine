import { beforeAll, beforeEach, describe, expect, it, jest } from "@jest/globals";
import { ServerHumanObject } from "xray16/alias";
import { MockAlifeHumanStalker, MockAlifeSimulator, MockGameObject, MockPatrol } from "xray16/mocks";

import { registerSimulator, registerStoryLink } from "@/engine/core/database";
import { callXrEffect, mockRegisteredActor, MockSmartTerrain, MockSquad, resetRegistry } from "@/fixtures/engine";

beforeAll(() => {
  require("@/engine/declarations/effects/object/create_squad_member");
});

beforeEach(() => {
  resetRegistry();
});

/**
 * Register a simulator, an actor, a terrain and a story-linked squad ready for `create_squad_member`.
 */
function mockCreateSquadMemberSetup(): { squad: MockSquad; member: ServerHumanObject; terrain: MockSmartTerrain } {
  registerSimulator();
  mockRegisteredActor();

  const terrain: MockSmartTerrain = MockSmartTerrain.mock("test-terrain") as MockSmartTerrain;
  const squad: MockSquad = MockSquad.mock();
  const commander: ServerHumanObject = MockAlifeHumanStalker.mock();
  const member: ServerHumanObject = MockAlifeHumanStalker.mock();

  terrain.on_before_register();
  terrain.on_register();
  squad.assignedTerrainId = terrain.id;
  squad.mockAddMember(commander);
  MockAlifeSimulator.addToRegistry(squad);
  MockAlifeSimulator.addToRegistry(commander);
  registerStoryLink(squad.id, "test-squad");
  jest.spyOn(squad, "commander_id").mockReturnValue(commander.id);
  jest.spyOn(squad, "addMember").mockReturnValue(member);
  jest.spyOn(squad, "assignMemberToTerrain");
  jest.spyOn(squad, "update");

  return { member, squad, terrain };
}

describe("create_squad_member", () => {
  it("should add and assign a member at the squad commander position", () => {
    registerSimulator();
    mockRegisteredActor();

    const terrain = MockSmartTerrain.mock("test-terrain");
    const squad: MockSquad = MockSquad.mock();
    const commander: ServerHumanObject = MockAlifeHumanStalker.mock();
    const member: ServerHumanObject = MockAlifeHumanStalker.mock();

    terrain.on_before_register();
    terrain.on_register();
    squad.assignedTerrainId = terrain.id;
    squad.mockAddMember(commander);
    MockAlifeSimulator.addToRegistry(squad);
    MockAlifeSimulator.addToRegistry(commander);
    registerStoryLink(squad.id, "test-squad");
    jest.spyOn(squad, "commander_id").mockReturnValue(commander.id);
    jest.spyOn(squad, "addMember").mockReturnValue(member);
    jest.spyOn(squad, "assignMemberToTerrain");
    jest.spyOn(squad, "update").mockImplementation(jest.fn());

    callXrEffect("create_squad_member", MockGameObject.mockActor(), MockGameObject.mock(), "test_member", "test-squad");

    expect(squad.addMember).toHaveBeenCalledWith(
      "test_member",
      commander.position,
      commander.m_level_vertex_id,
      commander.m_game_vertex_id
    );
    expect(squad.assignMemberToTerrain).toHaveBeenCalledWith(member.id, terrain, null);
    expect(squad.update).toHaveBeenCalledTimes(1);
  });

  it("should reject a missing squad identifier", () => {
    expect(() =>
      callXrEffect("create_squad_member", MockGameObject.mockActor(), MockGameObject.mock(), "test_member")
    ).toThrow("Wrong squad identificator [NIL] in 'create_squad_member' function");
  });

  it("should spawn at an explicitly named patrol point", () => {
    const { squad, member } = mockCreateSquadMemberSetup();

    MockPatrol.setup({
      "member-point": {
        points: [{ flag: 0, gvid: 11, lvid: 22, name: "point", position: MockGameObject.mock().position() as never }],
      },
    });

    callXrEffect(
      "create_squad_member",
      MockGameObject.mockActor(),
      MockGameObject.mock(),
      "test_member",
      "test-squad",
      "member-point"
    );

    expect(squad.addMember).toHaveBeenCalledWith("test_member", expect.anything(), 22, 11);
    expect(squad.assignMemberToTerrain).toHaveBeenCalledWith(member.id, expect.anything(), null);
  });

  // The `simulation_point` variant that reads `spawn_point` out of system.ini is not covered here: forcing that
  // read requires stubbing the shared `SYSTEM_INI` singleton, which leaks into every later test in this file.
  it("should fall back to the terrain spawn point when the squad configures none", () => {
    const { squad, terrain } = mockCreateSquadMemberSetup();

    MockPatrol.setup({
      "terrain-point": {
        points: [{ flag: 0, gvid: 55, lvid: 66, name: "point", position: MockGameObject.mock().position() as never }],
      },
    });
    terrain.spawnPointName = "terrain-point";

    callXrEffect(
      "create_squad_member",
      MockGameObject.mockActor(),
      MockGameObject.mock(),
      "test_member",
      "test-squad",
      "simulation_point"
    );

    expect(squad.addMember).toHaveBeenCalledWith("test_member", expect.anything(), 66, 55);
  });
});
