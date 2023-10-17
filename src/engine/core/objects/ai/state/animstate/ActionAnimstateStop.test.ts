import { describe, expect, it, jest } from "@jest/globals";

import { registry } from "@/engine/core/database/registry";
import { registerStalker, setStalkerState, unregisterStalker } from "@/engine/core/database/stalker";
import { ActionAnimstateStop } from "@/engine/core/objects/ai/state/animstate/ActionAnimstateStop";
import { StalkerStateManager } from "@/engine/core/objects/ai/state/StalkerStateManager";
import { EStalkerState } from "@/engine/core/objects/animation/types";
import { StalkerBinder } from "@/engine/core/objects/binders/creature/StalkerBinder";
import { createEmptyVector } from "@/engine/core/utils/vector";
import { mockGameObject, MockPropertyStorage } from "@/fixtures/xray";

describe("ActionAnimstateStop class", () => {
  it("should correctly perform stop animation state action", () => {
    const stalker: StalkerBinder = new StalkerBinder(mockGameObject());

    registerStalker(stalker);

    stalker.reinit();

    const manager: StalkerStateManager = registry.objects.get(stalker.object.id()).stateManager as StalkerStateManager;

    jest.spyOn(manager.animstate, "setControl");
    jest.spyOn(manager.animstate, "setState");

    setStalkerState(stalker.object, EStalkerState.SIT, null, null, {
      lookPosition: createEmptyVector(),
      lookObjectId: null,
    });

    const action: ActionAnimstateStop = new ActionAnimstateStop(manager);

    action.setup(stalker.object, MockPropertyStorage.mock());
    action.initialize();

    expect(manager.animstate.setControl).toHaveBeenCalled();
    expect(manager.animstate.setState).toHaveBeenCalledWith(null, false);

    unregisterStalker(stalker);
  });
});
