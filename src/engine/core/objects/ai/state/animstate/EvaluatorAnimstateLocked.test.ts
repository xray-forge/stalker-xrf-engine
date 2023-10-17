import { describe, expect, it } from "@jest/globals";

import { registry } from "@/engine/core/database/registry";
import { registerStalker, unregisterStalker } from "@/engine/core/database/stalker";
import { EvaluatorAnimstateLocked } from "@/engine/core/objects/ai/state/animstate/EvaluatorAnimstateLocked";
import { StalkerStateManager } from "@/engine/core/objects/ai/state/StalkerStateManager";
import { EAnimationMarker } from "@/engine/core/objects/animation/types/animation_types";
import { StalkerBinder } from "@/engine/core/objects/binders/creature/StalkerBinder";
import { mockGameObject } from "@/fixtures/xray";

describe("EvaluatorAnimstateLocked class", () => {
  it("should correctly perform animation locked state", () => {
    const stalker: StalkerBinder = new StalkerBinder(mockGameObject());

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
