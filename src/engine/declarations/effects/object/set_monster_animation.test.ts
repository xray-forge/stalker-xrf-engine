import { beforeAll, describe, expect, it } from "@jest/globals";
import { GameObject } from "xray16/alias";
import { MockGameObject } from "xray16/mocks";

import { callXrEffect } from "@/fixtures/engine";

beforeAll(() => {
  require("@/engine/declarations/effects/object/set_monster_animation");
});

describe("set_monster_animation", () => {
  it("should set animations for monsters", () => {
    const object: GameObject = MockGameObject.mock();

    expect(() => callXrEffect("set_monster_animation", MockGameObject.mockActor(), object)).toThrow(
      "Wrong parameters in function 'set_monster_animation'"
    );

    callXrEffect("set_monster_animation", MockGameObject.mockActor(), object, "test-animation");

    expect(object.set_override_animation).toHaveBeenCalledWith("test-animation");
  });
});
