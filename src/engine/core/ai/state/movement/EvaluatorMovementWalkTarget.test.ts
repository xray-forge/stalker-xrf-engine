import { describe, expect, it } from "@jest/globals";
import { property_storage } from "xray16";

import { EvaluatorMovementWalkTarget } from "@/engine/core/ai/state/movement/EvaluatorMovementWalkTarget";
import type { StalkerStateManager } from "@/engine/core/ai/state/StalkerStateManager";
import { GameObject } from "@/engine/lib/types";
import { MockGameObject } from "@/fixtures/xray";

describe("EvaluatorMovementWalkTarget", () => {
  it("should correctly check if run state when needed", () => {
    const object: GameObject = MockGameObject.mock();
    const evaluator: EvaluatorMovementWalkTarget = new EvaluatorMovementWalkTarget({
      targetState: "walk",
    } as StalkerStateManager);

    evaluator.setup(object, new property_storage());

    expect(evaluator.evaluate()).toBe(true);
  });

  it("should correctly check if run state when not needed", () => {
    const object: GameObject = MockGameObject.mock();
    const evaluator: EvaluatorMovementWalkTarget = new EvaluatorMovementWalkTarget({
      targetState: "run",
    } as StalkerStateManager);

    evaluator.setup(object, new property_storage());

    expect(evaluator.evaluate()).toBe(false);
  });
});
