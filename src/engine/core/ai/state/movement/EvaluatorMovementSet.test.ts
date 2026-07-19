import { describe, expect, it, jest } from "@jest/globals";
import { move, property_storage } from "xray16";
import { GameObject } from "xray16/alias";
import { MockGameObject } from "xray16/mocks";

import { EvaluatorMovementSet } from "@/engine/core/ai/state/movement/EvaluatorMovementSet";
import type { StalkerStateController } from "@/engine/core/ai/state/StalkerStateController";

describe("EvaluatorMovementSet", () => {
  it("should correctly check if movement state is set when idle/null + walk", () => {
    const object: GameObject = MockGameObject.mock();
    const evaluator: EvaluatorMovementSet = new EvaluatorMovementSet({ targetState: "idle" } as StalkerStateController);

    jest.spyOn(object, "target_movement_type").mockImplementation(() => move.walk);

    evaluator.setup(object, new property_storage());

    expect(evaluator.evaluate()).toBe(true);
  });

  it("should correctly check if movement state is set when idle/null + run", () => {
    const object: GameObject = MockGameObject.mock();
    const evaluator: EvaluatorMovementSet = new EvaluatorMovementSet({ targetState: "idle" } as StalkerStateController);

    jest.spyOn(object, "target_movement_type").mockImplementation(() => move.run);

    evaluator.setup(object, new property_storage());

    expect(evaluator.evaluate()).toBe(true);
  });

  it("should correctly check if movement state is set when set", () => {
    const object: GameObject = MockGameObject.mock();
    const evaluator: EvaluatorMovementSet = new EvaluatorMovementSet({
      targetState: "raid_fire",
    } as StalkerStateController);

    jest.spyOn(object, "target_movement_type").mockImplementation(() => move.walk);

    evaluator.setup(object, new property_storage());

    expect(evaluator.evaluate()).toBe(true);
  });

  it("should correctly check if movement state is set when not set", () => {
    const object: GameObject = MockGameObject.mock();
    const evaluator: EvaluatorMovementSet = new EvaluatorMovementSet({
      targetState: "sprint",
    } as StalkerStateController);

    jest.spyOn(object, "target_movement_type").mockImplementation(() => move.walk);

    evaluator.setup(object, new property_storage());

    expect(evaluator.evaluate()).toBe(false);
  });
});
