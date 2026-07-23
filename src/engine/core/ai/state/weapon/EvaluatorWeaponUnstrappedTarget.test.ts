import { describe, expect, it } from "@jest/globals";
import { GameObject } from "xray16/alias";
import { MockGameObject, MockPropertyStorage } from "xray16/mocks";

import { StalkerStateController } from "@/engine/core/ai/state/StalkerStateController";
import { EvaluatorWeaponUnstrappedTarget } from "@/engine/core/ai/state/weapon/EvaluatorWeaponUnstrappedTarget";
import { EStalkerState } from "@/engine/core/animation/types";

describe("EvaluatorWeaponUnstrappedTarget", () => {
  it("recognizes unstrapped target states", () => {
    const object: GameObject = MockGameObject.mock();
    const controller = new StalkerStateController(object);
    const evaluator = new EvaluatorWeaponUnstrappedTarget(controller);

    evaluator.setup(object, MockPropertyStorage.mock());
    controller.targetState = "zat_b38_stalker_jump_tonnel" as EStalkerState;
    expect(evaluator.evaluate()).toBe(true);
  });
});
