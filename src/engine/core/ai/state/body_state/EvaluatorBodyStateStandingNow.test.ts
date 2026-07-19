import { describe, expect, it } from "@jest/globals";
import { move, property_storage } from "xray16";
import { MockGameObject } from "xray16/mocks";
import { replaceFunctionMock } from "xray16/testing/utils";

import { EvaluatorBodyStateStandingNow } from "@/engine/core/ai/state/body_state/EvaluatorBodyStateStandingNow";
import { StalkerStateController } from "@/engine/core/ai/state/StalkerStateController";
import { StalkerBinder } from "@/engine/core/binders/creature/StalkerBinder";
import { registry } from "@/engine/core/database/registry";
import { registerStalker, unregisterStalker } from "@/engine/core/database/stalker";

describe("EvaluatorBodyStateStandingNow", () => {
  it("should correctly evaluate standing now", () => {
    const stalker: StalkerBinder = new StalkerBinder(MockGameObject.mock());

    registerStalker(stalker);

    stalker.reinit();

    const controller: StalkerStateController = registry.objects.get(stalker.object.id())
      .stateController as StalkerStateController;
    const evaluator: EvaluatorBodyStateStandingNow = new EvaluatorBodyStateStandingNow(controller);

    evaluator.setup(stalker.object, new property_storage());

    replaceFunctionMock(stalker.object.target_body_state, () => move.standing);
    expect(evaluator.evaluate()).toBeTruthy();

    replaceFunctionMock(stalker.object.target_body_state, () => move.crouch);
    expect(evaluator.evaluate()).toBeFalsy();

    unregisterStalker(stalker);
  });
});
