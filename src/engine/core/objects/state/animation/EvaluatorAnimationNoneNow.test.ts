import { describe, expect, it } from "@jest/globals";

import { registry } from "@/engine/core/database/registry";
import { registerStalker, unregisterStalker } from "@/engine/core/database/stalker";
import { StalkerBinder } from "@/engine/core/objects";
import { EStalkerState } from "@/engine/core/objects/animation";
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

    manager.animation.state.currentState = null;
    expect(evaluator.evaluate()).toBeTruthy();
    manager.animation.state.currentState = EStalkerState.BACKOFF;
    expect(evaluator.evaluate()).toBeFalsy();
    manager.animation.state.currentState = null;
    expect(evaluator.evaluate()).toBeTruthy();

    unregisterStalker(stalker);
  });
});
