import { describe, expect, it } from "@jest/globals";
import { move, property_storage } from "xray16";

import { registry } from "@/engine/core/database/registry";
import { registerStalker, setStalkerState, unregisterStalker } from "@/engine/core/database/stalker";
import { EvaluatorBodyState } from "@/engine/core/objects/ai/state/body_state/EvaluatorBodyState";
import { StalkerStateManager } from "@/engine/core/objects/ai/state/StalkerStateManager";
import { EStalkerState } from "@/engine/core/objects/animation";
import { StalkerBinder } from "@/engine/core/objects/binders/creature/StalkerBinder";
import { replaceFunctionMock } from "@/fixtures/utils/function_mock";
import { mockClientGameObject } from "@/fixtures/xray";

describe("EvaluatorBodyState class", () => {
  it("should correctly evaluate body state", () => {
    const stalker: StalkerBinder = new StalkerBinder(mockClientGameObject());

    registerStalker(stalker);

    stalker.reinit();

    const manager: StalkerStateManager = registry.objects.get(stalker.object.id()).stateManager as StalkerStateManager;
    const evaluator: EvaluatorBodyState = new EvaluatorBodyState(manager);

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
