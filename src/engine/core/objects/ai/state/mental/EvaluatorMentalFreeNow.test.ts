import { describe, expect, it } from "@jest/globals";
import { anim, property_storage } from "xray16";

import { EvaluatorMentalFreeNow } from "@/engine/core/objects/ai/state/mental/EvaluatorMentalFreeNow";
import type { StalkerStateManager } from "@/engine/core/objects/ai/state/StalkerStateManager";
import { GameObject } from "@/engine/lib/types";
import { mockGameObject } from "@/fixtures/xray";

describe("EvaluatorMentalFreeNow class", () => {
  it("should correctly check if free state when set", () => {
    const object: GameObject = mockGameObject({ target_mental_state: () => anim.free });
    const evaluator: EvaluatorMentalFreeNow = new EvaluatorMentalFreeNow({} as StalkerStateManager);

    evaluator.setup(object, new property_storage());

    expect(evaluator.evaluate()).toBe(true);
  });

  it("should correctly check if free state when not set", () => {
    const object: GameObject = mockGameObject({ target_mental_state: () => anim.danger });
    const evaluator: EvaluatorMentalFreeNow = new EvaluatorMentalFreeNow({} as StalkerStateManager);

    evaluator.setup(object, new property_storage());

    expect(evaluator.evaluate()).toBe(false);
  });
});
