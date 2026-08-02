import { beforeAll, describe, expect, it, jest } from "@jest/globals";
import { GameObject } from "xray16/alias";
import { MockGameObject } from "xray16/mocks";

import { IRegistryObjectState, registerObject } from "@/engine/core/database";
import { callXrCondition } from "@/fixtures/engine";

beforeAll(() => {
  require("@/engine/declarations/conditions/object/check_enemy_name");
});

describe("check_enemy_name", () => {
  it("should check object name", () => {
    const object: GameObject = MockGameObject.mock();
    const enemy: GameObject = MockGameObject.mock();
    const state: IRegistryObjectState = registerObject(object);

    jest.spyOn(enemy, "name").mockImplementation(() => "some-name");

    expect(callXrCondition("check_enemy_name", MockGameObject.mockActor(), object, "test")).toBe(false);

    jest.spyOn(enemy, "name").mockImplementation(() => "test-123");

    expect(callXrCondition("check_enemy_name", MockGameObject.mockActor(), object, "test")).toBe(false);
    expect(callXrCondition("check_enemy_name", MockGameObject.mockActor(), object, "123")).toBe(false);
    expect(callXrCondition("check_enemy_name", MockGameObject.mockActor(), object, "abc", "efg", "test")).toBe(false);

    state.enemy = enemy;
    state.enemyId = enemy.id();

    expect(callXrCondition("check_enemy_name", MockGameObject.mockActor(), object, "test")).toBe(true);
    expect(callXrCondition("check_enemy_name", MockGameObject.mockActor(), object, "123")).toBe(true);
    expect(callXrCondition("check_enemy_name", MockGameObject.mockActor(), object, "abc", "efg", "test")).toBe(true);

    jest.spyOn(enemy, "alive").mockImplementation(() => false);

    expect(callXrCondition("check_enemy_name", MockGameObject.mockActor(), object, "test")).toBe(false);
  });
});
