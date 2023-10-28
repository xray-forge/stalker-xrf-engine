import { describe, expect, it } from "@jest/globals";

import { EvaluatorDirectionSearch } from "@/engine/core/ai/state/direction/EvaluatorDirectionSearch";
import { StalkerStateManager } from "@/engine/core/ai/state/StalkerStateManager";
import { EStalkerState } from "@/engine/core/animation/types";
import { StalkerBinder } from "@/engine/core/binders/creature/StalkerBinder";
import { registry } from "@/engine/core/database/registry";
import { registerStalker, setStalkerState, unregisterStalker } from "@/engine/core/database/stalker";
import { createEmptyVector } from "@/engine/core/utils/vector";
import { GameObject } from "@/engine/lib/types";
import { mockGameObject } from "@/fixtures/xray";

describe("EvaluatorDirectionSearch class", () => {
  it("should correctly perform direction search check", () => {
    const stalker: StalkerBinder = new StalkerBinder(mockGameObject());

    registerStalker(stalker);

    stalker.reinit();

    const manager: StalkerStateManager = registry.objects.get(stalker.object.id()).stateManager as StalkerStateManager;
    const evaluator: EvaluatorDirectionSearch = new EvaluatorDirectionSearch(manager);
    const lookObject: GameObject = mockGameObject();

    expect(evaluator.evaluate()).toBeTruthy();

    setStalkerState(stalker.object, EStalkerState.SMART_COVER, null, null, {
      lookObjectId: null,
      lookPosition: createEmptyVector(),
    });

    expect(evaluator.evaluate()).toBeFalsy();

    setStalkerState(stalker.object, EStalkerState.IDLE);

    expect(evaluator.evaluate()).toBeTruthy();

    setStalkerState(stalker.object, EStalkerState.SMART_COVER, null, null, {
      lookObjectId: lookObject,
      lookPosition: null,
    });

    expect(evaluator.evaluate()).toBeFalsy();

    unregisterStalker(stalker);
  });
});
