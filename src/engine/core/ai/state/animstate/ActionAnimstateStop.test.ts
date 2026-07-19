import { describe, expect, it, jest } from "@jest/globals";
import { createEmptyVector } from "xray16/lib";
import { MockGameObject, MockPropertyStorage } from "xray16/mocks";

import { ActionAnimstateStop } from "@/engine/core/ai/state/animstate/ActionAnimstateStop";
import { StalkerStateController } from "@/engine/core/ai/state/StalkerStateController";
import { EStalkerState } from "@/engine/core/animation/types";
import { StalkerBinder } from "@/engine/core/binders/creature/StalkerBinder";
import { registry } from "@/engine/core/database/registry";
import { registerStalker, setStalkerState, unregisterStalker } from "@/engine/core/database/stalker";

describe("ActionAnimstateStop", () => {
  it("should correctly perform stop animation state action", () => {
    const stalker: StalkerBinder = new StalkerBinder(MockGameObject.mock());

    registerStalker(stalker);

    stalker.reinit();

    const controller: StalkerStateController = registry.objects.get(stalker.object.id())
      .stateController as StalkerStateController;

    jest.spyOn(controller.animstate, "setControl");
    jest.spyOn(controller.animstate, "setState");

    setStalkerState(stalker.object, EStalkerState.SIT, null, null, {
      lookPosition: createEmptyVector(),
      lookObjectId: null,
    });

    const action: ActionAnimstateStop = new ActionAnimstateStop(controller);

    action.setup(stalker.object, MockPropertyStorage.mock());
    action.initialize();

    expect(controller.animstate.setControl).toHaveBeenCalled();
    expect(controller.animstate.setState).toHaveBeenCalledWith(null, false);

    unregisterStalker(stalker);
  });
});
