import { beforeAll, describe, expect, it, jest } from "@jest/globals";
import { GameObject } from "xray16/alias";
import { MockGameObject } from "xray16/mocks";

import { callXrEffect } from "@/fixtures/engine";

beforeAll(() => {
  require("@/engine/declarations/effects/object/clear_monster_animation");
});

describe("clear_monster_animation", () => {
  it("should clear animations for monsters", () => {
    const object: GameObject = MockGameObject.mock();

    jest.spyOn(object, "clear_override_animation").mockImplementation(jest.fn());

    callXrEffect("clear_monster_animation", MockGameObject.mockActor(), object);

    expect(object.clear_override_animation).toHaveBeenCalledTimes(1);
  });
});
