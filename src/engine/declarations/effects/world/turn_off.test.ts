import { beforeAll, beforeEach, describe, expect, it, jest } from "@jest/globals";
import { hanging_lamp } from "xray16";
import { GameObject, HangingLamp } from "xray16/alias";
import { MockGameObject } from "xray16/mocks";

import { registerStoryLink } from "@/engine/core/database";
import { callXrEffect, resetRegistry } from "@/fixtures/engine";

beforeAll(() => {
  require("@/engine/declarations/effects/world/turn_off");
});

beforeEach(() => {
  resetRegistry();
});

describe("turn_off", () => {
  it("should turn off lamps", () => {
    const first: GameObject = MockGameObject.mock();
    const second: GameObject = MockGameObject.mock();

    const firstLamp: HangingLamp = new hanging_lamp();
    const secondLamp: HangingLamp = new hanging_lamp();

    jest.spyOn(first, "get_hanging_lamp").mockImplementation(() => firstLamp);
    jest.spyOn(second, "get_hanging_lamp").mockImplementation(() => secondLamp);

    expect(() => {
      callXrEffect("turn_off", MockGameObject.mockActor(), MockGameObject.mock(), "test-sid-not-existing");
    }).toThrow("Object with story id 'test-sid-not-existing' does not exist.");

    registerStoryLink(first.id(), "test-sid-1");
    registerStoryLink(second.id(), "test-sid-2");

    callXrEffect("turn_off", MockGameObject.mockActor(), MockGameObject.mock(), "test-sid-1", "test-sid-2");

    expect(first.get_hanging_lamp().turn_off).toHaveBeenCalledTimes(1);
    expect(second.get_hanging_lamp().turn_off).toHaveBeenCalledTimes(1);
  });
});
