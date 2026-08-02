import { beforeAll, beforeEach, describe, expect, it, jest } from "@jest/globals";
import { hanging_lamp } from "xray16";
import { GameObject, HangingLamp } from "xray16/alias";
import { MockGameObject } from "xray16/mocks";

import { registerStoryLink } from "@/engine/core/database";
import { callXrEffect, resetRegistry } from "@/fixtures/engine";

beforeAll(() => {
  require("@/engine/declarations/effects/world/turn_off_and_force");
});

beforeEach(() => {
  resetRegistry();
});

describe("turn_off_and_force", () => {
  it("should turn off lamps and set force", () => {
    const object: GameObject = MockGameObject.mock();
    const lamp: HangingLamp = new hanging_lamp();

    jest.spyOn(object, "get_hanging_lamp").mockImplementation(() => lamp);

    registerStoryLink(object.id(), "test-sid");

    expect(() => {
      callXrEffect("turn_off_and_force", MockGameObject.mockActor(), MockGameObject.mock(), "not-existing");
    }).toThrow("Object with story id 'not-existing' does not exist.");

    callXrEffect("turn_off_and_force", MockGameObject.mockActor(), MockGameObject.mock(), "test-sid");

    expect(object.get_hanging_lamp().turn_off).toHaveBeenCalledTimes(1);
    expect(object.stop_particles).toHaveBeenCalledWith("weapons\\light_signal", "link");
  });
});
