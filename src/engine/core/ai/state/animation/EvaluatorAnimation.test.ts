import { describe, expect, it } from "@jest/globals";

import { EvaluatorAnimation } from "@/engine/core/ai/state/animation/EvaluatorAnimation";
import { StalkerStateManager } from "@/engine/core/ai/state/StalkerStateManager";
import { EStalkerState } from "@/engine/core/animation/types";
import { StalkerBinder } from "@/engine/core/binders/creature/StalkerBinder";
import { registry } from "@/engine/core/database/registry";
import { registerStalker, setStalkerState, unregisterStalker } from "@/engine/core/database/stalker";
import { createEmptyVector } from "@/engine/core/utils/vector";
import { MockGameObject } from "@/fixtures/xray";

describe("EvaluatorAnimation", () => {
  it("should correctly perform animation check", () => {
    const stalker: StalkerBinder = new StalkerBinder(MockGameObject.mock());

    registerStalker(stalker);

    stalker.reinit();

    const manager: StalkerStateManager = registry.objects.get(stalker.object.id()).stateManager as StalkerStateManager;
    const evaluator: EvaluatorAnimation = new EvaluatorAnimation(manager);

    expect(evaluator.evaluate()).toBeTruthy();

    setStalkerState(stalker.object, EStalkerState.BACKOFF, null, null, {
      lookPosition: createEmptyVector(),
      lookObjectId: null,
    });

    expect(evaluator.evaluate()).toBeFalsy();

    unregisterStalker(stalker);
  });
});
