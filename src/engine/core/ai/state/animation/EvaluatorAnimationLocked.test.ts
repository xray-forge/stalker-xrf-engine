import { describe, expect, it } from "@jest/globals";

import { EvaluatorAnimationLocked } from "@/engine/core/ai/state/animation/EvaluatorAnimationLocked";
import { StalkerStateManager } from "@/engine/core/ai/state/StalkerStateManager";
import { EAnimationMarker } from "@/engine/core/animation/types";
import { StalkerBinder } from "@/engine/core/binders/creature/StalkerBinder";
import { registry } from "@/engine/core/database/registry";
import { registerStalker, unregisterStalker } from "@/engine/core/database/stalker";
import { MockGameObject } from "@/fixtures/xray";

describe("EvaluatorAnimation", () => {
  it("should correctly perform animation check", () => {
    const stalker: StalkerBinder = new StalkerBinder(MockGameObject.mock());

    registerStalker(stalker);

    stalker.reinit();

    const manager: StalkerStateManager = registry.objects.get(stalker.object.id()).stateManager as StalkerStateManager;
    const evaluator: EvaluatorAnimationLocked = new EvaluatorAnimationLocked(manager);

    expect(evaluator.evaluate()).toBeFalsy();

    evaluator.stateManager.animation.state.animationMarker = EAnimationMarker.IN;
    expect(evaluator.evaluate()).toBeTruthy();

    unregisterStalker(stalker);
  });
});
