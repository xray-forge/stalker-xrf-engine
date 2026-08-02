import { beforeAll, beforeEach, describe, expect, it, jest } from "@jest/globals";
import { GameObject, ServerHumanObject } from "xray16/alias";
import { MockAlifeHumanStalker, MockGameObject } from "xray16/mocks";

import { registerSimulator, registerStoryLink } from "@/engine/core/database";
import { callXrCondition, resetRegistry } from "@/fixtures/engine";

beforeEach(() => {
  resetRegistry();
  registerSimulator();
});

beforeAll(() => {
  require("@/engine/declarations/conditions/object/obj_in_zone");
});

describe("obj_in_zone", () => {
  it("should check if object is in zone", () => {
    const first: ServerHumanObject = MockAlifeHumanStalker.mock();
    const second: ServerHumanObject = MockAlifeHumanStalker.mock();

    registerStoryLink(first.id, "first-sid");
    registerStoryLink(second.id, "second-sid");

    const zone: GameObject = MockGameObject.mock();

    jest.spyOn(zone, "inside").mockImplementation((position) => position === second.position);

    expect(callXrCondition("obj_in_zone", MockGameObject.mockActor(), zone)).toBe(false);
    expect(callXrCondition("obj_in_zone", MockGameObject.mockActor(), zone, "first-sid")).toBe(false);
    expect(callXrCondition("obj_in_zone", MockGameObject.mockActor(), zone, "first-sid", "second-sid")).toBe(true);
    expect(callXrCondition("obj_in_zone", MockGameObject.mockActor(), zone, "second-sid")).toBe(true);
  });
});
