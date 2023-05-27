import { describe, expect, it } from "@jest/globals";

import { registry } from "@/engine/core/database/registry";
import { registerStalker, setStalkerState, unregisterStalker } from "@/engine/core/database/stalker";
import { StalkerBinder } from "@/engine/core/objects";
import { EStalkerState } from "@/engine/core/objects/state";
import { EvaluatorAnimation } from "@/engine/core/objects/state/animation/EvaluatorAnimation";
import { StalkerStateManager } from "@/engine/core/objects/state/StalkerStateManager";
import { createEmptyVector } from "@/engine/core/utils/vector";
import { mockClientGameObject } from "@/fixtures/xray";

describe("EvaluatorAnimation class", () => {
  it("should correctly perform animation check", () => {
    const stalker: StalkerBinder = new StalkerBinder(mockClientGameObject());

    registerStalker(stalker);

    stalker.reinit();

    const manager: StalkerStateManager = registry.objects.get(stalker.object.id()).stateManager as StalkerStateManager;
    const evaluator: EvaluatorAnimation = new EvaluatorAnimation(manager);

    expect(evaluator.evaluate()).toBeTruthy();

    setStalkerState(stalker.object, EStalkerState.BACKOFF, null, null, {
      look_position: createEmptyVector(),
      look_object: null,
    });

    expect(evaluator.evaluate()).toBeFalsy();

    unregisterStalker(stalker);
  });
});
