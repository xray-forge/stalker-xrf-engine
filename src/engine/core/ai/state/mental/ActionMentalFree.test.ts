import { describe, expect, it } from "@jest/globals";
import { anim, property_storage } from "xray16";
import { GameObject } from "xray16/alias";
import { MockGameObject } from "xray16/mocks";

import { ActionMentalFree } from "@/engine/core/ai/state/mental/ActionMentalFree";
import type { StalkerStateManager } from "@/engine/core/ai/state/StalkerStateManager";

describe("ActionMentalFree", () => {
  it("should correctly perform mental state set", () => {
    const object: GameObject = MockGameObject.mock();
    const action: ActionMentalFree = new ActionMentalFree({} as StalkerStateManager);

    action.setup(object, new property_storage());
    action.initialize();

    expect(object.set_mental_state).toHaveBeenCalledWith(anim.free);

    action.execute();
    expect(object.set_mental_state).toHaveBeenCalledTimes(2);
    expect(object.set_mental_state).toHaveBeenNthCalledWith(2, anim.free);
  });
});
