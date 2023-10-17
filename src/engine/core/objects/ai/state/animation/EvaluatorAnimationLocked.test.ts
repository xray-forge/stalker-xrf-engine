import { describe, expect, it } from "@jest/globals";

import { registry } from "@/engine/core/database/registry";
import { registerStalker, unregisterStalker } from "@/engine/core/database/stalker";
import { EvaluatorAnimationLocked } from "@/engine/core/objects/ai/state/animation/EvaluatorAnimationLocked";
import { StalkerStateManager } from "@/engine/core/objects/ai/state/StalkerStateManager";
import { EAnimationMarker } from "@/engine/core/objects/animation/types";
import { StalkerBinder } from "@/engine/core/objects/binders/creature/StalkerBinder";
import { mockGameObject } from "@/fixtures/xray";

describe("EvaluatorAnimation class", () => {
  it("should correctly perform animation check", () => {
    const stalker: StalkerBinder = new StalkerBinder(mockGameObject());

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
