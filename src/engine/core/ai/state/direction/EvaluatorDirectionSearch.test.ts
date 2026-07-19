import { describe, expect, it } from "@jest/globals";
import { GameObject } from "xray16/alias";
import { createEmptyVector } from "xray16/lib";
import { MockGameObject } from "xray16/mocks";

import { EvaluatorDirectionSearch } from "@/engine/core/ai/state/direction/EvaluatorDirectionSearch";
import { StalkerStateController } from "@/engine/core/ai/state/StalkerStateController";
import { EStalkerState } from "@/engine/core/animation/types";
import { StalkerBinder } from "@/engine/core/binders/creature/StalkerBinder";
import { registry } from "@/engine/core/database/registry";
import { registerStalker, setStalkerState, unregisterStalker } from "@/engine/core/database/stalker";

describe("EvaluatorDirectionSearch", () => {
  it("should correctly perform direction search check", () => {
    const stalker: StalkerBinder = new StalkerBinder(MockGameObject.mock());

    registerStalker(stalker);

    stalker.reinit();

    const controller: StalkerStateController = registry.objects.get(stalker.object.id())
      .stateController as StalkerStateController;
    const evaluator: EvaluatorDirectionSearch = new EvaluatorDirectionSearch(controller);
    const lookObject: GameObject = MockGameObject.mock();

    expect(evaluator.evaluate()).toBeTruthy();

    setStalkerState(stalker.object, EStalkerState.SMART_COVER, null, null, {
      lookObjectId: null,
      lookPosition: createEmptyVector(),
    });

    expect(evaluator.evaluate()).toBeFalsy();

    setStalkerState(stalker.object, EStalkerState.IDLE);

    expect(evaluator.evaluate()).toBeTruthy();

    setStalkerState(stalker.object, EStalkerState.SMART_COVER, null, null, {
      lookObjectId: lookObject.id(),
    });

    expect(evaluator.evaluate()).toBeFalsy();

    unregisterStalker(stalker);
  });
});
