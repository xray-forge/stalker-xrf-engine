import { beforeAll, describe, expect, it, jest } from "@jest/globals";
import { GameObject } from "xray16/alias";
import { MockGameObject } from "xray16/mocks";

import { callXrCondition } from "@/fixtures/engine";

beforeAll(() => {
  require("@/engine/declarations/conditions/object/mob_has_enemy");
});

describe("mob_has_enemy", () => {
  it("should check if object has enemy", () => {
    const object: GameObject = MockGameObject.mock();

    jest.spyOn(object, "get_enemy").mockImplementation(() => MockGameObject.mock());
    expect(callXrCondition("mob_has_enemy", MockGameObject.mockActor(), object)).toBe(true);

    jest.spyOn(object, "get_enemy").mockImplementation(() => null);
    expect(callXrCondition("mob_has_enemy", MockGameObject.mockActor(), object)).toBe(false);
  });
});
