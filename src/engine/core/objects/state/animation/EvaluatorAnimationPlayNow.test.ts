import { describe, expect, it } from "@jest/globals";

import { registry } from "@/engine/core/database/registry";
import { registerStalker, unregisterStalker } from "@/engine/core/database/stalker";
import { StalkerBinder } from "@/engine/core/objects";
import { EStalkerState } from "@/engine/core/objects/state";
import { EvaluatorAnimationPlayNow } from "@/engine/core/objects/state/animation/EvaluatorAnimationPlayNow";
import { StalkerStateManager } from "@/engine/core/objects/state/StalkerStateManager";
import { mockClientGameObject } from "@/fixtures/xray";

describe("EvaluatorAnimationPlayNow class", () => {
  it("should correctly perform animation check", () => {
    const stalker: StalkerBinder = new StalkerBinder(mockClientGameObject());

    registerStalker(stalker);

    stalker.reinit();

    const manager: StalkerStateManager = registry.objects.get(stalker.object.id()).stateManager as StalkerStateManager;
    const evaluator: EvaluatorAnimationPlayNow = new EvaluatorAnimationPlayNow(manager);

    manager.animation.states.currentState = null;
    expect(evaluator.evaluate()).toBeFalsy();
    manager.animation.states.currentState = EStalkerState.BACKOFF;
    expect(evaluator.evaluate()).toBeTruthy();
    manager.animation.states.currentState = null;
    expect(evaluator.evaluate()).toBeFalsy();

    unregisterStalker(stalker);
  });
});
