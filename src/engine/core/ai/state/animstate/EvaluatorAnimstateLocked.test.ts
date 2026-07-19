import { describe, expect, it } from "@jest/globals";
import { MockGameObject } from "xray16/mocks";

import { EvaluatorAnimstateLocked } from "@/engine/core/ai/state/animstate/EvaluatorAnimstateLocked";
import { StalkerStateController } from "@/engine/core/ai/state/StalkerStateController";
import { EAnimationMarker } from "@/engine/core/animation/types/animation_types";
import { StalkerBinder } from "@/engine/core/binders/creature/StalkerBinder";
import { registry } from "@/engine/core/database/registry";
import { registerStalker, unregisterStalker } from "@/engine/core/database/stalker";

describe("EvaluatorAnimstateLocked", () => {
  it("should correctly perform animation locked state", () => {
    const stalker: StalkerBinder = new StalkerBinder(MockGameObject.mock());

    registerStalker(stalker);

    stalker.reinit();

    const controller: StalkerStateController = registry.objects.get(stalker.object.id())
      .stateController as StalkerStateController;
    const evaluator: EvaluatorAnimstateLocked = new EvaluatorAnimstateLocked(controller);

    expect(evaluator.evaluate()).toBeFalsy();

    controller.animstate.state.animationMarker = EAnimationMarker.IN;
    expect(evaluator.evaluate()).toBeTruthy();

    controller.animstate.state.animationMarker = EAnimationMarker.OUT;
    expect(evaluator.evaluate()).toBeTruthy();

    controller.animstate.state.animationMarker = EAnimationMarker.IDLE;
    expect(evaluator.evaluate()).toBeFalsy();

    controller.animstate.state.animationMarker = null;
    expect(evaluator.evaluate()).toBeFalsy();

    unregisterStalker(stalker);
  });
});
