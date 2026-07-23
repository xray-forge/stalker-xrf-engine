import { describe, expect, it, jest } from "@jest/globals";
import { GameObject } from "xray16/alias";
import { MockGameObject, MockPropertyStorage } from "xray16/mocks";

import { StalkerStateController } from "@/engine/core/ai/state/StalkerStateController";
import { EvaluatorStateIdleCombat } from "@/engine/core/ai/state/state/EvaluatorStateIdleCombat";

describe("EvaluatorStateIdleCombat", () => {
  it("treats dead objects as combat-idle and waits for an initialized action planner otherwise", () => {
    const object: GameObject = MockGameObject.mock();
    const evaluator = new EvaluatorStateIdleCombat(new StalkerStateController(object));

    evaluator.setup(object, MockPropertyStorage.mock());
    expect(evaluator.evaluate()).toBe(false);

    jest.spyOn(object, "alive").mockReturnValue(false);
    expect(evaluator.evaluate()).toBe(true);
  });
});
