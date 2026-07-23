import { describe, expect, it } from "@jest/globals";
import { GameObject } from "xray16/alias";
import { MockGameObject, MockPropertyStorage } from "xray16/mocks";

import { StalkerStateController } from "@/engine/core/ai/state/StalkerStateController";
import { EvaluatorStateEnd } from "@/engine/core/ai/state/state/EvaluatorStateEnd";

describe("EvaluatorStateEnd", () => {
  it("always keeps the state-end action active", () => {
    const object: GameObject = MockGameObject.mock();
    const evaluator = new EvaluatorStateEnd(new StalkerStateController(object));

    evaluator.setup(object, MockPropertyStorage.mock());

    expect(evaluator.evaluate()).toBe(false);
  });
});
