import { describe, expect, it } from "@jest/globals";
import { move, property_storage } from "xray16";
import { MockGameObject } from "xray16/mocks";
import { replaceFunctionMock } from "xray16/testing/utils";

import { EvaluatorBodyStateSet } from "@/engine/core/ai/state/body_state/EvaluatorBodyStateSet";
import { StalkerStateController } from "@/engine/core/ai/state/StalkerStateController";
import { EStalkerState } from "@/engine/core/animation/types";
import { StalkerBinder } from "@/engine/core/binders/creature/StalkerBinder";
import { registry } from "@/engine/core/database/registry";
import { registerStalker, setStalkerState, unregisterStalker } from "@/engine/core/database/stalker";

describe("EvaluatorBodyStateSet", () => {
  it("should correctly evaluate body state", () => {
    const stalker: StalkerBinder = new StalkerBinder(MockGameObject.mock());

    registerStalker(stalker);

    stalker.reinit();

    const controller: StalkerStateController = registry.objects.get(stalker.object.id())
      .stateController as StalkerStateController;
    const evaluator: EvaluatorBodyStateSet = new EvaluatorBodyStateSet(controller);

    replaceFunctionMock(stalker.object.target_body_state, () => move.crouch);

    evaluator.setup(stalker.object, new property_storage());
    expect(evaluator.evaluate()).toBeTruthy();

    setStalkerState(stalker.object, EStalkerState.RAID_FIRE);
    expect(evaluator.evaluate()).toBeFalsy();

    setStalkerState(stalker.object, EStalkerState.SNEAK);
    expect(evaluator.evaluate()).toBeTruthy();

    unregisterStalker(stalker);
  });
});
