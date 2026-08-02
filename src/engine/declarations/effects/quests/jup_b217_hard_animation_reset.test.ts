import { beforeAll, beforeEach, describe, expect, it, jest } from "@jest/globals";
import { GameObject } from "xray16/alias";
import { MockGameObject } from "xray16/mocks";

import { registerObject } from "@/engine/core/database";
import { callXrEffect, resetRegistry } from "@/fixtures/engine";

beforeAll(() => {
  require("@/engine/declarations/effects/quests/jup_b217_hard_animation_reset");
});

beforeEach(() => {
  resetRegistry();
});

describe("jup_b217_hard_animation_reset", () => {
  it("should reset the Jupiter nitro animation", () => {
    const object: GameObject = MockGameObject.mock();
    const animationController = { setControl: jest.fn(), setState: jest.fn() };
    const stateController = { animationController, setState: jest.fn() };

    registerObject(object).stateController = stateController as never;

    callXrEffect("jup_b217_hard_animation_reset", MockGameObject.mockActor(), object);

    expect(stateController.setState).toHaveBeenCalledWith("jup_b217_nitro_straight", null, null, null, null);
    expect(animationController.setState).toHaveBeenNthCalledWith(1, null, true);
    expect(animationController.setState).toHaveBeenNthCalledWith(2, "jup_b217_nitro_straight", null);
    expect(animationController.setControl).toHaveBeenCalledTimes(1);
  });
});
