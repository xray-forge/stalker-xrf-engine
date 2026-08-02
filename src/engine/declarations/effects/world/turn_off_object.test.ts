import { beforeAll, describe, expect, it, jest } from "@jest/globals";
import { hanging_lamp } from "xray16";
import { GameObject, HangingLamp } from "xray16/alias";
import { MockGameObject } from "xray16/mocks";

import { callXrEffect } from "@/fixtures/engine";

beforeAll(() => {
  require("@/engine/declarations/effects/world/turn_off_object");
});

describe("turn_off_object", () => {
  it("should turn off lamps", () => {
    const object: GameObject = MockGameObject.mock();
    const lamp: HangingLamp = new hanging_lamp();

    jest.spyOn(object, "get_hanging_lamp").mockImplementation(() => lamp);

    callXrEffect("turn_off_object", MockGameObject.mockActor(), object);

    expect(object.get_hanging_lamp().turn_off).toHaveBeenCalledTimes(1);
  });
});
