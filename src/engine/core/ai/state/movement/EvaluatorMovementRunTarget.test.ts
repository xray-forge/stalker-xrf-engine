import { describe, expect, it } from "@jest/globals";
import { property_storage } from "xray16";
import { GameObject } from "xray16/alias";
import { MockGameObject } from "xray16/mocks";

import { EvaluatorMovementRunTarget } from "@/engine/core/ai/state/movement/EvaluatorMovementRunTarget";
import type { StalkerStateManager } from "@/engine/core/ai/state/StalkerStateManager";

describe("EvaluatorMovementRunTarget", () => {
  it("should correctly check if run state when needed", () => {
    const object: GameObject = MockGameObject.mock();
    const evaluator: EvaluatorMovementRunTarget = new EvaluatorMovementRunTarget({
      targetState: "run",
    } as StalkerStateManager);

    evaluator.setup(object, new property_storage());

    expect(evaluator.evaluate()).toBe(true);
  });

  it("should correctly check if run state when not needed", () => {
    const object: GameObject = MockGameObject.mock();
    const evaluator: EvaluatorMovementRunTarget = new EvaluatorMovementRunTarget({
      targetState: "idle",
    } as StalkerStateManager);

    evaluator.setup(object, new property_storage());

    expect(evaluator.evaluate()).toBe(false);
  });
});
