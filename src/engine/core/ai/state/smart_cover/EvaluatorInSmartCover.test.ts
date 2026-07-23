import { describe, expect, it, jest } from "@jest/globals";
import { GameObject } from "xray16/alias";
import { MockGameObject, MockPropertyStorage } from "xray16/mocks";

import { EvaluatorInSmartCover } from "@/engine/core/ai/state/smart_cover/EvaluatorInSmartCover";
import { StalkerStateController } from "@/engine/core/ai/state/StalkerStateController";

describe("EvaluatorInSmartCover", () => {
  it("reflects the object's current smart-cover membership", () => {
    const object: GameObject = MockGameObject.mock();
    const evaluator = new EvaluatorInSmartCover(new StalkerStateController(object));

    evaluator.setup(object, MockPropertyStorage.mock());
    jest.spyOn(object, "in_smart_cover").mockReturnValue(false);
    expect(evaluator.evaluate()).toBe(false);

    jest.spyOn(object, "in_smart_cover").mockReturnValue(true);
    expect(evaluator.evaluate()).toBe(true);
  });
});
