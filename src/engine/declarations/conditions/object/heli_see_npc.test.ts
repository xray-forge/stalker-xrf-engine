import { beforeAll, describe, expect, it, jest } from "@jest/globals";
import { CHelicopter } from "xray16";
import { GameObject } from "xray16/alias";
import { MockCHelicopter, MockGameObject } from "xray16/mocks";

import { registerStoryLink } from "@/engine/core/database";
import { callXrCondition } from "@/fixtures/engine";

beforeAll(() => {
  require("@/engine/declarations/conditions/object/heli_see_npc");
});

describe("heli_see_npc", () => {
  it("should check if heli see object", () => {
    const object: GameObject = MockGameObject.mock();
    const another: GameObject = MockGameObject.mock();
    const helicopter: CHelicopter = MockCHelicopter.mock();

    jest.spyOn(object, "get_helicopter").mockImplementation(() => helicopter);

    expect(callXrCondition("heli_see_npc", MockGameObject.mockActor(), object)).toBe(false);
    expect(callXrCondition("heli_see_npc", MockGameObject.mockActor(), object, "test-sid")).toBe(false);

    registerStoryLink(another.id(), "test-sid");

    expect(callXrCondition("heli_see_npc", MockGameObject.mockActor(), object, "test-sid")).toBe(false);

    jest.spyOn(helicopter, "isVisible").mockImplementation((object) => object === another);

    expect(callXrCondition("heli_see_npc", MockGameObject.mockActor(), object, "test-sid")).toBe(true);
  });
});
