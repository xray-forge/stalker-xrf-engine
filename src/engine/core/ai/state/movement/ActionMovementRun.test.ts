import { describe, expect, it } from "@jest/globals";
import { move, property_storage } from "xray16";

import { ActionMovementRun } from "@/engine/core/ai/state/movement/ActionMovementRun";
import type { StalkerStateManager } from "@/engine/core/ai/state/StalkerStateManager";
import { GameObject } from "@/engine/lib/types";
import { MockGameObject } from "@/fixtures/xray";

describe("ActionMovementRun", () => {
  it("should correctly perform movement state set", () => {
    const object: GameObject = MockGameObject.mock();
    const action: ActionMovementRun = new ActionMovementRun({} as StalkerStateManager);

    action.setup(object, new property_storage());
    action.initialize();

    expect(object.set_movement_type).toHaveBeenCalledWith(move.run);

    action.execute();
    expect(object.set_movement_type).toHaveBeenCalledTimes(1);
  });
});
