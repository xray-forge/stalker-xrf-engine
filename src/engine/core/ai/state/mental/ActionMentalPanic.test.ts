import { describe, expect, it } from "@jest/globals";
import { anim, property_storage } from "xray16";

import { ActionMentalPanic } from "@/engine/core/ai/state/mental/ActionMentalPanic";
import type { StalkerStateManager } from "@/engine/core/ai/state/StalkerStateManager";
import { GameObject } from "@/engine/lib/types";
import { MockGameObject } from "@/fixtures/xray";

describe("ActionMentalPanic", () => {
  it("should correctly perform mental state set", () => {
    const object: GameObject = MockGameObject.mock();
    const action: ActionMentalPanic = new ActionMentalPanic({} as StalkerStateManager);

    action.setup(object, new property_storage());
    action.initialize();

    expect(object.set_mental_state).toHaveBeenCalledWith(anim.panic);

    action.execute();
    expect(object.set_mental_state).toHaveBeenCalledTimes(2);
    expect(object.set_mental_state).toHaveBeenNthCalledWith(2, anim.panic);
  });
});
