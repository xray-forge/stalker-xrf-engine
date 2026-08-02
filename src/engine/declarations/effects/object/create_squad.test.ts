import { beforeAll, beforeEach, describe, expect, it, jest } from "@jest/globals";
import { MockGameObject, MockIniFile } from "xray16/mocks";

import { registerSimulator, registry, SYSTEM_INI } from "@/engine/core/database";
import { callXrEffect, mockRegisteredActor, MockSmartTerrain, MockSquad, resetRegistry } from "@/fixtures/engine";

beforeAll(() => {
  require("@/engine/declarations/effects/object/create_squad");
});

beforeEach(() => {
  resetRegistry();
});

describe("create_squad", () => {
  it("should create a configured squad in the requested smart terrain", () => {
    registerSimulator();
    mockRegisteredActor();

    const terrain = MockSmartTerrain.mock("test-terrain");

    (SYSTEM_INI as unknown as MockIniFile).data.test_spawn_squad = {
      faction: "stalker",
      npc: "test_stalker",
    };

    const squad: MockSquad = MockSquad.mock({ section: "test_spawn_squad" });

    terrain.on_before_register();
    terrain.on_register();
    jest.spyOn(registry.simulator, "create").mockReturnValue(squad);
    jest.spyOn(squad, "addMember").mockImplementation(jest.fn(() => null as never));

    callXrEffect("create_squad", MockGameObject.mockActor(), MockGameObject.mock(), "test_spawn_squad", "test-terrain");

    expect(registry.simulator.create).toHaveBeenCalledWith(
      "test_spawn_squad",
      terrain.position,
      terrain.m_level_vertex_id,
      terrain.m_game_vertex_id
    );
    expect(squad.addMember).toHaveBeenCalledWith(
      "test_stalker",
      terrain.position,
      terrain.m_level_vertex_id,
      terrain.m_game_vertex_id
    );
    expect(squad.assignedTerrainId).toBe(terrain.id);
  });
});
