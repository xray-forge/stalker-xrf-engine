import { beforeAll, beforeEach, describe, expect, it } from "@jest/globals";
import { GameObject } from "xray16/alias";
import { MockGameObject } from "xray16/mocks";

import { registerObject, registerStoryLink } from "@/engine/core/database";
import { callXrEffect, resetRegistry } from "@/fixtures/engine";

beforeAll(() => {
  require("@/engine/declarations/effects/object/hit_obj");
});

beforeEach(() => {
  resetRegistry();
});

describe("hit_obj", () => {
  it("should hit object based on parameters", () => {
    const source: GameObject = MockGameObject.mock();
    const target: GameObject = MockGameObject.mock();

    registerObject(target);
    registerStoryLink(target.id(), "target");

    callXrEffect("hit_obj", MockGameObject.mockActor(), source, "target", "bone", 0.25, 10, null);

    expect(target.hit).toHaveBeenCalledWith(
      expect.objectContaining({ boneName: "bone", draftsman: source, impulse: 10, power: 0.25 })
    );
  });
});
