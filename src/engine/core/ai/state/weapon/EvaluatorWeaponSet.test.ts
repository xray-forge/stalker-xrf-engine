import { describe, expect, it, jest } from "@jest/globals";
import { GameObject } from "xray16/alias";
import { MockGameObject, MockPropertyStorage } from "xray16/mocks";

import { StalkerStateController } from "@/engine/core/ai/state/StalkerStateController";
import { EvaluatorWeaponSet } from "@/engine/core/ai/state/weapon/EvaluatorWeaponSet";
import { EStalkerState } from "@/engine/core/animation/types";

describe("EvaluatorWeaponSet", () => {
  it("accepts an empty active item for drop target states", () => {
    const object: GameObject = MockGameObject.mock();
    const controller: StalkerStateController = new StalkerStateController(object);
    const evaluator: EvaluatorWeaponSet = new EvaluatorWeaponSet(controller);

    evaluator.setup(object, MockPropertyStorage.mock());
    controller.targetState = EStalkerState.WOUNDED_HEAVY;

    expect(evaluator.evaluate()).toBe(true);
  });

  it("requires an available best weapon when the target state needs one", () => {
    const object: GameObject = MockGameObject.mock();
    const controller: StalkerStateController = new StalkerStateController(object);
    const evaluator: EvaluatorWeaponSet = new EvaluatorWeaponSet(controller);

    evaluator.setup(object, MockPropertyStorage.mock());
    controller.targetState = EStalkerState.WALK;
    jest.spyOn(object, "active_item").mockReturnValue(MockGameObject.mock());
    jest.spyOn(object, "best_weapon").mockReturnValue(null);

    expect(evaluator.evaluate()).toBe(false);
  });
});
