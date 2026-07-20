import { describe, expect, it, jest } from "@jest/globals";
import { createEmptyVector } from "xray16/lib";
import { MockGameObject, MockPropertyStorage } from "xray16/mocks";

import { ActionAnimationStart } from "@/engine/core/ai/state/animation/ActionAnimationStart";
import { StalkerStateController } from "@/engine/core/ai/state/StalkerStateController";
import { EStalkerState } from "@/engine/core/animation/types";
import { StalkerBinder } from "@/engine/core/binders/creature/StalkerBinder";
import { registry } from "@/engine/core/database/registry";
import { registerStalker, setStalkerState, unregisterStalker } from "@/engine/core/database/stalker";

describe("ActionAnimationStart", () => {
  it("should correctly perform start action", () => {
    const stalker: StalkerBinder = new StalkerBinder(MockGameObject.mock());

    registerStalker(stalker);

    stalker.reinit();

    const controller: StalkerStateController = registry.objects.get(stalker.object.id())
      .stateController as StalkerStateController;

    jest.spyOn(controller.animationController, "setControl");
    jest.spyOn(controller.animationController, "setState");

    setStalkerState(stalker.object, EStalkerState.CAUTION, null, null, {
      lookPosition: createEmptyVector(),
      lookObjectId: null,
    });

    const action: ActionAnimationStart = new ActionAnimationStart(controller);

    action.setup(stalker.object, MockPropertyStorage.mock());
    action.initialize();

    expect(controller.animationController.setControl).toHaveBeenCalled();
    expect(controller.animationController.setState).toHaveBeenCalledWith(EStalkerState.CAUTION);

    unregisterStalker(stalker);
  });
});
