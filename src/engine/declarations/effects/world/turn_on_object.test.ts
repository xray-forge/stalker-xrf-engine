import { beforeAll, describe, expect, it, jest } from "@jest/globals";
import { hanging_lamp } from "xray16";
import { GameObject, HangingLamp } from "xray16/alias";
import { MockGameObject } from "xray16/mocks";

import { callXrEffect } from "@/fixtures/engine";

beforeAll(() => {
  require("@/engine/declarations/effects/world/turn_on_object");
});

describe("turn_on_object", () => {
  it("should turn on lamps", () => {
    const object: GameObject = MockGameObject.mock();
    const lamp: HangingLamp = new hanging_lamp();

    jest.spyOn(object, "get_hanging_lamp").mockImplementation(() => lamp);

    callXrEffect("turn_on_object", MockGameObject.mockActor(), object);

    expect(object.get_hanging_lamp().turn_on).toHaveBeenCalledTimes(1);
  });
});
