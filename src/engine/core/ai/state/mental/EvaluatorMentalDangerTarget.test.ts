import { describe, expect, it } from "@jest/globals";
import { property_storage } from "xray16";
import { GameObject } from "xray16/alias";
import { MockGameObject } from "xray16/mocks";

import { EvaluatorMentalDangerTarget } from "@/engine/core/ai/state/mental/EvaluatorMentalDangerTarget";
import type { StalkerStateManager } from "@/engine/core/ai/state/StalkerStateManager";

describe("EvaluatorMentalDangerTarget", () => {
  it("should correctly check if danger state when needed", () => {
    const object: GameObject = MockGameObject.mock();
    const evaluator: EvaluatorMentalDangerTarget = new EvaluatorMentalDangerTarget({
      targetState: "raid_fire",
    } as StalkerStateManager);

    evaluator.setup(object, new property_storage());

    expect(evaluator.evaluate()).toBe(true);
  });

  it("should correctly check if danger state when not needed", () => {
    const object: GameObject = MockGameObject.mock();
    const evaluator: EvaluatorMentalDangerTarget = new EvaluatorMentalDangerTarget({
      targetState: "idle",
    } as StalkerStateManager);

    evaluator.setup(object, new property_storage());

    expect(evaluator.evaluate()).toBe(false);
  });
});
