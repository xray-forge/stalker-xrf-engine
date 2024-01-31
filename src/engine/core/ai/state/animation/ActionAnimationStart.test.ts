import { describe, expect, it, jest } from "@jest/globals";

import { ActionAnimationStart } from "@/engine/core/ai/state/animation/ActionAnimationStart";
import { StalkerStateManager } from "@/engine/core/ai/state/StalkerStateManager";
import { EStalkerState } from "@/engine/core/animation/types";
import { StalkerBinder } from "@/engine/core/binders/creature/StalkerBinder";
import { registry } from "@/engine/core/database/registry";
import { registerStalker, setStalkerState, unregisterStalker } from "@/engine/core/database/stalker";
import { createEmptyVector } from "@/engine/core/utils/vector";
import { MockGameObject, MockPropertyStorage } from "@/fixtures/xray";

describe("ActionAnimationStart", () => {
  it("should correctly perform start action", () => {
    const stalker: StalkerBinder = new StalkerBinder(MockGameObject.mock());

    registerStalker(stalker);

    stalker.reinit();

    const manager: StalkerStateManager = registry.objects.get(stalker.object.id()).stateManager as StalkerStateManager;

    jest.spyOn(manager.animation, "setControl");
    jest.spyOn(manager.animation, "setState");

    setStalkerState(stalker.object, EStalkerState.CAUTION, null, null, {
      lookPosition: createEmptyVector(),
      lookObjectId: null,
    });

    const action: ActionAnimationStart = new ActionAnimationStart(manager);

    action.setup(stalker.object, MockPropertyStorage.mock());
    action.initialize();

    expect(manager.animation.setControl).toHaveBeenCalled();
    expect(manager.animation.setState).toHaveBeenCalledWith(EStalkerState.CAUTION);

    unregisterStalker(stalker);
  });
});
