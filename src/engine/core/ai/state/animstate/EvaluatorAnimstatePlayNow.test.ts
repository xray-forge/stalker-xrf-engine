import { describe, expect, it } from "@jest/globals";

import { EvaluatorAnimstatePlayNow } from "@/engine/core/ai/state/animstate/EvaluatorAnimstatePlayNow";
import { StalkerStateManager } from "@/engine/core/ai/state/StalkerStateManager";
import { EStalkerState } from "@/engine/core/animation/types";
import { StalkerBinder } from "@/engine/core/binders/creature/StalkerBinder";
import { registry } from "@/engine/core/database/registry";
import { registerStalker, unregisterStalker } from "@/engine/core/database/stalker";
import { mockGameObject } from "@/fixtures/xray";

describe("EvaluatorAnimstatePlayNow class", () => {
  it("should correctly perform animation state play now", () => {
    const stalker: StalkerBinder = new StalkerBinder(mockGameObject());

    registerStalker(stalker);

    stalker.reinit();

    const manager: StalkerStateManager = registry.objects.get(stalker.object.id()).stateManager as StalkerStateManager;
    const evaluator: EvaluatorAnimstatePlayNow = new EvaluatorAnimstatePlayNow(manager);

    manager.animstate.state.currentState = null;
    expect(evaluator.evaluate()).toBeFalsy();
    manager.animstate.state.currentState = EStalkerState.BACKOFF;
    expect(evaluator.evaluate()).toBeTruthy();
    manager.animstate.state.currentState = null;
    expect(evaluator.evaluate()).toBeFalsy();

    unregisterStalker(stalker);
  });
});
