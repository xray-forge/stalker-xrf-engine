import { describe, expect, it, jest } from "@jest/globals";
import { createEmptyVector } from "xray16/lib";
import { MockGameObject, MockPropertyStorage } from "xray16/mocks";

import { ActionAnimstateStart } from "@/engine/core/ai/state/animstate/ActionAnimstateStart";
import { StalkerStateController } from "@/engine/core/ai/state/StalkerStateController";
import { EStalkerState } from "@/engine/core/animation/types";
import { StalkerBinder } from "@/engine/core/binders/creature/StalkerBinder";
import { registry } from "@/engine/core/database/registry";
import { registerStalker, setStalkerState, unregisterStalker } from "@/engine/core/database/stalker";

describe("ActionAnimstateStart", () => {
  it("should correctly perform animation state start action", () => {
    const stalker: StalkerBinder = new StalkerBinder(MockGameObject.mock());

    registerStalker(stalker);

    stalker.reinit();

    const controller: StalkerStateController = registry.objects.get(stalker.object.id())
      .stateController as StalkerStateController;

    jest.spyOn(controller.animstateController, "setControl");
    jest.spyOn(controller.animstateController, "setState");

    setStalkerState(stalker.object, EStalkerState.SIT, null, null, {
      lookPosition: createEmptyVector(),
      lookObjectId: null,
    });

    const action: ActionAnimstateStart = new ActionAnimstateStart(controller);

    action.setup(stalker.object, MockPropertyStorage.mock());
    action.initialize();

    expect(controller.animstateController.setControl).toHaveBeenCalled();
    expect(controller.animstateController.setState).toHaveBeenCalledWith(EStalkerState.SIT);

    unregisterStalker(stalker);
  });
});
