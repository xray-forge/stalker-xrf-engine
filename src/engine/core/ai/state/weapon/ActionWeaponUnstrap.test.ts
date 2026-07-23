import { describe, expect, it } from "@jest/globals";
import { GameObject } from "xray16/alias";
import { MockGameObject, MockPropertyStorage } from "xray16/mocks";

import { StalkerStateController } from "@/engine/core/ai/state/StalkerStateController";
import { ActionWeaponUnstrap } from "@/engine/core/ai/state/weapon/ActionWeaponUnstrap";

describe("ActionWeaponUnstrap", () => {
  it("selects the animation weapon action", () => {
    const value: GameObject = MockGameObject.mock();
    const action = new ActionWeaponUnstrap(new StalkerStateController(value));

    action.setup(value, MockPropertyStorage.mock());
    action.initialize();
    expect(value.set_item).toHaveBeenCalledTimes(1);
  });
});
