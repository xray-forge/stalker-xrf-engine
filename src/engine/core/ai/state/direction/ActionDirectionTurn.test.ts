import { describe, expect, it } from "@jest/globals";
import { CSightParams, property_storage } from "xray16";

import { ActionDirectionTurn } from "@/engine/core/ai/state/direction/ActionDirectionTurn";
import { StalkerStateManager } from "@/engine/core/ai/state/StalkerStateManager";
import { EStalkerState } from "@/engine/core/animation/types";
import { StalkerBinder } from "@/engine/core/binders/creature/StalkerBinder";
import { registerObject } from "@/engine/core/database";
import { registry } from "@/engine/core/database/registry";
import { registerStalker, setStalkerState, unregisterStalker } from "@/engine/core/database/stalker";
import { createEmptyVector, createVector } from "@/engine/core/utils/vector";
import { GameObject } from "@/engine/lib/types";
import { resetFunctionMock } from "@/fixtures/jest";
import { MockGameObject } from "@/fixtures/xray";

describe("ActionDirectionTurn", () => {
  it("should correctly perform direction turn action", () => {
    const stalker: StalkerBinder = new StalkerBinder(MockGameObject.mock());

    registerStalker(stalker);

    stalker.reinit();

    const manager: StalkerStateManager = registry.objects.get(stalker.object.id()).stateManager as StalkerStateManager;
    const action: ActionDirectionTurn = new ActionDirectionTurn(manager);
    const lookObject: GameObject = MockGameObject.mock();

    registerObject(lookObject);

    setStalkerState(stalker.object, EStalkerState.IDLE, null, null, {
      lookObjectId: lookObject.id(),
    });

    action.setup(stalker.object, new property_storage());
    action.initialize();

    expect(stalker.object.set_sight).toHaveBeenCalledWith(lookObject, true, true);
    resetFunctionMock(stalker.object.set_sight);

    setStalkerState(stalker.object, EStalkerState.SMART_COVER, null, null, {
      lookObjectId: null,
      lookPosition: createEmptyVector(),
    });

    action.setup(stalker.object, new property_storage());
    action.execute();

    expect(stalker.object.set_sight).toHaveBeenCalledWith(CSightParams.eSightTypeAnimationDirection, false, false);
    resetFunctionMock(stalker.object.set_sight);

    setStalkerState(stalker.object, EStalkerState.SNEAK_RUN, null, null, {
      lookObjectId: null,
      lookPosition: createEmptyVector(),
    });

    manager.lookPosition = createVector(0.25, 0.25, 0.25);

    action.setup(stalker.object, new property_storage());
    action.execute();

    expect(stalker.object.set_sight).toHaveBeenCalledWith(
      CSightParams.eSightTypeDirection,
      lookObject.direction(),
      true
    );

    unregisterStalker(stalker);
  });
});
