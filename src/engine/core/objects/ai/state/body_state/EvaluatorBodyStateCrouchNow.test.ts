import { describe, expect, it } from "@jest/globals";
import { move, property_storage } from "xray16";

import { registry } from "@/engine/core/database/registry";
import { registerStalker, unregisterStalker } from "@/engine/core/database/stalker";
import { EvaluatorBodyStateCrouchNow } from "@/engine/core/objects/ai/state/body_state/EvaluatorBodyStateCrouchNow";
import { StalkerStateManager } from "@/engine/core/objects/ai/state/StalkerStateManager";
import { StalkerBinder } from "@/engine/core/objects/binders/creature/StalkerBinder";
import { replaceFunctionMock } from "@/fixtures/jest";
import { mockGameObject } from "@/fixtures/xray";

describe("EvaluatorBodyStateCrouchNow class", () => {
  it("should correctly evaluate body state crouch now", () => {
    const stalker: StalkerBinder = new StalkerBinder(mockGameObject());

    registerStalker(stalker);

    stalker.reinit();

    const manager: StalkerStateManager = registry.objects.get(stalker.object.id()).stateManager as StalkerStateManager;
    const evaluator: EvaluatorBodyStateCrouchNow = new EvaluatorBodyStateCrouchNow(manager);

    evaluator.setup(stalker.object, new property_storage());

    replaceFunctionMock(stalker.object.target_body_state, () => move.crouch);
    expect(evaluator.evaluate()).toBeTruthy();

    replaceFunctionMock(stalker.object.target_body_state, () => move.standing);
    expect(evaluator.evaluate()).toBeFalsy();

    unregisterStalker(stalker);
  });
});
