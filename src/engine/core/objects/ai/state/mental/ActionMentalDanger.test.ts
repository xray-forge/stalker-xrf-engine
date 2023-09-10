import { describe, expect, it } from "@jest/globals";
import { anim, property_storage } from "xray16";

import { ActionMentalDanger } from "@/engine/core/objects/ai/state/mental/ActionMentalDanger";
import type { StalkerStateManager } from "@/engine/core/objects/ai/state/StalkerStateManager";
import { ClientObject } from "@/engine/lib/types";
import { mockClientGameObject } from "@/fixtures/xray";

describe("ActionMentalDanger class", () => {
  it("should correctly perform mental state set", () => {
    const object: ClientObject = mockClientGameObject();
    const action: ActionMentalDanger = new ActionMentalDanger({} as StalkerStateManager);

    action.setup(object, new property_storage());
    action.initialize();

    expect(object.set_mental_state).toHaveBeenCalledWith(anim.danger);

    action.execute();
    expect(object.set_mental_state).toHaveBeenCalledTimes(2);
    expect(object.set_mental_state).toHaveBeenNthCalledWith(2, anim.danger);
  });
});
