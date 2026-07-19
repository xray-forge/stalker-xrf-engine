import { describe, expect, it } from "@jest/globals";
import { property_storage } from "xray16";
import { MockGameObject } from "xray16/mocks";

import { EvaluatorBodyStateStandingTarget } from "@/engine/core/ai/state/body_state/EvaluatorBodyStateStandingTarget";
import { StalkerStateController } from "@/engine/core/ai/state/StalkerStateController";
import { EStalkerState } from "@/engine/core/animation/types";
import { StalkerBinder } from "@/engine/core/binders/creature/StalkerBinder";
import { registry } from "@/engine/core/database/registry";
import { registerStalker, setStalkerState, unregisterStalker } from "@/engine/core/database/stalker";

describe("EvaluatorBodyStateStandingTarget", () => {
  it("should correctly evaluate standing now", () => {
    const stalker: StalkerBinder = new StalkerBinder(MockGameObject.mock());

    registerStalker(stalker);

    stalker.reinit();

    const controller: StalkerStateController = registry.objects.get(stalker.object.id())
      .stateController as StalkerStateController;
    const evaluator: EvaluatorBodyStateStandingTarget = new EvaluatorBodyStateStandingTarget(controller);

    evaluator.setup(stalker.object, new property_storage());
    expect(evaluator.evaluate()).toBeFalsy();

    setStalkerState(stalker.object, EStalkerState.RAID_FIRE);
    expect(evaluator.evaluate()).toBeTruthy();

    setStalkerState(stalker.object, EStalkerState.SNEAK);
    expect(evaluator.evaluate()).toBeFalsy();

    unregisterStalker(stalker);
  });
});
