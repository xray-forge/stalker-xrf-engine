import { describe, expect, it } from "@jest/globals";
import { property_storage } from "xray16";
import { GameObject } from "xray16/alias";
import { MockGameObject } from "xray16/mocks";

import { EvaluatorMentalFreeTarget } from "@/engine/core/ai/state/mental/EvaluatorMentalFreeTarget";
import type { StalkerStateController } from "@/engine/core/ai/state/StalkerStateController";

describe("EvaluatorMentalDangerTarget", () => {
  it("should correctly check if free state when needed", () => {
    const object: GameObject = MockGameObject.mock();
    const evaluator: EvaluatorMentalFreeTarget = new EvaluatorMentalFreeTarget({
      targetState: "rush",
    } as StalkerStateController);

    evaluator.setup(object, new property_storage());

    expect(evaluator.evaluate()).toBe(true);
  });

  it("should correctly check if free state when not needed", () => {
    const object: GameObject = MockGameObject.mock();
    const evaluator: EvaluatorMentalFreeTarget = new EvaluatorMentalFreeTarget({
      targetState: "raid_fire",
    } as StalkerStateController);

    evaluator.setup(object, new property_storage());

    expect(evaluator.evaluate()).toBe(false);
  });
});
