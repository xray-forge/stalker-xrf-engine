import { describe, expect, it, jest } from "@jest/globals";
import { anim, property_storage } from "xray16";

import { EvaluatorMentalFreeNow } from "@/engine/core/ai/state/mental/EvaluatorMentalFreeNow";
import type { StalkerStateManager } from "@/engine/core/ai/state/StalkerStateManager";
import { GameObject } from "@/engine/lib/types";
import { MockGameObject } from "@/fixtures/xray";

describe("EvaluatorMentalFreeNow class", () => {
  it("should correctly check if free state when set", () => {
    const object: GameObject = MockGameObject.mock();
    const evaluator: EvaluatorMentalFreeNow = new EvaluatorMentalFreeNow({} as StalkerStateManager);

    jest.spyOn(object, "target_mental_state").mockImplementation(() => anim.free);

    evaluator.setup(object, new property_storage());

    expect(evaluator.evaluate()).toBe(true);
  });

  it("should correctly check if free state when not set", () => {
    const object: GameObject = MockGameObject.mock();
    const evaluator: EvaluatorMentalFreeNow = new EvaluatorMentalFreeNow({} as StalkerStateManager);

    jest.spyOn(object, "target_mental_state").mockImplementation(() => anim.danger);

    evaluator.setup(object, new property_storage());

    expect(evaluator.evaluate()).toBe(false);
  });
});
