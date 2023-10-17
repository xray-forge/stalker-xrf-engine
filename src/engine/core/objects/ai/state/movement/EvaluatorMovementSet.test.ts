import { describe, expect, it } from "@jest/globals";
import { move, property_storage } from "xray16";

import { EvaluatorMovementSet } from "@/engine/core/objects/ai/state/movement/EvaluatorMovementSet";
import type { StalkerStateManager } from "@/engine/core/objects/ai/state/StalkerStateManager";
import { GameObject } from "@/engine/lib/types";
import { mockGameObject } from "@/fixtures/xray";

describe("EvaluatorMovementSet class", () => {
  it("should correctly check if movement state is set when idle/null + walk", () => {
    const object: GameObject = mockGameObject({ target_movement_type: () => move.walk });
    const evaluator: EvaluatorMovementSet = new EvaluatorMovementSet({ targetState: "idle" } as StalkerStateManager);

    evaluator.setup(object, new property_storage());

    expect(evaluator.evaluate()).toBe(true);
  });

  it("should correctly check if movement state is set when idle/null + run", () => {
    const object: GameObject = mockGameObject({ target_movement_type: () => move.run });
    const evaluator: EvaluatorMovementSet = new EvaluatorMovementSet({ targetState: "idle" } as StalkerStateManager);

    evaluator.setup(object, new property_storage());

    expect(evaluator.evaluate()).toBe(true);
  });

  it("should correctly check if movement state is set when set", () => {
    const object: GameObject = mockGameObject({ target_movement_type: () => move.walk });
    const evaluator: EvaluatorMovementSet = new EvaluatorMovementSet({
      targetState: "raid_fire",
    } as StalkerStateManager);

    evaluator.setup(object, new property_storage());

    expect(evaluator.evaluate()).toBe(true);
  });

  it("should correctly check if movement state is set when not set", () => {
    const object: GameObject = mockGameObject({ target_movement_type: () => move.walk });
    const evaluator: EvaluatorMovementSet = new EvaluatorMovementSet({
      targetState: "sprint",
    } as StalkerStateManager);

    evaluator.setup(object, new property_storage());

    expect(evaluator.evaluate()).toBe(false);
  });
});
