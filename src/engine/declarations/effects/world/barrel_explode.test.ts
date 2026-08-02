import { beforeAll, beforeEach, describe, expect, it } from "@jest/globals";
import { GameObject } from "xray16/alias";
import { MockGameObject } from "xray16/mocks";

import { registerStoryLink } from "@/engine/core/database";
import { callXrEffect, resetRegistry } from "@/fixtures/engine";

beforeAll(() => {
  require("@/engine/declarations/effects/world/barrel_explode");
});

beforeEach(() => {
  resetRegistry();
});

describe("barrel_explode", () => {
  it("should explode objects", () => {
    const object: GameObject = MockGameObject.mock();

    registerStoryLink(object.id(), "test-sid");

    callXrEffect("barrel_explode", MockGameObject.mockActor(), MockGameObject.mock(), "test-sid");

    expect(object.explode).toHaveBeenCalledWith(0);
  });
});
