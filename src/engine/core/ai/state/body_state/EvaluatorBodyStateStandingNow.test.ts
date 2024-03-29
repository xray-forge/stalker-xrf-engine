import { describe, expect, it } from "@jest/globals";
import { move, property_storage } from "xray16";

import { EvaluatorBodyStateStandingNow } from "@/engine/core/ai/state/body_state/EvaluatorBodyStateStandingNow";
import { StalkerStateManager } from "@/engine/core/ai/state/StalkerStateManager";
import { StalkerBinder } from "@/engine/core/binders/creature/StalkerBinder";
import { registry } from "@/engine/core/database/registry";
import { registerStalker, unregisterStalker } from "@/engine/core/database/stalker";
import { replaceFunctionMock } from "@/fixtures/jest";
import { MockGameObject } from "@/fixtures/xray";

describe("EvaluatorBodyStateStandingNow", () => {
  it("should correctly evaluate standing now", () => {
    const stalker: StalkerBinder = new StalkerBinder(MockGameObject.mock());

    registerStalker(stalker);

    stalker.reinit();

    const manager: StalkerStateManager = registry.objects.get(stalker.object.id()).stateManager as StalkerStateManager;
    const evaluator: EvaluatorBodyStateStandingNow = new EvaluatorBodyStateStandingNow(manager);

    evaluator.setup(stalker.object, new property_storage());

    replaceFunctionMock(stalker.object.target_body_state, () => move.standing);
    expect(evaluator.evaluate()).toBeTruthy();

    replaceFunctionMock(stalker.object.target_body_state, () => move.crouch);
    expect(evaluator.evaluate()).toBeFalsy();

    unregisterStalker(stalker);
  });
});
