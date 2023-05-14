import { describe, expect, it } from "@jest/globals";

import { registry } from "@/engine/core/database/registry";
import { registerStalker, unregisterStalker } from "@/engine/core/database/stalker";
import { StalkerBinder } from "@/engine/core/objects";
import { EStalkerState } from "@/engine/core/objects/state";
import { EvaluatorAnimationNoneNow } from "@/engine/core/objects/state/animation/EvaluatorAnimationNoneNow";
import { StalkerStateManager } from "@/engine/core/objects/state/StalkerStateManager";
import { mockClientGameObject } from "@/fixtures/xray";

describe("EvaluatorAnimation class", () => {
  it("should correctly perform animation check", () => {
    const stalker: StalkerBinder = new StalkerBinder(mockClientGameObject());

    registerStalker(stalker);

    stalker.reinit();

    const manager: StalkerStateManager = registry.objects.get(stalker.object.id()).stateManager as StalkerStateManager;
    const evaluator: EvaluatorAnimationNoneNow = new EvaluatorAnimationNoneNow(manager);

    manager.animation.states.currentState = null;
    expect(evaluator.evaluate()).toBeTruthy();
    manager.animation.states.currentState = EStalkerState.BACKOFF;
    expect(evaluator.evaluate()).toBeFalsy();
    manager.animation.states.currentState = null;
    expect(evaluator.evaluate()).toBeTruthy();

    unregisterStalker(stalker);
  });
});
