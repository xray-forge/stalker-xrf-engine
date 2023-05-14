import { describe, expect, it } from "@jest/globals";

import { registry } from "@/engine/core/database/registry";
import { StalkerBinder } from "@/engine/core/objects";
import { EStalkerState } from "@/engine/core/objects/state";
import { EvaluatorAnimationState } from "@/engine/core/objects/state/animation_state/EvaluatorAnimationState";
import { StalkerStateManager } from "@/engine/core/objects/state/StalkerStateManager";
import { mockClientGameObject } from "@/fixtures/xray";

describe("EvaluatorAnimationState class", () => {
  it("should correctly perform animation state check", () => {
    const stalker: StalkerBinder = new StalkerBinder(mockClientGameObject());

    stalker.reinit();

    const manager: StalkerStateManager = registry.objects.get(stalker.object.id()).stateManager as StalkerStateManager;
    const evaluator: EvaluatorAnimationState = new EvaluatorAnimationState(manager);

    expect(manager.animstate.states.currentState).toBeNull();
    expect(evaluator.evaluate()).toBeTruthy();

    manager.animstate.states.currentState = EStalkerState.BACKOFF;
    expect(evaluator.evaluate()).toBeFalsy();
  });
});
