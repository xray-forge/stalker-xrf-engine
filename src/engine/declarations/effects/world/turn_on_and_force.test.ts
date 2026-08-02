import { beforeAll, beforeEach, describe, expect, it, jest } from "@jest/globals";
import { hanging_lamp } from "xray16";
import { GameObject, HangingLamp } from "xray16/alias";
import { Y_VECTOR } from "xray16/lib";
import { MockGameObject } from "xray16/mocks";

import { registerStoryLink } from "@/engine/core/database";
import { callXrEffect, resetRegistry } from "@/fixtures/engine";

beforeAll(() => {
  require("@/engine/declarations/effects/world/turn_on_and_force");
});

beforeEach(() => {
  resetRegistry();
});

describe("turn_on_and_force", () => {
  it("should turn on lamps and set force", () => {
    const object: GameObject = MockGameObject.mock();
    const lamp: HangingLamp = new hanging_lamp();

    jest.spyOn(object, "get_hanging_lamp").mockImplementation(() => lamp);

    registerStoryLink(object.id(), "test-sid");

    expect(() => {
      callXrEffect("turn_on_and_force", MockGameObject.mockActor(), MockGameObject.mock(), "not-existing");
    }).toThrow("Object with story id 'not-existing' does not exist.");

    callXrEffect("turn_on_and_force", MockGameObject.mockActor(), MockGameObject.mock(), "test-sid");

    expect(object.get_hanging_lamp().turn_on).toHaveBeenCalledTimes(1);
    expect(object.start_particles).toHaveBeenCalledWith("weapons\\light_signal", "link");
    expect(object.set_const_force).toHaveBeenCalledWith(Y_VECTOR, 55, 14_000);

    callXrEffect("turn_on_and_force", MockGameObject.mockActor(), MockGameObject.mock(), "test-sid", 40, 15_000);

    expect(object.set_const_force).toHaveBeenCalledTimes(2);
    expect(object.set_const_force).toHaveBeenCalledWith(Y_VECTOR, 40, 15_000);
  });
});
