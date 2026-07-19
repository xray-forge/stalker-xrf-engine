import { describe, expect, it } from "@jest/globals";
import { MockGameObject, MockPropertyStorage } from "xray16/mocks";

import { StalkerStateManager } from "@/engine/core/ai/state/StalkerStateManager";
import { EvaluatorWeaponFireTarget } from "@/engine/core/ai/state/weapon/EvaluatorWeaponFireTarget";
import { EStalkerState } from "@/engine/core/animation/types";

describe("EvaluatorWeaponFireTarget", () => {
  it("recognizes fire states but excludes non-fire weapon states", () => {
    const object = MockGameObject.mock();
    const stateManager: StalkerStateManager = new StalkerStateManager(object);
    const evaluator: EvaluatorWeaponFireTarget = new EvaluatorWeaponFireTarget(stateManager);

    evaluator.setup(object, MockPropertyStorage.mock());

    stateManager.targetState = EStalkerState.RAID_FIRE;

    expect(evaluator.evaluate()).toBe(true);

    stateManager.targetState = EStalkerState.GUARD;

    expect(evaluator.evaluate()).toBe(false);
  });
});
