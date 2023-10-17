import { describe, expect, it } from "@jest/globals";
import { anim, property_storage } from "xray16";

import { EvaluatorMentalSet } from "@/engine/core/objects/ai/state/mental/EvaluatorMentalSet";
import type { StalkerStateManager } from "@/engine/core/objects/ai/state/StalkerStateManager";
import { GameObject } from "@/engine/lib/types";
import { mockGameObject } from "@/fixtures/xray";

describe("EvaluatorMentalSet class", () => {
  it("should correctly check if mental state is set when idle/null + free", () => {
    const object: GameObject = mockGameObject({ target_mental_state: () => anim.free });
    const evaluator: EvaluatorMentalSet = new EvaluatorMentalSet({ targetState: "idle" } as StalkerStateManager);

    evaluator.setup(object, new property_storage());

    expect(evaluator.evaluate()).toBe(true);
  });

  it("should correctly check if mental state is set when idle/null + danger", () => {
    const object: GameObject = mockGameObject({ target_mental_state: () => anim.danger });
    const evaluator: EvaluatorMentalSet = new EvaluatorMentalSet({ targetState: "idle" } as StalkerStateManager);

    evaluator.setup(object, new property_storage());

    expect(evaluator.evaluate()).toBe(true);
  });

  it("should correctly check if mental state is set when set", () => {
    const object: GameObject = mockGameObject({ target_mental_state: () => anim.danger });
    const evaluator: EvaluatorMentalSet = new EvaluatorMentalSet({ targetState: "raid_fire" } as StalkerStateManager);

    evaluator.setup(object, new property_storage());

    expect(evaluator.evaluate()).toBe(true);
  });

  it("should correctly check if mental state is set when not set", () => {
    const object: GameObject = mockGameObject({ target_mental_state: () => anim.free });
    const evaluator: EvaluatorMentalSet = new EvaluatorMentalSet({ targetState: "raid_fire" } as StalkerStateManager);

    evaluator.setup(object, new property_storage());

    expect(evaluator.evaluate()).toBe(false);
  });
});
