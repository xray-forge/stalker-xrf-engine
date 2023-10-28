import { describe, expect, it } from "@jest/globals";
import { move, property_storage } from "xray16";

import { EvaluatorBodyStateSet } from "@/engine/core/ai/state/body_state/EvaluatorBodyStateSet";
import { StalkerStateManager } from "@/engine/core/ai/state/StalkerStateManager";
import { EStalkerState } from "@/engine/core/animation/types";
import { StalkerBinder } from "@/engine/core/binders/creature/StalkerBinder";
import { registry } from "@/engine/core/database/registry";
import { registerStalker, setStalkerState, unregisterStalker } from "@/engine/core/database/stalker";
import { replaceFunctionMock } from "@/fixtures/jest";
import { mockGameObject } from "@/fixtures/xray";

describe("EvaluatorBodyStateSet class", () => {
  it("should correctly evaluate body state", () => {
    const stalker: StalkerBinder = new StalkerBinder(mockGameObject());

    registerStalker(stalker);

    stalker.reinit();

    const manager: StalkerStateManager = registry.objects.get(stalker.object.id()).stateManager as StalkerStateManager;
    const evaluator: EvaluatorBodyStateSet = new EvaluatorBodyStateSet(manager);

    replaceFunctionMock(stalker.object.target_body_state, () => move.crouch);

    evaluator.setup(stalker.object, new property_storage());
    expect(evaluator.evaluate()).toBeTruthy();

    setStalkerState(stalker.object, EStalkerState.RAID_FIRE);
    expect(evaluator.evaluate()).toBeFalsy();

    setStalkerState(stalker.object, EStalkerState.SNEAK);
    expect(evaluator.evaluate()).toBeTruthy();

    unregisterStalker(stalker);
  });
});
