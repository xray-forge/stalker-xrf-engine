import { describe, expect, it } from "@jest/globals";
import { MockGameObject } from "xray16/mocks";

import { EvaluatorAnimstateIdleNow } from "@/engine/core/ai/state/animstate/EvaluatorAnimstateIdleNow";
import { StalkerStateController } from "@/engine/core/ai/state/StalkerStateController";
import { EStalkerState } from "@/engine/core/animation/types";
import { StalkerBinder } from "@/engine/core/binders/creature/StalkerBinder";
import { registry } from "@/engine/core/database/registry";
import { registerStalker, unregisterStalker } from "@/engine/core/database/stalker";

describe("EvaluatorAnimstateIdleNow", () => {
  it("should correctly perform animation state idle now", () => {
    const stalker: StalkerBinder = new StalkerBinder(MockGameObject.mock());

    registerStalker(stalker);

    stalker.reinit();

    const controller: StalkerStateController = registry.objects.get(stalker.object.id())
      .stateController as StalkerStateController;
    const evaluator: EvaluatorAnimstateIdleNow = new EvaluatorAnimstateIdleNow(controller);

    expect(evaluator.evaluate()).toBeTruthy();

    controller.animstateController.state.currentState = EStalkerState.BACKOFF;
    expect(evaluator.evaluate()).toBeFalsy();

    controller.animstateController.state.currentState = null;
    expect(evaluator.evaluate()).toBeTruthy();

    unregisterStalker(stalker);
  });
});
