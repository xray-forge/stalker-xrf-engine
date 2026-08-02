import { beforeAll, describe, expect, it, jest } from "@jest/globals";
import { GameObject } from "xray16/alias";
import { MockGameObject } from "xray16/mocks";

import { callXrEffect } from "@/fixtures/engine";

beforeAll(() => {
  require("@/engine/declarations/effects/object/release_force_sleep_animation");
});

describe("release_force_sleep_animation", () => {
  it("should stop forced sleep animation", () => {
    const object: GameObject = MockGameObject.mock();

    jest.spyOn(object, "release_stand_sleep_animation").mockImplementation(jest.fn());

    callXrEffect("release_force_sleep_animation", MockGameObject.mockActor(), object);

    expect(object.release_stand_sleep_animation).toHaveBeenCalledTimes(1);
  });
});
