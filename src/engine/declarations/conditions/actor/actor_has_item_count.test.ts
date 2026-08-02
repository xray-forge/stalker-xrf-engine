import { beforeAll, describe, expect, it } from "@jest/globals";
import { GameObject } from "xray16/alias";
import { MockGameObject } from "xray16/mocks";

import { medkits } from "@/engine/constants/items/drugs";
import { weapons } from "@/engine/constants/items/weapons";
import { callXrCondition } from "@/fixtures/engine";

beforeAll(() => {
  require("@/engine/declarations/conditions/actor/actor_has_item_count");
});

describe("actor_has_item_count", () => {
  it("should check if actor has items", () => {
    const actor: GameObject = MockGameObject.mockActor({
      inventory: [
        [0, MockGameObject.mockWithSection(medkits.medkit)],
        [1, MockGameObject.mockWithSection(medkits.medkit)],
        [2, MockGameObject.mockWithSection(medkits.medkit)],
        [3, MockGameObject.mockWithSection(weapons.wpn_svd)],
      ],
    });

    expect(callXrCondition("actor_has_item_count", actor, MockGameObject.mock(), medkits.medkit, 1)).toBe(true);
    expect(callXrCondition("actor_has_item_count", actor, MockGameObject.mock(), medkits.medkit, 3)).toBe(true);
    expect(callXrCondition("actor_has_item_count", actor, MockGameObject.mock(), medkits.medkit, 4)).toBe(false);
    expect(callXrCondition("actor_has_item_count", actor, MockGameObject.mock(), weapons.wpn_val, 1)).toBe(false);
    expect(callXrCondition("actor_has_item_count", actor, MockGameObject.mock(), weapons.wpn_svd, 1)).toBe(true);
  });
});
