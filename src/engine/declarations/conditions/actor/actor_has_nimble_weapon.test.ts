import { beforeAll, describe, expect, it } from "@jest/globals";
import { GameObject } from "xray16/alias";
import { MockGameObject } from "xray16/mocks";

import { weapons } from "@/engine/constants/items/weapons";
import { callXrCondition } from "@/fixtures/engine";

beforeAll(() => {
  require("@/engine/declarations/conditions/actor/actor_has_nimble_weapon");
});

describe("actor_has_nimble_weapon", () => {
  it("should check if actor has nimble weapon", () => {
    const first: GameObject = MockGameObject.mockActor({
      inventory: [
        [weapons.wpn_ak74u, MockGameObject.mockWithSection(weapons.wpn_ak74u)],
        [weapons.wpn_pm, MockGameObject.mockWithSection(weapons.wpn_pm)],
      ],
    });
    const second: GameObject = MockGameObject.mockActor({
      inventory: [[weapons.wpn_fn2000_nimble, MockGameObject.mockWithSection(weapons.wpn_fn2000_nimble)]],
    });
    const third: GameObject = MockGameObject.mockActor({
      inventory: [
        [weapons.wpn_ak74u, MockGameObject.mockWithSection(weapons.wpn_ak74u)],
        [weapons.wpn_pm, MockGameObject.mockWithSection(weapons.wpn_pm)],
        [weapons.wpn_g36_nimble, MockGameObject.mockWithSection(weapons.wpn_g36_nimble)],
      ],
    });

    expect(callXrCondition("actor_has_nimble_weapon", MockGameObject.mockActor(), MockGameObject.mock())).toBe(false);
    expect(callXrCondition("actor_has_nimble_weapon", first, MockGameObject.mock())).toBe(false);
    expect(callXrCondition("actor_has_nimble_weapon", second, MockGameObject.mock())).toBe(true);
    expect(callXrCondition("actor_has_nimble_weapon", third, MockGameObject.mock())).toBe(true);
  });
});
