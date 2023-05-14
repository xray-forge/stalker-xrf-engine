import { describe, expect, it, jest } from "@jest/globals";
import { vector } from "xray16";

import { registry } from "@/engine/core/database/registry";
import { registerStalker, setStalkerState, unregisterStalker } from "@/engine/core/database/stalker";
import { StalkerBinder } from "@/engine/core/objects";
import { EStalkerState } from "@/engine/core/objects/state";
import { ActionAnimationStart } from "@/engine/core/objects/state/animation/ActionAnimationStart";
import { StalkerStateManager } from "@/engine/core/objects/state/StalkerStateManager";
import { mockClientGameObject } from "@/fixtures/xray";

describe("ActionAnimationStart class", () => {
  it("should correctly perform start action", () => {
    const stalker: StalkerBinder = new StalkerBinder(mockClientGameObject());

    registerStalker(stalker);

    stalker.reinit();

    const manager: StalkerStateManager = registry.objects.get(stalker.object.id()).stateManager as StalkerStateManager;

    jest.spyOn(manager.animation, "setControl");
    jest.spyOn(manager.animation, "setState");

    setStalkerState(stalker.object, EStalkerState.BACKOFF, null, null, {
      look_position: new vector(),
      look_object: null,
    });

    const action: ActionAnimationStart = new ActionAnimationStart(manager);

    action.initialize();

    expect(manager.animation.setControl).toHaveBeenCalled();
    expect(manager.animation.setState).toHaveBeenCalledWith(EStalkerState.BACKOFF);

    unregisterStalker(stalker);
  });
});
