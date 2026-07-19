import { describe, expect, it, jest } from "@jest/globals";
import { GameObject } from "xray16/alias";
import { MockGameObject, MockPropertyStorage } from "xray16/mocks";

import { StalkerStateController } from "@/engine/core/ai/state/StalkerStateController";
import { ActionStateEnd } from "@/engine/core/ai/state/state/ActionStateEnd";

describe("ActionStateEnd", () => {
  it("calls a timed callback once when its timeout begins at timestamp zero", () => {
    const object: GameObject = MockGameObject.mock();
    const controller: StalkerStateController = new StalkerStateController(object);
    const callback = jest.fn();
    const action: ActionStateEnd = new ActionStateEnd(controller);

    action.setup(object, MockPropertyStorage.mock());
    controller.callback = { context: controller, callback, begin: null, timeout: 100, turnEndCallback: null };

    jest.spyOn(Date, "now").mockImplementation(() => 0);
    action.execute();

    jest.spyOn(Date, "now").mockImplementation(() => 100);
    action.execute();

    expect(callback).toHaveBeenCalledWith();
    expect(controller.callback).toBeNull();
  });
});
