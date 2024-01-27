import { describe, expect, it, jest } from "@jest/globals";
import { move, property_storage } from "xray16";

import { EvaluatorMovementStandNow } from "@/engine/core/ai/state/movement/EvaluatorMovementStandNow";
import type { StalkerStateManager } from "@/engine/core/ai/state/StalkerStateManager";
import { GameObject } from "@/engine/lib/types";
import { MockGameObject } from "@/fixtures/xray";

describe("EvaluatorMovementStandNow class", () => {
  it("should correctly check if danger state when set", () => {
    const object: GameObject = MockGameObject.mock();
    const evaluator: EvaluatorMovementStandNow = new EvaluatorMovementStandNow({} as StalkerStateManager);

    jest.spyOn(object, "target_movement_type").mockImplementation(() => move.stand);

    evaluator.setup(object, new property_storage());

    expect(evaluator.evaluate()).toBe(true);
  });

  it("should correctly check if danger state when not set", () => {
    const object: GameObject = MockGameObject.mock();
    const evaluator: EvaluatorMovementStandNow = new EvaluatorMovementStandNow({} as StalkerStateManager);

    jest.spyOn(object, "target_movement_type").mockImplementation(() => move.run);

    evaluator.setup(object, new property_storage());

    expect(evaluator.evaluate()).toBe(false);
  });
});
