import { describe, expect, it } from "@jest/globals";
import { CSightParams, property_storage } from "xray16";

import { registry } from "@/engine/core/database/registry";
import { registerStalker, setStalkerState, unregisterStalker } from "@/engine/core/database/stalker";
import { StalkerBinder } from "@/engine/core/objects";
import { EStalkerState } from "@/engine/core/objects/animation";
import { ActionDirectionSearch } from "@/engine/core/objects/state/direction/ActionDirectionSearch";
import { StalkerStateManager } from "@/engine/core/objects/state/StalkerStateManager";
import { resetFunctionMock } from "@/fixtures/utils/function_mock";
import { mockClientGameObject } from "@/fixtures/xray";

describe("ActionDirectionSearch class", () => {
  it("should correctly perform direction search action", () => {
    const stalker: StalkerBinder = new StalkerBinder(mockClientGameObject());

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
