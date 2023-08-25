import { describe, expect, it } from "@jest/globals";

import { registry } from "@/engine/core/database/registry";
import { StalkerBinder } from "@/engine/core/objects";
import { EvaluatorAnimstate } from "@/engine/core/objects/ai/state/animstate/EvaluatorAnimstate";
import { StalkerStateManager } from "@/engine/core/objects/ai/state/StalkerStateManager";
import { EStalkerState } from "@/engine/core/objects/animation";
import { mockClientGameObject } from "@/fixtures/xray";

describe("EvaluatorAnimstate class", () => {
  it("should correctly perform animation state check", () => {
    const stalker: StalkerBinder = new StalkerBinder(mockClientGameObject());

    stalker.reinit();

    const manager: StalkerStateManager = registry.objects.get(stalker.object.id()).stateManager as StalkerStateManager;
    const evaluator: EvaluatorAnimstate = new EvaluatorAnimstate(manager);

    expect(manager.animstate.state.currentState).toBeNull();
    expect(evaluator.evaluate()).toBeTruthy();

    manager.animstate.state.currentState = EStalkerState.BACKOFF;
    expect(evaluator.evaluate()).toBeFalsy();
  });
});
