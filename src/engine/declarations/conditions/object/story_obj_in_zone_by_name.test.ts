import { beforeAll, beforeEach, describe, expect, it, jest } from "@jest/globals";
import { GameObject, ServerHumanObject } from "xray16/alias";
import { MockAlifeHumanStalker, MockGameObject } from "xray16/mocks";

import { registerSimulator, registerStoryLink, registerZone } from "@/engine/core/database";
import { callXrCondition, resetRegistry } from "@/fixtures/engine";

beforeEach(() => {
  resetRegistry();
  registerSimulator();
});

beforeAll(() => {
  require("@/engine/declarations/conditions/object/story_obj_in_zone_by_name");
});

describe("story_obj_in_zone_by_name", () => {
  it("should check object zone", () => {
    const object: GameObject = MockGameObject.mock();
    const zone: GameObject = MockGameObject.mock();
    const serverObject: ServerHumanObject = MockAlifeHumanStalker.mock({ id: object.id() });

    jest.spyOn(zone, "name").mockImplementation(() => "zone-name");
    jest.spyOn(zone, "inside").mockImplementation((position) => position === serverObject.position);

    expect(
      callXrCondition(
        "story_obj_in_zone_by_name",
        MockGameObject.mockActor(),
        MockGameObject.mock(),
        "test-sid",
        "zone-name"
      )
    ).toBe(false);

    registerStoryLink(object.id(), "test-sid");
    registerZone(zone);

    expect(
      callXrCondition(
        "story_obj_in_zone_by_name",
        MockGameObject.mockActor(),
        MockGameObject.mock(),
        "test-sid",
        "zone-name"
      )
    ).toBe(true);
  });
});
