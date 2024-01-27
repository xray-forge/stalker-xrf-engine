import { describe, expect, it, jest } from "@jest/globals";
import { anim, property_storage } from "xray16";

import { EvaluatorMentalDangerNow } from "@/engine/core/ai/state/mental/EvaluatorMentalDangerNow";
import type { StalkerStateManager } from "@/engine/core/ai/state/StalkerStateManager";
import { GameObject } from "@/engine/lib/types";
import { MockGameObject } from "@/fixtures/xray";

describe("EvaluatorMentalDangerTarget class", () => {
  it("should correctly check if danger state when set", () => {
    const object: GameObject = MockGameObject.mock();
    const evaluator: EvaluatorMentalDangerNow = new EvaluatorMentalDangerNow({} as StalkerStateManager);

    jest.spyOn(object, "target_mental_state").mockImplementation(() => anim.danger);

    evaluator.setup(object, new property_storage());

    expect(evaluator.evaluate()).toBe(true);
  });

  it("should correctly check if danger state when not set", () => {
    const object: GameObject = MockGameObject.mock();
    const evaluator: EvaluatorMentalDangerNow = new EvaluatorMentalDangerNow({} as StalkerStateManager);

    jest.spyOn(object, "target_mental_state").mockImplementation(() => anim.free);

    evaluator.setup(object, new property_storage());

    expect(evaluator.evaluate()).toBe(false);
  });
});
