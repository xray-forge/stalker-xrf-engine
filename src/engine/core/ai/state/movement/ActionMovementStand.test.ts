import { describe, expect, it } from "@jest/globals";
import { move, property_storage } from "xray16";
import { GameObject } from "xray16/alias";

import { ActionMovementStand } from "@/engine/core/ai/state/movement/ActionMovementStand";
import type { StalkerStateManager } from "@/engine/core/ai/state/StalkerStateManager";
import { MockGameObject } from "@/fixtures/xray";

describe("ActionMovementStand", () => {
  it("should correctly perform movement state set", () => {
    const object: GameObject = MockGameObject.mock();
    const action: ActionMovementStand = new ActionMovementStand({} as StalkerStateManager);

    action.setup(object, new property_storage());
    action.initialize();

    expect(object.set_movement_type).toHaveBeenCalledWith(move.stand);

    action.execute();
    expect(object.set_movement_type).toHaveBeenCalledTimes(1);
  });
});
