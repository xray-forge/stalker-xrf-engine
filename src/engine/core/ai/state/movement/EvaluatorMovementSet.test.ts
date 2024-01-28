import { describe, expect, it, jest } from "@jest/globals";
import { move, property_storage } from "xray16";

import { EvaluatorMovementSet } from "@/engine/core/ai/state/movement/EvaluatorMovementSet";
import type { StalkerStateManager } from "@/engine/core/ai/state/StalkerStateManager";
import { GameObject } from "@/engine/lib/types";
import { MockGameObject } from "@/fixtures/xray";

describe("EvaluatorMovementSet class", () => {
  it("should correctly check if movement state is set when idle/null + walk", () => {
    const object: GameObject = MockGameObject.mock();
    const evaluator: EvaluatorMovementSet = new EvaluatorMovementSet({ targetState: "idle" } as StalkerStateManager);

    jest.spyOn(object, "target_movement_type").mockImplementation(() => move.walk);

    evaluator.setup(object, new property_storage());

    expect(evaluator.evaluate()).toBe(true);
  });

  it("should correctly check if movement state is set when idle/null + run", () => {
    const object: GameObject = MockGameObject.mock();
    const evaluator: EvaluatorMovementSet = new EvaluatorMovementSet({ targetState: "idle" } as StalkerStateManager);

    jest.spyOn(object, "target_movement_type").mockImplementation(() => move.run);

    evaluator.setup(object, new property_storage());

    expect(evaluator.evaluate()).toBe(true);
  });

  it("should correctly check if movement state is set when set", () => {
    const object: GameObject = MockGameObject.mock();
    const evaluator: EvaluatorMovementSet = new EvaluatorMovementSet({
      targetState: "raid_fire",
    } as StalkerStateManager);

    jest.spyOn(object, "target_movement_type").mockImplementation(() => move.walk);

    evaluator.setup(object, new property_storage());

    expect(evaluator.evaluate()).toBe(true);
  });

  it("should correctly check if movement state is set when not set", () => {
    const object: GameObject = MockGameObject.mock();
    const evaluator: EvaluatorMovementSet = new EvaluatorMovementSet({
      targetState: "sprint",
    } as StalkerStateManager);

    jest.spyOn(object, "target_movement_type").mockImplementation(() => move.walk);

    evaluator.setup(object, new property_storage());

    expect(evaluator.evaluate()).toBe(false);
  });
});
