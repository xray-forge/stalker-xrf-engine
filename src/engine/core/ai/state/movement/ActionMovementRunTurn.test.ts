import { describe, expect, it, jest } from "@jest/globals";
import { move, property_storage } from "xray16";

import { ActionMovementRunTurn } from "@/engine/core/ai/state/movement/ActionMovementRunTurn";
import type { StalkerStateManager } from "@/engine/core/ai/state/StalkerStateManager";
import { GameObject } from "@/engine/lib/types";
import { mockGameObject } from "@/fixtures/xray";

describe("ActionMovementRunTurn class", () => {
  it("should correctly perform movement state set", () => {
    const object: GameObject = mockGameObject();
    const stateManager: StalkerStateManager = {
      turn: () => {},
    } as StalkerStateManager;
    const action: ActionMovementRunTurn = new ActionMovementRunTurn(stateManager);

    jest.spyOn(stateManager, "turn");

    action.setup(object, new property_storage());
    action.initialize();

    expect(object.set_movement_type).toHaveBeenCalledWith(move.run);
    expect(stateManager.turn).toHaveBeenCalled();

    action.execute();
    expect(object.set_movement_type).toHaveBeenCalledTimes(1);
    expect(stateManager.turn).toHaveBeenCalledTimes(1);
  });
});
