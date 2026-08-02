import { beforeAll, describe, expect, it } from "@jest/globals";
import { GameObject } from "xray16/alias";
import { MockGameObject } from "xray16/mocks";

import { callXrEffect } from "@/fixtures/engine";

beforeAll(() => {
  require("@/engine/declarations/effects/object/heli_start_flame");
});

describe("heli_start_flame", () => {
  it("should start flame", () => {
    const object: GameObject = MockGameObject.mockHelicopter();

    callXrEffect("heli_start_flame", MockGameObject.mockActor(), object);

    expect(object.get_helicopter().StartFlame).toHaveBeenCalledTimes(1);
  });
});
