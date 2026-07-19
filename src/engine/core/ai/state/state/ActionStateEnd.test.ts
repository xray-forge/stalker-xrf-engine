import { describe, expect, it, jest } from "@jest/globals";
import { GameObject } from "xray16/alias";
import { MockGameObject, MockPropertyStorage } from "xray16/mocks";

import { StalkerStateManager } from "@/engine/core/ai/state/StalkerStateManager";
import { ActionStateEnd } from "@/engine/core/ai/state/state/ActionStateEnd";

describe("ActionStateEnd", () => {
  it("calls a timed callback once when its timeout begins at timestamp zero", () => {
    const object: GameObject = MockGameObject.mock();
    const stateManager: StalkerStateManager = new StalkerStateManager(object);
    const callback = jest.fn();
    const action: ActionStateEnd = new ActionStateEnd(stateManager);

    action.setup(object, MockPropertyStorage.mock());
    stateManager.callback = { context: stateManager, callback, begin: null, timeout: 100, turnEndCallback: null };

    jest.spyOn(Date, "now").mockImplementation(() => 0);
    action.execute();

    jest.spyOn(Date, "now").mockImplementation(() => 100);
    action.execute();

    expect(callback).toHaveBeenCalledWith();
    expect(stateManager.callback).toBeNull();
  });
});
