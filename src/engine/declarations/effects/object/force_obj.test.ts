import { beforeAll, beforeEach, describe, expect, it } from "@jest/globals";
import { GameObject } from "xray16/alias";
import { MockGameObject } from "xray16/mocks";

import { registerObject, registerStoryLink } from "@/engine/core/database";
import { callXrEffect, resetRegistry } from "@/fixtures/engine";

beforeAll(() => {
  require("@/engine/declarations/effects/object/force_obj");
});

beforeEach(() => {
  resetRegistry();
});

describe("force_obj", () => {
  it("should set supplied and default upward force values for a story object", () => {
    const target: GameObject = MockGameObject.mock();

    registerObject(target);
    registerStoryLink(target.id(), "target");

    callXrEffect("force_obj", MockGameObject.mockActor(), MockGameObject.mock(), "target");
    callXrEffect("force_obj", MockGameObject.mockActor(), MockGameObject.mock(), "target", 42, 500);

    expect(target.set_const_force).toHaveBeenNthCalledWith(1, expect.anything(), 20, 100);
    expect(target.set_const_force).toHaveBeenNthCalledWith(2, expect.anything(), 42, 500);
  });
});
