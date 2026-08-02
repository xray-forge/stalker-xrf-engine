import { beforeAll, describe, expect, it } from "@jest/globals";
import { GameObject } from "xray16/alias";
import { MockGameObject } from "xray16/mocks";

import { weapons } from "@/engine/constants/items/weapons";
import { callXrEffect } from "@/fixtures/engine";

beforeAll(() => {
  require("@/engine/declarations/effects/actor/activate_weapon");
});

describe("activate_weapon", () => {
  it("should change active actor item", () => {
    const weapon: GameObject = MockGameObject.mock({ section: weapons.wpn_svu });
    const actor: GameObject = MockGameObject.mockActor({
      inventory: [[weapon.section(), weapon]],
    });

    expect(() => callXrEffect("activate_weapon", actor, MockGameObject.mock(), weapons.wpn_fort)).toThrow(
      "Actor has no such item to activate - 'wpn_fort'."
    );

    callXrEffect("activate_weapon", actor, MockGameObject.mock(), weapons.wpn_svu);

    expect(actor.make_item_active).toHaveBeenCalledTimes(1);
    expect(actor.make_item_active).toHaveBeenCalledWith(weapon);
  });
});
