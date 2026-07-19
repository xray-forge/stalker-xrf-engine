import { describe, expect, it } from "@jest/globals";
import { GameObject } from "xray16/alias";
import { MockGameObject, MockPropertyStorage } from "xray16/mocks";

import { StalkerStateController } from "@/engine/core/ai/state/StalkerStateController";
import { EvaluatorWeaponFireTarget } from "@/engine/core/ai/state/weapon/EvaluatorWeaponFireTarget";
import { EStalkerState } from "@/engine/core/animation/types";

describe("EvaluatorWeaponFireTarget", () => {
  it("recognizes fire states but excludes non-fire weapon states", () => {
    const object: GameObject = MockGameObject.mock();
    const controller: StalkerStateController = new StalkerStateController(object);
    const evaluator: EvaluatorWeaponFireTarget = new EvaluatorWeaponFireTarget(controller);

    evaluator.setup(object, MockPropertyStorage.mock());

    controller.targetState = EStalkerState.RAID_FIRE;

    expect(evaluator.evaluate()).toBe(true);

    controller.targetState = EStalkerState.GUARD;

    expect(evaluator.evaluate()).toBe(false);
  });
});
