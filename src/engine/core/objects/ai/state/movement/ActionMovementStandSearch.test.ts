import { describe, expect, it } from "@jest/globals";
import { CSightParams, move, property_storage } from "xray16";

import { ActionMovementStandSearch } from "@/engine/core/objects/ai/state/movement/ActionMovementStandSearch";
import type { StalkerStateManager } from "@/engine/core/objects/ai/state/StalkerStateManager";
import { GameObject } from "@/engine/lib/types";
import { mockGameObject } from "@/fixtures/xray";

describe("ActionMovementStandSearch class", () => {
  it("should correctly perform movement state set", () => {
    const object: GameObject = mockGameObject();
    const action: ActionMovementStandSearch = new ActionMovementStandSearch({
      getObjectLookPositionType: () => CSightParams.eSightTypeDirection,
    } as StalkerStateManager);

    action.setup(object, new property_storage());
    action.initialize();

    expect(object.set_movement_type).toHaveBeenCalledWith(move.stand);
    expect(object.set_sight).toHaveBeenCalledWith(CSightParams.eSightTypeDirection, null, 0);

    action.execute();
    expect(object.set_movement_type).toHaveBeenCalledTimes(1);
    expect(object.set_sight).toHaveBeenCalledTimes(1);
  });
});
