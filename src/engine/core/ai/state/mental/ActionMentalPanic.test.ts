import { describe, expect, it } from "@jest/globals";
import { anim, property_storage } from "xray16";
import { GameObject } from "xray16/alias";
import { MockGameObject } from "xray16/mocks";

import { ActionMentalPanic } from "@/engine/core/ai/state/mental/ActionMentalPanic";
import type { StalkerStateController } from "@/engine/core/ai/state/StalkerStateController";

describe("ActionMentalPanic", () => {
  it("should correctly perform mental state set", () => {
    const object: GameObject = MockGameObject.mock();
    const action: ActionMentalPanic = new ActionMentalPanic({} as StalkerStateController);

    action.setup(object, new property_storage());
    action.initialize();

    expect(object.set_mental_state).toHaveBeenCalledWith(anim.panic);

    action.execute();
    expect(object.set_mental_state).toHaveBeenCalledTimes(2);
    expect(object.set_mental_state).toHaveBeenNthCalledWith(2, anim.panic);
  });
});
