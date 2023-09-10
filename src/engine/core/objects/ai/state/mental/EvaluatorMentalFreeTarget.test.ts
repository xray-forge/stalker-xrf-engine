import { describe, expect, it } from "@jest/globals";
import { property_storage } from "xray16";

import { EvaluatorMentalFreeTarget } from "@/engine/core/objects/ai/state/mental/EvaluatorMentalFreeTarget";
import type { StalkerStateManager } from "@/engine/core/objects/ai/state/StalkerStateManager";
import { ClientObject } from "@/engine/lib/types";
import { mockClientGameObject } from "@/fixtures/xray";

describe("EvaluatorMentalDangerTarget class", () => {
  it("should correctly check if free state when needed", () => {
    const object: ClientObject = mockClientGameObject();
    const evaluator: EvaluatorMentalFreeTarget = new EvaluatorMentalFreeTarget({
      targetState: "rush",
    } as StalkerStateManager);

    evaluator.setup(object, new property_storage());

    expect(evaluator.evaluate()).toBe(true);
  });

  it("should correctly check if free state when not needed", () => {
    const object: ClientObject = mockClientGameObject();
    const evaluator: EvaluatorMentalFreeTarget = new EvaluatorMentalFreeTarget({
      targetState: "raid_fire",
    } as StalkerStateManager);

    evaluator.setup(object, new property_storage());

    expect(evaluator.evaluate()).toBe(false);
  });
});
