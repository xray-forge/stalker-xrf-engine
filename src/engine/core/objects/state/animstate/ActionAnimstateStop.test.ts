import { describe, expect, it, jest } from "@jest/globals";

import { registry } from "@/engine/core/database/registry";
import { registerStalker, setStalkerState, unregisterStalker } from "@/engine/core/database/stalker";
import { StalkerBinder } from "@/engine/core/objects";
import { EStalkerState } from "@/engine/core/objects/animation";
import { ActionAnimstateStop } from "@/engine/core/objects/state/animstate/ActionAnimstateStop";
import { StalkerStateManager } from "@/engine/core/objects/state/StalkerStateManager";
import { createEmptyVector } from "@/engine/core/utils/vector";
import { mockClientGameObject, MockPropertyStorage } from "@/fixtures/xray";

describe("ActionAnimstateStop class", () => {
  it("should correctly perform stop animation state action", () => {
    const stalker: StalkerBinder = new StalkerBinder(mockClientGameObject());

    registerStalker(stalker);

    stalker.reinit();

    const manager: StalkerStateManager = registry.objects.get(stalker.object.id()).stateManager as StalkerStateManager;

    jest.spyOn(manager.animstate, "setControl");
    jest.spyOn(manager.animstate, "setState");

    setStalkerState(stalker.object, EStalkerState.SIT, null, null, {
      lookPosition: createEmptyVector(),
      lookObject: null,
    });

    const action: ActionAnimstateStop = new ActionAnimstateStop(manager);

    action.setup(stalker.object, MockPropertyStorage.mock());
    action.initialize();

    expect(manager.animstate.setControl).toHaveBeenCalled();
    expect(manager.animstate.setState).toHaveBeenCalledWith(null, false);

    unregisterStalker(stalker);
  });
});
