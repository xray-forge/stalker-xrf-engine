import { describe, expect, it } from "@jest/globals";
import { move, property_storage } from "xray16";
import { GameObject } from "xray16/alias";
import { MockGameObject } from "xray16/mocks";

import { ActionMovementStand } from "@/engine/core/ai/state/movement/ActionMovementStand";
import type { StalkerStateController } from "@/engine/core/ai/state/StalkerStateController";

describe("ActionMovementStand", () => {
  it("should correctly perform movement state set", () => {
    const object: GameObject = MockGameObject.mock();
    const action: ActionMovementStand = new ActionMovementStand({} as StalkerStateController);

    action.setup(object, new property_storage());
    action.initialize();

    expect(object.set_movement_type).toHaveBeenCalledWith(move.stand);

    action.execute();
    expect(object.set_movement_type).toHaveBeenCalledTimes(1);
  });
});
