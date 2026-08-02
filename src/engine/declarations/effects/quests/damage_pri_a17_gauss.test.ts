import { beforeAll, beforeEach, describe, expect, it } from "@jest/globals";
import { GameObject } from "xray16/alias";
import { MockGameObject } from "xray16/mocks";

import { questItems } from "@/engine/constants/items/quest_items";
import { registerStoryLink } from "@/engine/core/database";
import { callXrEffect, resetRegistry } from "@/fixtures/engine";

beforeAll(() => {
  require("@/engine/declarations/effects/quests/damage_pri_a17_gauss");
});

beforeEach(() => {
  resetRegistry();
});

describe("damage_pri_a17_gauss", () => {
  it("should break the registered quest rifle", () => {
    const gauss: GameObject = MockGameObject.mock();

    registerStoryLink(gauss.id(), questItems.pri_a17_gauss_rifle);

    callXrEffect("damage_pri_a17_gauss", MockGameObject.mockActor(), MockGameObject.mock());

    expect(gauss.set_condition).toHaveBeenCalledWith(0);
  });
});
