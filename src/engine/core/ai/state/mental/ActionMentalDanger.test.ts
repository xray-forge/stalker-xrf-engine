import { describe, expect, it } from "@jest/globals";
import { anim, property_storage } from "xray16";
import { GameObject } from "xray16/alias";
import { MockGameObject } from "xray16/mocks";

import { ActionMentalDanger } from "@/engine/core/ai/state/mental/ActionMentalDanger";
import { StalkerStateController } from "@/engine/core/ai/state/StalkerStateController";

describe("ActionMentalDanger", () => {
  it("should correctly perform mental state set", () => {
    const object: GameObject = MockGameObject.mock();
    const action: ActionMentalDanger = new ActionMentalDanger({} as StalkerStateController);

    action.setup(object, new property_storage());
    action.initialize();

    expect(object.set_mental_state).toHaveBeenCalledWith(anim.danger);

    action.execute();
    expect(object.set_mental_state).toHaveBeenCalledTimes(2);
    expect(object.set_mental_state).toHaveBeenNthCalledWith(2, anim.danger);
  });
});
