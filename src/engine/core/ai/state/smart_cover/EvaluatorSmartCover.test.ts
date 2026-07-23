import { describe, expect, it } from "@jest/globals";
import { GameObject } from "xray16/alias";
import { MockGameObject, MockPropertyStorage } from "xray16/mocks";

import { EvaluatorSmartCover } from "@/engine/core/ai/state/smart_cover/EvaluatorSmartCover";
import { StalkerStateController } from "@/engine/core/ai/state/StalkerStateController";
import { registerObject } from "@/engine/core/database";

describe("EvaluatorSmartCover", () => {
  it("accepts non-smart-cover target states without a configured smart cover", () => {
    const object: GameObject = MockGameObject.mock();

    registerObject(object);

    const evaluator = new EvaluatorSmartCover(new StalkerStateController(object));

    evaluator.setup(object, MockPropertyStorage.mock());

    expect(evaluator.evaluate()).toBe(true);
  });
});
