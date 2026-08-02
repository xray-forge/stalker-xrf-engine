import { beforeAll, describe, expect, it } from "@jest/globals";
import { GameObject } from "xray16/alias";
import { MockGameObject } from "xray16/mocks";

import { callXrEffect } from "@/fixtures/engine";

beforeAll(() => {
  require("@/engine/declarations/effects/object/set_force_sleep_animation");
});

describe("set_force_sleep_animation", () => {
  it("should force sleep animation", () => {
    const object: GameObject = MockGameObject.mock();

    callXrEffect("set_force_sleep_animation", MockGameObject.mockActor(), object, 5000);

    expect(object.force_stand_sleep_animation).toHaveBeenCalledWith(5000);
  });
});
