import { describe, expect, it } from "@jest/globals";
import { GameObject } from "xray16/alias";
import { MockGameObject, MockPropertyStorage } from "xray16/mocks";

import { StalkerStateController } from "@/engine/core/ai/state/StalkerStateController";
import { EvaluatorWeaponDropTarget } from "@/engine/core/ai/state/weapon/EvaluatorWeaponDropTarget";
import { EStalkerState } from "@/engine/core/animation/types";

describe("EvaluatorWeaponDropTarget", () => {
  it("recognizes drop target states", () => {
    const object: GameObject = MockGameObject.mock();
    const controller = new StalkerStateController(object);
    const evaluator = new EvaluatorWeaponDropTarget(controller);

    evaluator.setup(object, MockPropertyStorage.mock());
    controller.targetState = EStalkerState.WOUNDED_HEAVY;
    expect(evaluator.evaluate()).toBe(true);
  });
});
