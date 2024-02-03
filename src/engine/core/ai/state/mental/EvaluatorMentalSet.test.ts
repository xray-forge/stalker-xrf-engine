import { describe, expect, it, jest } from "@jest/globals";
import { anim, property_storage } from "xray16";

import { EvaluatorMentalSet } from "@/engine/core/ai/state/mental/EvaluatorMentalSet";
import type { StalkerStateManager } from "@/engine/core/ai/state/StalkerStateManager";
import { GameObject } from "@/engine/lib/types";
import { MockGameObject } from "@/fixtures/xray";

describe("EvaluatorMentalSet", () => {
  it("should correctly check if mental state is set when idle/null + free", () => {
    const object: GameObject = MockGameObject.mock();
    const evaluator: EvaluatorMentalSet = new EvaluatorMentalSet({ targetState: "idle" } as StalkerStateManager);

    jest.spyOn(object, "target_mental_state").mockImplementation(() => anim.free);

    evaluator.setup(object, new property_storage());

    expect(evaluator.evaluate()).toBe(true);
  });

  it("should correctly check if mental state is set when idle/null + danger", () => {
    const object: GameObject = MockGameObject.mock();
    const evaluator: EvaluatorMentalSet = new EvaluatorMentalSet({ targetState: "idle" } as StalkerStateManager);

    jest.spyOn(object, "target_mental_state").mockImplementation(() => anim.danger);

    evaluator.setup(object, new property_storage());

    expect(evaluator.evaluate()).toBe(true);
  });

  it("should correctly check if mental state is set when set", () => {
    const object: GameObject = MockGameObject.mock();
    const evaluator: EvaluatorMentalSet = new EvaluatorMentalSet({ targetState: "raid_fire" } as StalkerStateManager);

    jest.spyOn(object, "target_mental_state").mockImplementation(() => anim.danger);

    evaluator.setup(object, new property_storage());

    expect(evaluator.evaluate()).toBe(true);
  });

  it("should correctly check if mental state is set when not set", () => {
    const object: GameObject = MockGameObject.mock();
    const evaluator: EvaluatorMentalSet = new EvaluatorMentalSet({ targetState: "raid_fire" } as StalkerStateManager);

    jest.spyOn(object, "target_mental_state").mockImplementation(() => anim.free);

    evaluator.setup(object, new property_storage());

    expect(evaluator.evaluate()).toBe(false);
  });
});
