import { beforeAll, beforeEach, describe, expect, it, jest } from "@jest/globals";
import { GameObject, ServerHumanObject } from "xray16/alias";
import { MockAlifeHumanStalker, MockAlifeSimulator, MockGameObject, MockIniFile } from "xray16/mocks";

import { registerSimulator } from "@/engine/core/database";
import { SmartTerrain } from "@/engine/core/objects/smart_terrain/SmartTerrain";
import { callXrEffect, mockRegisteredActor, resetRegistry } from "@/fixtures/engine";

beforeAll(() => {
  require("@/engine/declarations/effects/object/switch_to_desired_job");
});

beforeEach(() => {
  resetRegistry();
});

describe("switch_to_desired_job", () => {
  it("should exchange the object with the holder of its desired smart-terrain job", () => {
    const terrain: SmartTerrain = new SmartTerrain("test_smart");
    const first: ServerHumanObject = MockAlifeHumanStalker.mock();
    const second: ServerHumanObject = MockAlifeHumanStalker.mock();
    const object: GameObject = MockGameObject.mock({ id: first.id });

    registerSimulator();
    mockRegisteredActor();
    terrain.ini = terrain.spawn_ini() as MockIniFile;
    jest.spyOn(terrain, "name").mockReturnValue("test_smart");
    (terrain as unknown as { m_game_vertex_id: number }).m_game_vertex_id = 512;
    (first as unknown as { m_game_vertex_id: number }).m_game_vertex_id = 512;
    (second as unknown as { m_game_vertex_id: number }).m_game_vertex_id = 512;
    MockAlifeSimulator.addToRegistry(terrain);
    MockAlifeSimulator.addToRegistry(first);
    MockAlifeSimulator.addToRegistry(second);
    terrain.on_register();
    terrain.register_npc(first);
    terrain.register_npc(second);

    const firstJob = terrain.objectJobDescriptors.get(first.id).job!.section;
    const secondJob = terrain.objectJobDescriptors.get(second.id).job!.section;

    terrain.objectJobDescriptors.get(first.id).desiredJob = secondJob;

    callXrEffect("switch_to_desired_job", MockGameObject.mockActor(), object);

    expect(terrain.objectByJobSection.get(secondJob)).toBe(first.id);
    expect(terrain.objectByJobSection.get(firstJob)).toBe(second.id);
  });
});
