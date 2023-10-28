import { describe, expect, it } from "@jest/globals";

import { EvaluatorAnimstate } from "@/engine/core/ai/state/animstate/EvaluatorAnimstate";
import { StalkerStateManager } from "@/engine/core/ai/state/StalkerStateManager";
import { EStalkerState } from "@/engine/core/animation/types";
import { StalkerBinder } from "@/engine/core/binders/creature/StalkerBinder";
import { registry } from "@/engine/core/database/registry";
import { mockGameObject } from "@/fixtures/xray";

describe("EvaluatorAnimstate class", () => {
  it("should correctly perform animation state check", () => {
    const stalker: StalkerBinder = new StalkerBinder(mockGameObject());

    stalker.reinit();

    const manager: StalkerStateManager = registry.objects.get(stalker.object.id()).stateManager as StalkerStateManager;
    const evaluator: EvaluatorAnimstate = new EvaluatorAnimstate(manager);

    expect(manager.animstate.state.currentState).toBeNull();
    expect(evaluator.evaluate()).toBeTruthy();

    manager.animstate.state.currentState = EStalkerState.BACKOFF;
    expect(evaluator.evaluate()).toBeFalsy();
  });
});
