import { describe, expect, it, jest } from "@jest/globals";
import { anim, property_storage } from "xray16";
import { GameObject } from "xray16/alias";
import { MockGameObject } from "xray16/mocks";

import { EvaluatorMentalPanicNow } from "@/engine/core/ai/state/mental/EvaluatorMentalPanicNow";
import type { StalkerStateController } from "@/engine/core/ai/state/StalkerStateController";

describe("EvaluatorMentalPanicNow", () => {
  it("should correctly check if free state when set", () => {
    const object: GameObject = MockGameObject.mock();
    const evaluator: EvaluatorMentalPanicNow = new EvaluatorMentalPanicNow({} as StalkerStateController);

    jest.spyOn(object, "target_mental_state").mockImplementation(() => anim.panic);

    evaluator.setup(object, new property_storage());

    expect(evaluator.evaluate()).toBe(true);
  });

  it("should correctly check if free state when not set", () => {
    const object: GameObject = MockGameObject.mock();
    const evaluator: EvaluatorMentalPanicNow = new EvaluatorMentalPanicNow({} as StalkerStateController);

    jest.spyOn(object, "target_mental_state").mockImplementation(() => anim.danger);

    evaluator.setup(object, new property_storage());

    expect(evaluator.evaluate()).toBe(false);
  });
});
