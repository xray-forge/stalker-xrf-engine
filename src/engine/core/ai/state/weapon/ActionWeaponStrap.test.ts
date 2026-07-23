import { describe, expect, it } from "@jest/globals";
import { object } from "xray16";
import { GameObject } from "xray16/alias";
import { MockGameObject, MockPropertyStorage } from "xray16/mocks";

import { StalkerStateController } from "@/engine/core/ai/state/StalkerStateController";
import { ActionWeaponStrap } from "@/engine/core/ai/state/weapon/ActionWeaponStrap";

describe("ActionWeaponStrap", () => {
  it("falls back to no active item when no strappable weapon exists", () => {
    const value: GameObject = MockGameObject.mock();
    const action = new ActionWeaponStrap(new StalkerStateController(value));

    action.setup(value, MockPropertyStorage.mock());
    action.initialize();
    expect(value.set_item).toHaveBeenCalledWith(object.idle, null);
  });
});
