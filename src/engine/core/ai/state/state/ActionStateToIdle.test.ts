import { describe, expect, it } from "@jest/globals";
import { EGameObjectPath, GameObject } from "xray16/alias";
import { MockGameObject, MockPropertyStorage } from "xray16/mocks";

import { StalkerStateManager } from "@/engine/core/ai/state/StalkerStateManager";
import { ActionStateToIdle } from "@/engine/core/ai/state/state/ActionStateToIdle";
import { EStalkerState } from "@/engine/core/animation/types";

describe("ActionStateToIdle", () => {
  it("returns the object to an idle state and level path", () => {
    const object: GameObject = MockGameObject.mock();
    const stateManager: StalkerStateManager = new StalkerStateManager(object);
    const action: ActionStateToIdle = new ActionStateToIdle(stateManager);

    action.setup(object, MockPropertyStorage.mock());
    stateManager.targetState = EStalkerState.GUARD;

    action.initialize();
    action.execute();

    expect(object.inactualize_patrol_path).toHaveBeenCalledTimes(1);
    expect(object.set_path_type).toHaveBeenCalledWith(EGameObjectPath.LEVEL_PATH);
    expect(object.clear_animations).toHaveBeenCalled();
    expect(stateManager.targetState).toBe(EStalkerState.IDLE);
  });
});
