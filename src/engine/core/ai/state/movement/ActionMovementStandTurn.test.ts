import { describe, expect, it, jest } from "@jest/globals";
import { move, property_storage } from "xray16";
import { GameObject } from "xray16/alias";
import { MockGameObject } from "xray16/mocks";

import { ActionMovementStandTurn } from "@/engine/core/ai/state/movement/ActionMovementStandTurn";
import type { StalkerStateController } from "@/engine/core/ai/state/StalkerStateController";

describe("ActionMovementRunTurn", () => {
  it("should correctly perform movement state set", () => {
    const object: GameObject = MockGameObject.mock();
    const controller: StalkerStateController = { turn: () => {} } as StalkerStateController;
    const action: ActionMovementStandTurn = new ActionMovementStandTurn(controller);

    jest.spyOn(controller, "turn");

    action.setup(object, new property_storage());
    action.initialize();

    expect(object.set_movement_type).toHaveBeenCalledWith(move.stand);
    expect(controller.turn).toHaveBeenCalled();

    action.execute();
    expect(object.set_movement_type).toHaveBeenCalledTimes(1);
    expect(controller.turn).toHaveBeenCalledTimes(1);
  });
});
