import { beforeAll, describe, expect, it, jest } from "@jest/globals";
import { GameObject } from "xray16/alias";
import { MockGameObject } from "xray16/mocks";

import { registerStoryLink } from "@/engine/core/database";
import { callXrCondition } from "@/fixtures/engine";

beforeAll(() => {
  require("@/engine/declarations/conditions/object/see_npc");
});

describe("see_npc", () => {
  it("should check if object see another object", () => {
    const object: GameObject = MockGameObject.mock();
    const another: GameObject = MockGameObject.mock();

    jest.spyOn(object, "see").mockImplementation(() => false);
    expect(callXrCondition("see_npc", MockGameObject.mockActor(), object, "test-sid")).toBe(false);

    jest.spyOn(object, "see").mockImplementation(() => true);
    expect(callXrCondition("see_npc", MockGameObject.mockActor(), object, "test-sid")).toBe(false);

    registerStoryLink(another.id(), "test-sid");

    jest.spyOn(object, "see").mockImplementation(() => true);
    expect(callXrCondition("see_npc", MockGameObject.mockActor(), object, "test-sid")).toBe(true);

    jest.spyOn(object, "see").mockImplementation(() => false);
    expect(callXrCondition("see_npc", MockGameObject.mockActor(), object, "test-sid")).toBe(false);
  });
});
