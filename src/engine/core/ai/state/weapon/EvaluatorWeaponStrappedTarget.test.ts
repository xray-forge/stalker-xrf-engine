import { describe, expect, it } from "@jest/globals";
import { GameObject } from "xray16/alias";
import { MockGameObject, MockPropertyStorage } from "xray16/mocks";

import { StalkerStateController } from "@/engine/core/ai/state/StalkerStateController";
import { EvaluatorWeaponStrappedTarget } from "@/engine/core/ai/state/weapon/EvaluatorWeaponStrappedTarget";
import { EStalkerState } from "@/engine/core/animation/types";

describe("EvaluatorWeaponStrappedTarget", () => {
  it("recognizes strapped target states", () => {
    const object: GameObject = MockGameObject.mock();
    const controller = new StalkerStateController(object);
    const evaluator = new EvaluatorWeaponStrappedTarget(controller);

    evaluator.setup(object, MockPropertyStorage.mock());
    controller.targetState = "zat_b14_give_artefact_idle" as EStalkerState;
    expect(evaluator.evaluate()).toBe(true);
  });
});
