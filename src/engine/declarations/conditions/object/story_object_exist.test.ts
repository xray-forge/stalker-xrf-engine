import { beforeAll, describe, expect, it } from "@jest/globals";
import { GameObject } from "xray16/alias";
import { MockGameObject } from "xray16/mocks";

import { registerStoryLink } from "@/engine/core/database";
import { callXrCondition } from "@/fixtures/engine";

beforeAll(() => {
  require("@/engine/declarations/conditions/object/story_object_exist");
});

describe("story_object_exist", () => {
  it("should check if object exist", () => {
    const object: GameObject = MockGameObject.mock();

    expect(callXrCondition("story_object_exist", MockGameObject.mockActor(), object, "test-sid")).toBe(false);

    registerStoryLink(object.id(), "test-sid");

    expect(callXrCondition("story_object_exist", MockGameObject.mockActor(), object, "test-sid")).toBe(true);
  });
});
