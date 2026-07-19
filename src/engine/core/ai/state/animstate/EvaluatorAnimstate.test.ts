import { describe, expect, it } from "@jest/globals";
import { MockGameObject } from "xray16/mocks";

import { EvaluatorAnimstate } from "@/engine/core/ai/state/animstate/EvaluatorAnimstate";
import { StalkerStateController } from "@/engine/core/ai/state/StalkerStateController";
import { EStalkerState } from "@/engine/core/animation/types";
import { StalkerBinder } from "@/engine/core/binders/creature/StalkerBinder";
import { registry } from "@/engine/core/database/registry";

describe("EvaluatorAnimstate", () => {
  it("should correctly perform animation state check", () => {
    const stalker: StalkerBinder = new StalkerBinder(MockGameObject.mock());

    stalker.reinit();

    const controller: StalkerStateController = registry.objects.get(stalker.object.id())
      .stateController as StalkerStateController;
    const evaluator: EvaluatorAnimstate = new EvaluatorAnimstate(controller);

    expect(controller.animstate.state.currentState).toBeNull();
    expect(evaluator.evaluate()).toBeTruthy();

    controller.animstate.state.currentState = EStalkerState.BACKOFF;
    expect(evaluator.evaluate()).toBeFalsy();
  });
});
