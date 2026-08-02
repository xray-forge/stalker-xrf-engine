import { beforeAll, describe, expect, it, jest } from "@jest/globals";
import { GameObject } from "xray16/alias";
import { MockGameObject } from "xray16/mocks";

import { callXrCondition } from "@/fixtures/engine";

beforeAll(() => {
  require("@/engine/declarations/conditions/object/has_enemy_in_current_loopholes_fov");
});

describe("has_enemy_in_current_loopholes_fov", () => {
  it("should check enemies in loophole", () => {
    const object: GameObject = MockGameObject.mock();
    const enemy: GameObject = MockGameObject.mock();

    expect(callXrCondition("has_enemy_in_current_loopholes_fov", MockGameObject.mockActor(), object)).toBe(false);

    jest.spyOn(object, "in_smart_cover").mockImplementation(() => true);
    expect(callXrCondition("has_enemy_in_current_loopholes_fov", MockGameObject.mockActor(), object)).toBe(false);

    jest.spyOn(object, "best_enemy").mockImplementation(() => enemy);
    expect(callXrCondition("has_enemy_in_current_loopholes_fov", MockGameObject.mockActor(), object)).toBe(false);

    jest.spyOn(object, "in_current_loophole_fov").mockImplementation((position) => position === enemy.position());
    expect(callXrCondition("has_enemy_in_current_loopholes_fov", MockGameObject.mockActor(), object)).toBe(true);
  });
});
