import { describe, expect, it } from "@jest/globals";
import { GameObject } from "xray16/alias";
import { MockGameObject, MockPropertyStorage } from "xray16/mocks";

import { StalkerStateManager } from "@/engine/core/ai/state/StalkerStateManager";
import { ActionStateLocked } from "@/engine/core/ai/state/state/ActionStateLocked";

describe("ActionStateLocked", () => {
  it("keeps the current state unchanged while the planner is locked", () => {
    const object: GameObject = MockGameObject.mock();
    const stateManager: StalkerStateManager = new StalkerStateManager(object);
    const action: ActionStateLocked = new ActionStateLocked(stateManager, "test-lock");

    action.setup(object, MockPropertyStorage.mock());
    action.initialize();
    action.execute();

    expect(stateManager.getState()).toBe(stateManager.targetState);
  });
});
