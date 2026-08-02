import { beforeAll, beforeEach, describe, expect, it } from "@jest/globals";
import { GameObject } from "xray16/alias";
import { MockGameObject } from "xray16/mocks";
import { replaceFunctionMock } from "xray16/testing/utils";

import { storyIds } from "@/engine/constants/story_ids";
import { registerStoryLink } from "@/engine/core/database";
import { callXrEffect, resetRegistry } from "@/fixtures/engine";

beforeAll(() => {
  require("@/engine/declarations/effects/quests/jup_b202_inventory_box_relocate");
});

beforeEach(() => {
  resetRegistry();
});

describe("jup_b202_inventory_box_relocate", () => {
  it("should transfer every item from the actor box to Snag's box", () => {
    const from: GameObject = MockGameObject.mock();
    const to: GameObject = MockGameObject.mock();
    const first: GameObject = MockGameObject.mock();
    const second: GameObject = MockGameObject.mock();

    registerStoryLink(from.id(), storyIds.jup_b202_actor_treasure);
    registerStoryLink(to.id(), "jup_b202_snag_treasure");
    replaceFunctionMock(from.iterate_inventory_box, (callback) => {
      callback(from, first);
      callback(from, second);
    });

    callXrEffect("jup_b202_inventory_box_relocate", MockGameObject.mockActor(), MockGameObject.mock());

    expect(from.transfer_item).toHaveBeenNthCalledWith(1, first, to);
    expect(from.transfer_item).toHaveBeenNthCalledWith(2, second, to);
  });
});
