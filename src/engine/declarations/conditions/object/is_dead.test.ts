import { beforeAll, describe, expect, it, jest } from "@jest/globals";
import { GameObject } from "xray16/alias";
import { MockGameObject } from "xray16/mocks";

import { registerStoryLink } from "@/engine/core/database";
import { callXrCondition } from "@/fixtures/engine";

beforeAll(() => {
  require("@/engine/declarations/conditions/object/is_dead");
});

describe("is_dead", () => {
  it("should check if object is dead", () => {
    const object: GameObject = MockGameObject.mock();

    expect(callXrCondition("is_dead", MockGameObject.mockActor(), object, "test-sid")).toBe(true);

    registerStoryLink(object.id(), "test-sid");

    expect(callXrCondition("is_dead", MockGameObject.mockActor(), object, "test-sid")).toBe(false);

    jest.spyOn(object, "alive").mockImplementation(() => false);

    expect(callXrCondition("is_dead", MockGameObject.mockActor(), object, "test-sid")).toBe(true);
  });
});
