import { beforeAll, describe, expect, it, jest } from "@jest/globals";
import { GameObject } from "xray16/alias";
import { MockGameObject } from "xray16/mocks";

import { storyNames } from "@/engine/constants/story_names";
import { registerObject, registerStoryLink } from "@/engine/core/database";
import { callXrCondition } from "@/fixtures/engine";

beforeAll(() => {
  require("@/engine/declarations/conditions/quests/jup_b202_inventory_box_empty");
});

describe("jup_b202_inventory_box_empty", () => {
  it("should check box state", () => {
    expect(() => {
      callXrCondition("jup_b202_inventory_box_empty", MockGameObject.mockActor(), MockGameObject.mock());
    }).toThrow();

    const object: GameObject = MockGameObject.mock();

    registerObject(object);
    registerStoryLink(object.id(), storyNames.jup_b202_actor_treasure);

    jest.spyOn(object, "is_inv_box_empty").mockImplementation(() => true);
    expect(callXrCondition("jup_b202_inventory_box_empty", MockGameObject.mockActor(), MockGameObject.mock())).toBe(
      true
    );

    jest.spyOn(object, "is_inv_box_empty").mockImplementation(() => false);
    expect(callXrCondition("jup_b202_inventory_box_empty", MockGameObject.mockActor(), MockGameObject.mock())).toBe(
      false
    );
  });
});
