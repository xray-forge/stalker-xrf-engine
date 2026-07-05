import { describe, expect, it } from "@jest/globals";
import { CSightParams, property_storage } from "xray16";
import { TLookType } from "xray16/alias";

import { ActionDirectionSearch } from "@/engine/core/ai/state/direction/ActionDirectionSearch";
import { StalkerStateManager } from "@/engine/core/ai/state/StalkerStateManager";
import { EStalkerState } from "@/engine/core/animation/types";
import { StalkerBinder } from "@/engine/core/binders/creature/StalkerBinder";
import { registry } from "@/engine/core/database/registry";
import { registerStalker, setStalkerState, unregisterStalker } from "@/engine/core/database/stalker";
import { MockGameObject } from "@/fixtures/xray";

describe("ActionDirectionSearch", () => {
  it("should set animation direction sight for states with animation direction", () => {
    const stalker: StalkerBinder = new StalkerBinder(MockGameObject.mock());

    registerStalker(stalker);

    stalker.reinit();

    const manager: StalkerStateManager = registry.objects.get(stalker.object.id()).stateManager as StalkerStateManager;
    const action: ActionDirectionSearch = new ActionDirectionSearch(manager);

    setStalkerState(stalker.object, EStalkerState.SMART_COVER);

    action.setup(stalker.object, new property_storage());
    action.initialize();

    expect(stalker.object.set_sight).toHaveBeenCalledTimes(1);
    expect(stalker.object.set_sight).toHaveBeenCalledWith(CSightParams.eSightTypeAnimationDirection, false, false);

    unregisterStalker(stalker);
  });

  it("should set resolved look position type sight for states without animation direction", () => {
    const stalker: StalkerBinder = new StalkerBinder(MockGameObject.mock());

    registerStalker(stalker);
    stalker.reinit();

    const manager: StalkerStateManager = registry.objects.get(stalker.object.id()).stateManager as StalkerStateManager;
    const action: ActionDirectionSearch = new ActionDirectionSearch(manager);

    setStalkerState(stalker.object, EStalkerState.IDLE);

    action.setup(stalker.object, new property_storage());

    const lookType: TLookType = manager.getObjectLookPositionType();

    action.initialize();

    expect(stalker.object.set_sight).toHaveBeenCalledTimes(1);
    expect(stalker.object.set_sight).toHaveBeenCalledWith(lookType, null, 0);

    unregisterStalker(stalker);
  });
});
