import { describe, expect, it } from "@jest/globals";
import { property_storage } from "xray16";

import { EvaluatorMentalDangerTarget } from "@/engine/core/objects/ai/state/mental/EvaluatorMentalDangerTarget";
import type { StalkerStateManager } from "@/engine/core/objects/ai/state/StalkerStateManager";
import { GameObject } from "@/engine/lib/types";
import { mockGameObject } from "@/fixtures/xray";

describe("EvaluatorMentalDangerTarget class", () => {
  it("should correctly check if danger state when needed", () => {
    const object: GameObject = mockGameObject();
    const evaluator: EvaluatorMentalDangerTarget = new EvaluatorMentalDangerTarget({
      targetState: "raid_fire",
    } as StalkerStateManager);

    evaluator.setup(object, new property_storage());

    expect(evaluator.evaluate()).toBe(true);
  });

  it("should correctly check if danger state when not needed", () => {
    const object: GameObject = mockGameObject();
    const evaluator: EvaluatorMentalDangerTarget = new EvaluatorMentalDangerTarget({
      targetState: "idle",
    } as StalkerStateManager);

    evaluator.setup(object, new property_storage());

    expect(evaluator.evaluate()).toBe(false);
  });
});
