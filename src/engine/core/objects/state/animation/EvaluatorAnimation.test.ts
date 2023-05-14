import { describe, expect, it, jest } from "@jest/globals";
import { vector } from "xray16";

import { registry } from "@/engine/core/database/registry";
import { registerStalker, setStalkerState, unregisterStalker } from "@/engine/core/database/stalker";
import { StalkerBinder } from "@/engine/core/objects";
import { EStalkerState } from "@/engine/core/objects/state";
import { EvaluatorAnimation } from "@/engine/core/objects/state/animation/EvaluatorAnimation";
import { StalkerStateManager } from "@/engine/core/objects/state/StalkerStateManager";
import { mockClientGameObject } from "@/fixtures/xray";

describe("EvaluatorAnimation class", () => {
  it("should correctly perform animation check", () => {
    const stalker: StalkerBinder = new StalkerBinder(mockClientGameObject());

    registerStalker(stalker);

    stalker.reinit();

    const manager: StalkerStateManager = registry.objects.get(stalker.object.id()).stateManager as StalkerStateManager;

    jest.spyOn(manager.animation, "setControl");
    jest.spyOn(manager.animation, "setState");

    const evaluator: EvaluatorAnimation = new EvaluatorAnimation(manager);

    expect(evaluator.evaluate()).toBeTruthy();

    setStalkerState(stalker.object, EStalkerState.BACKOFF, null, null, {
      look_position: new vector(),
      look_object: null,
    });

    expect(evaluator.evaluate()).toBeFalsy();

    unregisterStalker(stalker);
  });
});
