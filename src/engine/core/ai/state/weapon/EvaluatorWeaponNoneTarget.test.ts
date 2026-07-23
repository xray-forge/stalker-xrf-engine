import { describe, expect, it } from "@jest/globals";
import { GameObject } from "xray16/alias";
import { MockGameObject, MockPropertyStorage } from "xray16/mocks";

import { StalkerStateController } from "@/engine/core/ai/state/StalkerStateController";
import { EvaluatorWeaponNoneTarget } from "@/engine/core/ai/state/weapon/EvaluatorWeaponNoneTarget";
import { EStalkerState } from "@/engine/core/animation/types";

describe("EvaluatorWeaponNoneTarget", () => {
  it("recognizes no-weapon target states", () => {
    const object: GameObject = MockGameObject.mock();
    const controller = new StalkerStateController(object);
    const evaluator = new EvaluatorWeaponNoneTarget(controller);

    evaluator.setup(object, MockPropertyStorage.mock());
    controller.targetState = "zat_b14_stay_wall" as EStalkerState;
    expect(evaluator.evaluate()).toBe(true);
  });
});
