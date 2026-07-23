import { describe, expect, it } from "@jest/globals";
import { GameObject } from "xray16/alias";
import { MockGameObject, MockPropertyStorage } from "xray16/mocks";

import { StalkerStateController } from "@/engine/core/ai/state/StalkerStateController";
import { EvaluatorStateLogicActive } from "@/engine/core/ai/state/state/EvaluatorStateLogicActive";
import { registerObject } from "@/engine/core/database";

describe("EvaluatorStateLogicActive", () => {
  it("reports whether the object has an active scripted section", () => {
    const object: GameObject = MockGameObject.mock();
    const state = registerObject(object);
    const evaluator = new EvaluatorStateLogicActive(new StalkerStateController(object));

    evaluator.setup(object, MockPropertyStorage.mock());
    expect(evaluator.evaluate()).toBe(false);

    state.activeSection = "logic";
    expect(evaluator.evaluate()).toBe(true);
  });
});
