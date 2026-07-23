import { describe, expect, it } from "@jest/globals";
import { object } from "xray16";
import { GameObject } from "xray16/alias";
import { MockGameObject, MockPropertyStorage } from "xray16/mocks";

import { StalkerStateController } from "@/engine/core/ai/state/StalkerStateController";
import { ActionWeaponNone } from "@/engine/core/ai/state/weapon/ActionWeaponNone";

describe("ActionWeaponNone", () => {
  it("sets the object to idle without an active item", () => {
    const value: GameObject = MockGameObject.mock();
    const action = new ActionWeaponNone(new StalkerStateController(value));

    action.setup(value, MockPropertyStorage.mock());
    action.initialize();
    expect(value.set_item).toHaveBeenCalledWith(object.idle, null);
  });
});
