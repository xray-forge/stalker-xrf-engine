import { describe, expect, it, jest } from "@jest/globals";
import { GameObject } from "xray16/alias";
import { MockGameObject, MockPropertyStorage } from "xray16/mocks";

import { StalkerStateController } from "@/engine/core/ai/state/StalkerStateController";
import { EvaluatorStateIdleAlife } from "@/engine/core/ai/state/state/EvaluatorStateIdleAlife";

describe("EvaluatorStateIdleAlife", () => {
  it("treats dead objects as idle and waits for an initialized action planner otherwise", () => {
    const object: GameObject = MockGameObject.mock();
    const evaluator = new EvaluatorStateIdleAlife(new StalkerStateController(object));

    evaluator.setup(object, MockPropertyStorage.mock());
    expect(evaluator.evaluate()).toBe(false);

    jest.spyOn(object, "alive").mockReturnValue(false);
    expect(evaluator.evaluate()).toBe(true);
  });
});
