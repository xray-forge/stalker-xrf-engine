import { beforeAll, describe, expect, it } from "@jest/globals";
import { GameObject } from "xray16/alias";
import { MockGameObject } from "xray16/mocks";

import { medkits } from "@/engine/constants/items/drugs";
import { weapons } from "@/engine/constants/items/weapons";
import { callXrCondition } from "@/fixtures/engine";

beforeAll(() => {
  require("@/engine/declarations/conditions/actor/actor_has_item");
});

describe("actor_has_item", () => {
  it("should check if actor has item", () => {
    const actor: GameObject = MockGameObject.mockActor({
      inventory: [
        [0, MockGameObject.mockWithSection(medkits.medkit)],
        [1, MockGameObject.mockWithSection(weapons.wpn_svd)],
      ],
    });

    expect(callXrCondition("actor_has_item", actor, MockGameObject.mock(), medkits.medkit)).toBe(true);
    expect(callXrCondition("actor_has_item", actor, MockGameObject.mock(), medkits.medkit_army)).toBe(false);
    expect(callXrCondition("actor_has_item", actor, MockGameObject.mock(), weapons.wpn_svd)).toBe(true);
    expect(callXrCondition("actor_has_item", actor, MockGameObject.mock(), weapons.wpn_val)).toBe(false);
  });
});
