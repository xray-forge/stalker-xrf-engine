import { describe, expect, it } from "@jest/globals";

import { EvaluatorAnimationPlayNow } from "@/engine/core/ai/state/animation/EvaluatorAnimationPlayNow";
import { StalkerStateManager } from "@/engine/core/ai/state/StalkerStateManager";
import { EStalkerState } from "@/engine/core/animation/types";
import { StalkerBinder } from "@/engine/core/binders/creature/StalkerBinder";
import { registry } from "@/engine/core/database/registry";
import { registerStalker, unregisterStalker } from "@/engine/core/database/stalker";
import { MockGameObject } from "@/fixtures/xray";

describe("EvaluatorAnimationPlayNow", () => {
  it("should correctly perform animation check", () => {
    const stalker: StalkerBinder = new StalkerBinder(MockGameObject.mock());

    registerStalker(stalker);

    stalker.reinit();

    const manager: StalkerStateManager = registry.objects.get(stalker.object.id()).stateManager as StalkerStateManager;
    const evaluator: EvaluatorAnimationPlayNow = new EvaluatorAnimationPlayNow(manager);

    manager.animation.state.currentState = null;
    expect(evaluator.evaluate()).toBeFalsy();
    manager.animation.state.currentState = EStalkerState.BACKOFF;
    expect(evaluator.evaluate()).toBeTruthy();
    manager.animation.state.currentState = null;
    expect(evaluator.evaluate()).toBeFalsy();

    unregisterStalker(stalker);
  });
});
