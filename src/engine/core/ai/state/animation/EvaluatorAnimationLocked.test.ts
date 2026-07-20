import { describe, expect, it } from "@jest/globals";
import { MockGameObject } from "xray16/mocks";

import { EvaluatorAnimationLocked } from "@/engine/core/ai/state/animation/EvaluatorAnimationLocked";
import { StalkerStateController } from "@/engine/core/ai/state/StalkerStateController";
import { EAnimationMarker } from "@/engine/core/animation/types";
import { StalkerBinder } from "@/engine/core/binders/creature/StalkerBinder";
import { registry } from "@/engine/core/database/registry";
import { registerStalker, unregisterStalker } from "@/engine/core/database/stalker";

describe("EvaluatorAnimation", () => {
  it("should correctly perform animation check", () => {
    const stalker: StalkerBinder = new StalkerBinder(MockGameObject.mock());

    registerStalker(stalker);

    stalker.reinit();

    const controller: StalkerStateController = registry.objects.get(stalker.object.id())
      .stateController as StalkerStateController;
    const evaluator: EvaluatorAnimationLocked = new EvaluatorAnimationLocked(controller);

    expect(evaluator.evaluate()).toBeFalsy();

    evaluator.controller.animationController.state.animationMarker = EAnimationMarker.IN;
    expect(evaluator.evaluate()).toBeTruthy();

    unregisterStalker(stalker);
  });
});
