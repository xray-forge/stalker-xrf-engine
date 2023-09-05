import { describe, expect, it, jest } from "@jest/globals";

import { registry } from "@/engine/core/database/registry";
import { registerStalker, setStalkerState, unregisterStalker } from "@/engine/core/database/stalker";
import { ActionAnimstateStart } from "@/engine/core/objects/ai/state/animstate/ActionAnimstateStart";
import { StalkerStateManager } from "@/engine/core/objects/ai/state/StalkerStateManager";
import { EStalkerState } from "@/engine/core/objects/animation";
import { StalkerBinder } from "@/engine/core/objects/binders/creature/StalkerBinder";
import { createEmptyVector } from "@/engine/core/utils/vector";
import { mockClientGameObject, MockPropertyStorage } from "@/fixtures/xray";

describe("ActionAnimstateStart class", () => {
  it("should correctly perform animation state start action", () => {
    const stalker: StalkerBinder = new StalkerBinder(mockClientGameObject());

    registerStalker(stalker);

    stalker.reinit();

    const manager: StalkerStateManager = registry.objects.get(stalker.object.id()).stateManager as StalkerStateManager;

    jest.spyOn(manager.animstate, "setControl");
    jest.spyOn(manager.animstate, "setState");

    setStalkerState(stalker.object, EStalkerState.SIT, null, null, {
      lookPosition: createEmptyVector(),
      lookObjectId: null,
    });

    const action: ActionAnimstateStart = new ActionAnimstateStart(manager);

    action.setup(stalker.object, MockPropertyStorage.mock());
    action.initialize();

    expect(manager.animstate.setControl).toHaveBeenCalled();
    expect(manager.animstate.setState).toHaveBeenCalledWith(EStalkerState.SIT);

    unregisterStalker(stalker);
  });
});
