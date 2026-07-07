import { describe, expect, it, jest } from "@jest/globals";
import { move, property_storage } from "xray16";
import { GameObject } from "xray16/alias";
import { MockGameObject } from "xray16/mocks";

import { ActionMovementRunTurn } from "@/engine/core/ai/state/movement/ActionMovementRunTurn";
import type { StalkerStateManager } from "@/engine/core/ai/state/StalkerStateManager";

describe("ActionMovementRunTurn", () => {
  it("should correctly perform movement state set", () => {
    const object: GameObject = MockGameObject.mock();
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
