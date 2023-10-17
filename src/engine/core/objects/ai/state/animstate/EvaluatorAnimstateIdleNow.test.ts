import { describe, expect, it } from "@jest/globals";

import { registry } from "@/engine/core/database/registry";
import { registerStalker, unregisterStalker } from "@/engine/core/database/stalker";
import { EvaluatorAnimstateIdleNow } from "@/engine/core/objects/ai/state/animstate/EvaluatorAnimstateIdleNow";
import { StalkerStateManager } from "@/engine/core/objects/ai/state/StalkerStateManager";
import { EStalkerState } from "@/engine/core/objects/animation/types";
import { StalkerBinder } from "@/engine/core/objects/binders/creature/StalkerBinder";
import { mockGameObject } from "@/fixtures/xray";

describe("EvaluatorAnimstateIdleNow class", () => {
  it("should correctly perform animation state idle now", () => {
    const stalker: StalkerBinder = new StalkerBinder(mockGameObject());

    registerStalker(stalker);

    stalker.reinit();

    const manager: StalkerStateManager = registry.objects.get(stalker.object.id()).stateManager as StalkerStateManager;
    const evaluator: EvaluatorAnimstateIdleNow = new EvaluatorAnimstateIdleNow(manager);

    expect(evaluator.evaluate()).toBeTruthy();

    manager.animstate.state.currentState = EStalkerState.BACKOFF;
    expect(evaluator.evaluate()).toBeFalsy();

    manager.animstate.state.currentState = null;
    expect(evaluator.evaluate()).toBeTruthy();

    unregisterStalker(stalker);
  });
});
