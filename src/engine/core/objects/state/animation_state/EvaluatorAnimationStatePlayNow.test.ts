import { describe, expect, it } from "@jest/globals";

import { registry } from "@/engine/core/database/registry";
import { registerStalker, unregisterStalker } from "@/engine/core/database/stalker";
import { StalkerBinder } from "@/engine/core/objects";
import { EStalkerState } from "@/engine/core/objects/animation";
import { EvaluatorAnimationStatePlayNow } from "@/engine/core/objects/state/animation_state/EvaluatorAnimationStatePlayNow";
import { StalkerStateManager } from "@/engine/core/objects/state/StalkerStateManager";
import { mockClientGameObject } from "@/fixtures/xray";

describe("EvaluatorAnimationStatePlayNow class", () => {
  it("should correctly perform animation state play now", () => {
    const stalker: StalkerBinder = new StalkerBinder(mockClientGameObject());

    registerStalker(stalker);

    stalker.reinit();

    const manager: StalkerStateManager = registry.objects.get(stalker.object.id()).stateManager as StalkerStateManager;
    const evaluator: EvaluatorAnimationStatePlayNow = new EvaluatorAnimationStatePlayNow(manager);

    manager.animstate.state.currentState = null;
    expect(evaluator.evaluate()).toBeFalsy();
    manager.animstate.state.currentState = EStalkerState.BACKOFF;
    expect(evaluator.evaluate()).toBeTruthy();
    manager.animstate.state.currentState = null;
    expect(evaluator.evaluate()).toBeFalsy();

    unregisterStalker(stalker);
  });
});
