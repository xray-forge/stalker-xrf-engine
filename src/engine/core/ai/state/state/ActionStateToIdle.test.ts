import { describe, expect, it } from "@jest/globals";
import { EGameObjectPath, GameObject } from "xray16/alias";
import { MockGameObject, MockPropertyStorage } from "xray16/mocks";

import { StalkerStateController } from "@/engine/core/ai/state/StalkerStateController";
import { ActionStateToIdle } from "@/engine/core/ai/state/state/ActionStateToIdle";
import { EStalkerState } from "@/engine/core/animation/types";

describe("ActionStateToIdle", () => {
  it("returns the object to an idle state and level path", () => {
    const object: GameObject = MockGameObject.mock();
    const controller: StalkerStateController = new StalkerStateController(object);
    const action: ActionStateToIdle = new ActionStateToIdle(controller);

    action.setup(object, MockPropertyStorage.mock());
    controller.targetState = EStalkerState.GUARD;

    action.initialize();
    action.execute();

    expect(object.inactualize_patrol_path).toHaveBeenCalledTimes(1);
    expect(object.set_path_type).toHaveBeenCalledWith(EGameObjectPath.LEVEL_PATH);
    expect(object.clear_animations).toHaveBeenCalled();
    expect(controller.targetState).toBe(EStalkerState.IDLE);
  });
});
