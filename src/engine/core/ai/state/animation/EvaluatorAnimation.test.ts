import { describe, expect, it } from "@jest/globals";
import { createEmptyVector } from "xray16/lib";
import { MockGameObject } from "xray16/mocks";

import { EvaluatorAnimation } from "@/engine/core/ai/state/animation/EvaluatorAnimation";
import { StalkerStateController } from "@/engine/core/ai/state/StalkerStateController";
import { EStalkerState } from "@/engine/core/animation/types";
import { StalkerBinder } from "@/engine/core/binders/creature/StalkerBinder";
import { registry } from "@/engine/core/database/registry";
import { registerStalker, setStalkerState, unregisterStalker } from "@/engine/core/database/stalker";

describe("EvaluatorAnimation", () => {
  it("should correctly perform animation check", () => {
    const stalker: StalkerBinder = new StalkerBinder(MockGameObject.mock());

    registerStalker(stalker);

    stalker.reinit();

    const controller: StalkerStateController = registry.objects.get(stalker.object.id())
      .stateController as StalkerStateController;
    const evaluator: EvaluatorAnimation = new EvaluatorAnimation(controller);

    expect(evaluator.evaluate()).toBeTruthy();

    setStalkerState(stalker.object, EStalkerState.BACKOFF, null, null, {
      lookPosition: createEmptyVector(),
      lookObjectId: null,
    });

    expect(evaluator.evaluate()).toBeFalsy();

    unregisterStalker(stalker);
  });
});
