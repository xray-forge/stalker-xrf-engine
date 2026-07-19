import { describe, expect, it } from "@jest/globals";
import { MockGameObject } from "xray16/mocks";

import { EvaluatorAnimationPlayNow } from "@/engine/core/ai/state/animation/EvaluatorAnimationPlayNow";
import { StalkerStateController } from "@/engine/core/ai/state/StalkerStateController";
import { EStalkerState } from "@/engine/core/animation/types";
import { StalkerBinder } from "@/engine/core/binders/creature/StalkerBinder";
import { registry } from "@/engine/core/database/registry";
import { registerStalker, unregisterStalker } from "@/engine/core/database/stalker";

describe("EvaluatorAnimationPlayNow", () => {
  it("should correctly perform animation check", () => {
    const stalker: StalkerBinder = new StalkerBinder(MockGameObject.mock());

    registerStalker(stalker);

    stalker.reinit();

    const controller: StalkerStateController = registry.objects.get(stalker.object.id())
      .stateController as StalkerStateController;
    const evaluator: EvaluatorAnimationPlayNow = new EvaluatorAnimationPlayNow(controller);

    controller.animation.state.currentState = null;
    expect(evaluator.evaluate()).toBeFalsy();

    controller.animation.state.currentState = EStalkerState.BACKOFF;
    expect(evaluator.evaluate()).toBeTruthy();

    controller.animation.state.currentState = null;
    expect(evaluator.evaluate()).toBeFalsy();

    unregisterStalker(stalker);
  });
});
