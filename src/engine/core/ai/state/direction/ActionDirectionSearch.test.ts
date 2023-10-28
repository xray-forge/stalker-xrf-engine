import { describe, expect, it } from "@jest/globals";
import { CSightParams, property_storage } from "xray16";

import { ActionDirectionSearch } from "@/engine/core/ai/state/direction/ActionDirectionSearch";
import { StalkerStateManager } from "@/engine/core/ai/state/StalkerStateManager";
import { EStalkerState } from "@/engine/core/animation/types";
import { StalkerBinder } from "@/engine/core/binders/creature/StalkerBinder";
import { registry } from "@/engine/core/database/registry";
import { registerStalker, setStalkerState, unregisterStalker } from "@/engine/core/database/stalker";
import { resetFunctionMock } from "@/fixtures/jest";
import { mockGameObject } from "@/fixtures/xray";

describe("ActionDirectionSearch class", () => {
  it("should correctly perform direction search action", () => {
    const stalker: StalkerBinder = new StalkerBinder(mockGameObject());

    registerStalker(stalker);

    stalker.reinit();

    const manager: StalkerStateManager = registry.objects.get(stalker.object.id()).stateManager as StalkerStateManager;
    const action: ActionDirectionSearch = new ActionDirectionSearch(manager);

    setStalkerState(stalker.object, EStalkerState.IDLE);

    action.setup(stalker.object, new property_storage());
    action.initialize();

    expect(stalker.object.set_sight).toHaveBeenCalledWith(undefined, null, 0);
    resetFunctionMock(stalker.object.set_sight);

    setStalkerState(stalker.object, EStalkerState.SMART_COVER);
    action.setup(stalker.object, new property_storage());
    action.initialize();

    expect(stalker.object.set_sight).toHaveBeenCalledWith(CSightParams.eSightTypeAnimationDirection, false, false);

    unregisterStalker(stalker);
  });
});
