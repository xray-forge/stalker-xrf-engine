import { describe, expect, it } from "@jest/globals";
import { move, property_storage } from "xray16";

import { ActionMovementRun } from "@/engine/core/ai/state/movement/ActionMovementRun";
import type { StalkerStateManager } from "@/engine/core/ai/state/StalkerStateManager";
import { GameObject } from "@/engine/lib/types";
import { mockGameObject } from "@/fixtures/xray";

describe("ActionMovementRun class", () => {
  it("should correctly perform movement state set", () => {
    const object: GameObject = mockGameObject();
    const action: ActionMovementRun = new ActionMovementRun({} as StalkerStateManager);

    action.setup(object, new property_storage());
    action.initialize();

    expect(object.set_movement_type).toHaveBeenCalledWith(move.run);

    action.execute();
    expect(object.set_movement_type).toHaveBeenCalledTimes(1);
  });
});
