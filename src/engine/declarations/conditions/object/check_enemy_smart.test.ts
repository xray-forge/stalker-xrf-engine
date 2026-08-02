import { beforeAll, beforeEach, describe, expect, it } from "@jest/globals";
import { GameObject, ServerHumanObject } from "xray16/alias";
import { ACTOR_ID } from "xray16/lib";
import { MockAlifeHumanStalker, MockGameObject } from "xray16/mocks";

import { IRegistryObjectState, registerObject, registerSimulator } from "@/engine/core/database";
import { SmartTerrain } from "@/engine/core/objects/smart_terrain";
import { callXrCondition, MockSmartTerrain, resetRegistry } from "@/fixtures/engine";

beforeEach(() => {
  resetRegistry();
  registerSimulator();
});

beforeAll(() => {
  require("@/engine/declarations/conditions/object/check_enemy_smart");
});

describe("check_enemy_smart", () => {
  it("should check enemy smart terrain", () => {
    const object: GameObject = MockGameObject.mock();
    const enemy: GameObject = MockGameObject.mock();
    const enemyServerObject: ServerHumanObject = MockAlifeHumanStalker.mock({ id: enemy.id() });
    const state: IRegistryObjectState = registerObject(object);
    const terrain: SmartTerrain = MockSmartTerrain.mock("terrain-name");

    expect(callXrCondition("check_enemy_smart", MockGameObject.mockActor(), object, terrain.name())).toBe(false);

    enemyServerObject.m_smart_terrain_id = terrain.id;
    state.enemyId = enemy.id();

    expect(callXrCondition("check_enemy_smart", MockGameObject.mockActor(), object, terrain.name())).toBe(false);

    registerObject(enemy);

    expect(callXrCondition("check_enemy_smart", MockGameObject.mockActor(), object, terrain.name())).toBe(true);
    expect(callXrCondition("check_enemy_smart", MockGameObject.mockActor(), object, "test-name")).toBe(false);

    state.enemyId = ACTOR_ID;

    expect(callXrCondition("check_enemy_smart", MockGameObject.mockActor(), object, terrain.name())).toBe(false);
  });
});
