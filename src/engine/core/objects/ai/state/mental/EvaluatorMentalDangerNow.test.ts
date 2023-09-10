import { describe, expect, it } from "@jest/globals";
import { anim, property_storage } from "xray16";

import { EvaluatorMentalDangerNow } from "@/engine/core/objects/ai/state/mental/EvaluatorMentalDangerNow";
import type { StalkerStateManager } from "@/engine/core/objects/ai/state/StalkerStateManager";
import { ClientObject } from "@/engine/lib/types";
import { mockClientGameObject } from "@/fixtures/xray";

describe("EvaluatorMentalDangerTarget class", () => {
  it("should correctly check if danger state when set", () => {
    const object: ClientObject = mockClientGameObject({ target_mental_state: () => anim.danger });
    const evaluator: EvaluatorMentalDangerNow = new EvaluatorMentalDangerNow({} as StalkerStateManager);

    evaluator.setup(object, new property_storage());

    expect(evaluator.evaluate()).toBe(true);
  });

  it("should correctly check if danger state when not set", () => {
    const object: ClientObject = mockClientGameObject({ target_mental_state: () => anim.free });
    const evaluator: EvaluatorMentalDangerNow = new EvaluatorMentalDangerNow({} as StalkerStateManager);

    evaluator.setup(object, new property_storage());

    expect(evaluator.evaluate()).toBe(false);
  });
});
