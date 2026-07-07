import { describe, expect, it } from "@jest/globals";
import { property_storage } from "xray16";
import { GameObject } from "xray16/alias";
import { MockGameObject } from "xray16/mocks";

import { EvaluatorMovementStandTarget } from "@/engine/core/ai/state/movement/EvaluatorMovementStandTarget";
import type { StalkerStateManager } from "@/engine/core/ai/state/StalkerStateManager";

describe("EvaluatorMovementStandTarget", () => {
  it("should correctly check if run state when needed", () => {
    const object: GameObject = MockGameObject.mock();
    const evaluator: EvaluatorMovementStandTarget = new EvaluatorMovementStandTarget({
      targetState: "probe_stand",
    } as StalkerStateManager);

    evaluator.setup(object, new property_storage());

    expect(evaluator.evaluate()).toBe(true);
  });

  it("should correctly check if run state when not needed", () => {
    const object: GameObject = MockGameObject.mock();
    const evaluator: EvaluatorMovementStandTarget = new EvaluatorMovementStandTarget({
      targetState: "walk",
    } as StalkerStateManager);

    evaluator.setup(object, new property_storage());

    expect(evaluator.evaluate()).toBe(false);
  });
});
