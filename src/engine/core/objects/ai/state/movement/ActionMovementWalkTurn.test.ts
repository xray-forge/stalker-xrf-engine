import { describe, expect, it, jest } from "@jest/globals";
import { move, property_storage } from "xray16";

import { ActionMovementWalkTurn } from "@/engine/core/objects/ai/state/movement/ActionMovementWalkTurn";
import type { StalkerStateManager } from "@/engine/core/objects/ai/state/StalkerStateManager";
import { GameObject } from "@/engine/lib/types";
import { mockGameObject } from "@/fixtures/xray";

describe("ActionMovementWalkTurn class", () => {
  it("should correctly perform movement state set", () => {
    const object: GameObject = mockGameObject();
    const stateManager: StalkerStateManager = {
      turn: () => {},
    } as StalkerStateManager;
    const action: ActionMovementWalkTurn = new ActionMovementWalkTurn(stateManager);

    jest.spyOn(stateManager, "turn");

    action.setup(object, new property_storage());
    action.initialize();

    expect(object.set_movement_type).toHaveBeenCalledWith(move.walk);
    expect(stateManager.turn).toHaveBeenCalled();

    action.execute();
    expect(object.set_movement_type).toHaveBeenCalledTimes(1);
    expect(stateManager.turn).toHaveBeenCalledTimes(1);
  });
});
