import { describe, expect, it } from "@jest/globals";
import { move, property_storage } from "xray16";

import { registry } from "@/engine/core/database/registry";
import { registerStalker, unregisterStalker } from "@/engine/core/database/stalker";
import { StalkerBinder } from "@/engine/core/objects";
import { EvaluatorBodyStateCrouchNow } from "@/engine/core/objects/state/body_state/EvaluatorBodyStateCrouchNow";
import { StalkerStateManager } from "@/engine/core/objects/state/StalkerStateManager";
import { replaceFunctionMock } from "@/fixtures/utils/function_mock";
import { mockClientGameObject } from "@/fixtures/xray";

describe("EvaluatorBodyStateCrouchNow class", () => {
  it("should correctly evaluate body state crouch now", () => {
    const stalker: StalkerBinder = new StalkerBinder(mockClientGameObject());

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
