import { describe, expect, it } from "@jest/globals";
import { GameObject } from "xray16/alias";
import { MockGameObject, MockPropertyStorage } from "xray16/mocks";

import { StalkerStateController } from "@/engine/core/ai/state/StalkerStateController";
import { ActionStateLocked } from "@/engine/core/ai/state/state/ActionStateLocked";

describe("ActionStateLocked", () => {
  it("keeps the current state unchanged while the planner is locked", () => {
    const object: GameObject = MockGameObject.mock();
    const controller: StalkerStateController = new StalkerStateController(object);
    const action: ActionStateLocked = new ActionStateLocked(controller, "test-lock");

    action.setup(object, MockPropertyStorage.mock());
    action.initialize();
    action.execute();

    expect(controller.getState()).toBe(controller.targetState);
  });
});
