import { beforeAll, beforeEach, describe, expect, it, jest } from "@jest/globals";
import { MockGameObject } from "xray16/mocks";

import { registry } from "@/engine/core/database";
import { callXrEffect, resetRegistry } from "@/fixtures/engine";

beforeAll(() => {
  require("@/engine/declarations/effects/object/anim_obj_forward");
});

beforeEach(() => {
  resetRegistry();
});

describe("anim_obj_forward", () => {
  it("should correctly play forward animation", () => {
    const firstDoor = { startAnimation: jest.fn(), stopAnimation: jest.fn() };
    const secondDoor = { startAnimation: jest.fn(), stopAnimation: jest.fn() };

    registry.doors.set("first-door", firstDoor as never);
    registry.doors.set("second-door", secondDoor as never);

    callXrEffect("anim_obj_forward", MockGameObject.mockActor(), MockGameObject.mock(), "first-door", "second-door");

    expect(firstDoor.startAnimation).toHaveBeenCalledWith(true);
    expect(secondDoor.startAnimation).toHaveBeenCalledWith(true);
  });
});
