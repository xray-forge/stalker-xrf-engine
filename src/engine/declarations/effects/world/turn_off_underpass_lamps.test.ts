import { beforeAll, beforeEach, describe, expect, it, jest } from "@jest/globals";
import { hanging_lamp } from "xray16";
import { GameObject, HangingLamp } from "xray16/alias";
import { MockGameObject } from "xray16/mocks";

import { registerStoryLink } from "@/engine/core/database";
import { callXrEffect, resetRegistry } from "@/fixtures/engine";

beforeAll(() => {
  require("@/engine/declarations/effects/world/turn_off_underpass_lamps");
});

beforeEach(() => {
  resetRegistry();
});

describe("turn_off_underpass_lamps", () => {
  it("should turn off every registered underpass lamp", () => {
    const first: GameObject = MockGameObject.mock();
    const second: GameObject = MockGameObject.mock();
    const firstLamp: HangingLamp = new hanging_lamp();
    const secondLamp: HangingLamp = new hanging_lamp();

    jest.spyOn(first, "get_hanging_lamp").mockReturnValue(firstLamp);
    jest.spyOn(second, "get_hanging_lamp").mockReturnValue(secondLamp);
    registerStoryLink(first.id(), "pas_b400_lamp_start_flash");
    registerStoryLink(second.id(), "pas_b400_lamp_hall_green");

    callXrEffect("turn_off_underpass_lamps", MockGameObject.mockActor(), MockGameObject.mock());

    expect(firstLamp.turn_off).toHaveBeenCalledTimes(1);
    expect(secondLamp.turn_off).toHaveBeenCalledTimes(1);
  });
});
