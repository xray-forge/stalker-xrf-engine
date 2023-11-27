import { describe, expect, it } from "@jest/globals";

import { EvaluatorAnimstateLocked } from "@/engine/core/ai/state/animstate/EvaluatorAnimstateLocked";
import { StalkerStateManager } from "@/engine/core/ai/state/StalkerStateManager";
import { EAnimationMarker } from "@/engine/core/animation/types/animation_types";
import { StalkerBinder } from "@/engine/core/binders/creature/StalkerBinder";
import { registry } from "@/engine/core/database/registry";
import { registerStalker, unregisterStalker } from "@/engine/core/database/stalker";
import { MockGameObject } from "@/fixtures/xray";

describe("EvaluatorAnimstateLocked class", () => {
  it("should correctly perform animation locked state", () => {
    const stalker: StalkerBinder = new StalkerBinder(MockGameObject.mock());

    registerStalker(stalker);

    stalker.reinit();

    const manager: StalkerStateManager = registry.objects.get(stalker.object.id()).stateManager as StalkerStateManager;
    const evaluator: EvaluatorAnimstateLocked = new EvaluatorAnimstateLocked(manager);

    expect(evaluator.evaluate()).toBeFalsy();

    manager.animstate.state.animationMarker = EAnimationMarker.IN;
    expect(evaluator.evaluate()).toBeTruthy();

    manager.animstate.state.animationMarker = EAnimationMarker.OUT;
    expect(evaluator.evaluate()).toBeTruthy();

    manager.animstate.state.animationMarker = EAnimationMarker.IDLE;
    expect(evaluator.evaluate()).toBeFalsy();

    manager.animstate.state.animationMarker = null;
    expect(evaluator.evaluate()).toBeFalsy();

    unregisterStalker(stalker);
  });
});
