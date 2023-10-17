import { describe, expect, it } from "@jest/globals";
import { property_storage } from "xray16";

import { EvaluatorMovementRunTarget } from "@/engine/core/objects/ai/state/movement/EvaluatorMovementRunTarget";
import type { StalkerStateManager } from "@/engine/core/objects/ai/state/StalkerStateManager";
import { GameObject } from "@/engine/lib/types";
import { mockGameObject } from "@/fixtures/xray";

describe("EvaluatorMovementRunTarget class", () => {
  it("should correctly check if run state when needed", () => {
    const object: GameObject = mockGameObject();
    const evaluator: EvaluatorMovementRunTarget = new EvaluatorMovementRunTarget({
      targetState: "run",
    } as StalkerStateManager);

    evaluator.setup(object, new property_storage());

    expect(evaluator.evaluate()).toBe(true);
  });

  it("should correctly check if run state when not needed", () => {
    const object: GameObject = mockGameObject();
    const evaluator: EvaluatorMovementRunTarget = new EvaluatorMovementRunTarget({
      targetState: "idle",
    } as StalkerStateManager);

    evaluator.setup(object, new property_storage());

    expect(evaluator.evaluate()).toBe(false);
  });
});
