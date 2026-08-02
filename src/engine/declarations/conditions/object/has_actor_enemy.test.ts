import { beforeAll, describe, expect, it, jest } from "@jest/globals";
import { GameObject } from "xray16/alias";
import { MockGameObject } from "xray16/mocks";

import { callXrCondition } from "@/fixtures/engine";

beforeAll(() => {
  require("@/engine/declarations/conditions/object/has_actor_enemy");
});

describe("has_actor_enemy", () => {
  it("should check if object has actor as enemy", () => {
    const object: GameObject = MockGameObject.mock();

    expect(callXrCondition("has_actor_enemy", MockGameObject.mockActor(), object)).toBe(false);

    jest.spyOn(object, "best_enemy").mockImplementation(() => MockGameObject.mock());
    expect(callXrCondition("has_actor_enemy", MockGameObject.mockActor(), object)).toBe(false);

    jest.spyOn(object, "best_enemy").mockImplementation(() => MockGameObject.mockActor());
    expect(callXrCondition("has_actor_enemy", MockGameObject.mockActor(), object)).toBe(true);
  });
});
