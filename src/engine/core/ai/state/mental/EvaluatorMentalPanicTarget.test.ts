import { describe, expect, it } from "@jest/globals";
import { property_storage } from "xray16";
import { GameObject } from "xray16/alias";
import { MockGameObject } from "xray16/mocks";

import { EvaluatorMentalPanicTarget } from "@/engine/core/ai/state/mental/EvaluatorMentalPanicTarget";
import type { StalkerStateManager } from "@/engine/core/ai/state/StalkerStateManager";

describe("EvaluatorMentalPanicTarget", () => {
  it("should correctly check if panic state when needed", () => {
    const object: GameObject = MockGameObject.mock();
    const evaluator: EvaluatorMentalPanicTarget = new EvaluatorMentalPanicTarget({
      targetState: "sprint",
    } as StalkerStateManager);

    evaluator.setup(object, new property_storage());

    expect(evaluator.evaluate()).toBe(true);
  });

  it("should correctly check if panic state when not needed", () => {
    const object: GameObject = MockGameObject.mock();
    const evaluator: EvaluatorMentalPanicTarget = new EvaluatorMentalPanicTarget({
      targetState: "raid_fire",
    } as StalkerStateManager);

    evaluator.setup(object, new property_storage());

    expect(evaluator.evaluate()).toBe(false);
  });
});
