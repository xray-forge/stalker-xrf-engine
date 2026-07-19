import { describe, expect, it, jest } from "@jest/globals";
import { move, property_storage } from "xray16";
import { GameObject } from "xray16/alias";
import { MockGameObject } from "xray16/mocks";

import { EvaluatorMovementStandNow } from "@/engine/core/ai/state/movement/EvaluatorMovementStandNow";
import type { StalkerStateController } from "@/engine/core/ai/state/StalkerStateController";

describe("EvaluatorMovementStandNow", () => {
  it("should correctly check if danger state when set", () => {
    const object: GameObject = MockGameObject.mock();
    const evaluator: EvaluatorMovementStandNow = new EvaluatorMovementStandNow({} as StalkerStateController);

    jest.spyOn(object, "target_movement_type").mockImplementation(() => move.stand);

    evaluator.setup(object, new property_storage());

    expect(evaluator.evaluate()).toBe(true);
  });

  it("should correctly check if danger state when not set", () => {
    const object: GameObject = MockGameObject.mock();
    const evaluator: EvaluatorMovementStandNow = new EvaluatorMovementStandNow({} as StalkerStateController);

    jest.spyOn(object, "target_movement_type").mockImplementation(() => move.run);

    evaluator.setup(object, new property_storage());

    expect(evaluator.evaluate()).toBe(false);
  });
});
