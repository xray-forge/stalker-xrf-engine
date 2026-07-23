import { describe, expect, it } from "@jest/globals";
import { GameObject } from "xray16/alias";
import { MockGameObject, MockPropertyStorage } from "xray16/mocks";

import { ActionSmartCoverExit } from "@/engine/core/ai/state/smart_cover/ActionSmartCoverExit";
import { StalkerStateController } from "@/engine/core/ai/state/StalkerStateController";

describe("ActionSmartCoverExit", () => {
  it("clears smart-cover targeting before leaving the cover", () => {
    const object: GameObject = MockGameObject.mock();
    const action = new ActionSmartCoverExit(new StalkerStateController(object));

    action.setup(object, MockPropertyStorage.mock());
    action.initialize();

    expect(object.set_smart_cover_target).toHaveBeenCalledWith();
    expect(object.use_smart_covers_only).toHaveBeenCalledWith(false);
    expect(object.set_smart_cover_target_selector).toHaveBeenCalledWith();
  });
});
