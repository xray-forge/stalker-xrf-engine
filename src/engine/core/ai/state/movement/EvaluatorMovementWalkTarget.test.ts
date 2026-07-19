import { describe, expect, it } from "@jest/globals";
import { property_storage } from "xray16";
import { GameObject } from "xray16/alias";
import { MockGameObject } from "xray16/mocks";

import { EvaluatorMovementWalkTarget } from "@/engine/core/ai/state/movement/EvaluatorMovementWalkTarget";
import type { StalkerStateController } from "@/engine/core/ai/state/StalkerStateController";

describe("EvaluatorMovementWalkTarget", () => {
  it("should correctly check if run state when needed", () => {
    const object: GameObject = MockGameObject.mock();
    const evaluator: EvaluatorMovementWalkTarget = new EvaluatorMovementWalkTarget({
      targetState: "walk",
    } as StalkerStateController);

    evaluator.setup(object, new property_storage());

    expect(evaluator.evaluate()).toBe(true);
  });

  it("should correctly check if run state when not needed", () => {
    const object: GameObject = MockGameObject.mock();
    const evaluator: EvaluatorMovementWalkTarget = new EvaluatorMovementWalkTarget({
      targetState: "run",
    } as StalkerStateController);

    evaluator.setup(object, new property_storage());

    expect(evaluator.evaluate()).toBe(false);
  });
});
