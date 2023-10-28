import { describe, expect, it } from "@jest/globals";
import { move, property_storage } from "xray16";

import { EvaluatorMovementStandNow } from "@/engine/core/ai/state/movement/EvaluatorMovementStandNow";
import type { StalkerStateManager } from "@/engine/core/ai/state/StalkerStateManager";
import { GameObject } from "@/engine/lib/types";
import { mockGameObject } from "@/fixtures/xray";

describe("EvaluatorMovementStandNow class", () => {
  it("should correctly check if danger state when set", () => {
    const object: GameObject = mockGameObject({ target_movement_type: () => move.stand });
    const evaluator: EvaluatorMovementStandNow = new EvaluatorMovementStandNow({} as StalkerStateManager);

    evaluator.setup(object, new property_storage());

    expect(evaluator.evaluate()).toBe(true);
  });

  it("should correctly check if danger state when not set", () => {
    const object: GameObject = mockGameObject({ target_movement_type: () => move.run });
    const evaluator: EvaluatorMovementStandNow = new EvaluatorMovementStandNow({} as StalkerStateManager);

    evaluator.setup(object, new property_storage());

    expect(evaluator.evaluate()).toBe(false);
  });
});
