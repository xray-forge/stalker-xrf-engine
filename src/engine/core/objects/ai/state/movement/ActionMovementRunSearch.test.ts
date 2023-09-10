import { describe, expect, it } from "@jest/globals";
import { CSightParams, move, property_storage } from "xray16";

import { ActionMovementRunSearch } from "@/engine/core/objects/ai/state/movement/ActionMovementRunSearch";
import type { StalkerStateManager } from "@/engine/core/objects/ai/state/StalkerStateManager";
import { ClientObject } from "@/engine/lib/types";
import { mockClientGameObject } from "@/fixtures/xray";

describe("ActionMovementRunSearch class", () => {
  it("should correctly perform movement state set", () => {
    const object: ClientObject = mockClientGameObject();
    const action: ActionMovementRunSearch = new ActionMovementRunSearch({
      getObjectLookPositionType: () => CSightParams.eSightTypeDirection,
    } as StalkerStateManager);

    action.setup(object, new property_storage());
    action.initialize();

    expect(object.set_movement_type).toHaveBeenCalledWith(move.run);
    expect(object.set_sight).toHaveBeenCalledWith(CSightParams.eSightTypeDirection, null, 0);

    action.execute();
    expect(object.set_movement_type).toHaveBeenCalledTimes(1);
    expect(object.set_sight).toHaveBeenCalledTimes(1);
  });
});
