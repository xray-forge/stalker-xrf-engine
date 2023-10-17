import { describe, expect, it } from "@jest/globals";
import { anim, property_storage } from "xray16";

import { ActionMentalFree } from "@/engine/core/objects/ai/state/mental/ActionMentalFree";
import type { StalkerStateManager } from "@/engine/core/objects/ai/state/StalkerStateManager";
import { GameObject } from "@/engine/lib/types";
import { mockGameObject } from "@/fixtures/xray";

describe("ActionMentalFree class", () => {
  it("should correctly perform mental state set", () => {
    const object: GameObject = mockGameObject();
    const action: ActionMentalFree = new ActionMentalFree({} as StalkerStateManager);

    action.setup(object, new property_storage());
    action.initialize();

    expect(object.set_mental_state).toHaveBeenCalledWith(anim.free);

    action.execute();
    expect(object.set_mental_state).toHaveBeenCalledTimes(2);
    expect(object.set_mental_state).toHaveBeenNthCalledWith(2, anim.free);
  });
});
