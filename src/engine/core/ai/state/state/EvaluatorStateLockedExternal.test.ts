import { describe, expect, it } from "@jest/globals";
import { MockGameObject } from "xray16/mocks";

import { StalkerStateController } from "@/engine/core/ai/state/StalkerStateController";
import { EvaluatorStateLockedExternal } from "@/engine/core/ai/state/state/EvaluatorStateLockedExternal";

describe("EvaluatorStateLockedExternal", () => {
  it("reports a lock while combat or alife controls the object", () => {
    const controller: StalkerStateController = new StalkerStateController(MockGameObject.mock());
    const evaluator: EvaluatorStateLockedExternal = new EvaluatorStateLockedExternal(controller);

    controller.isCombat = false;
    controller.isAlife = false;

    expect(evaluator.evaluate()).toBe(false);

    controller.isCombat = true;

    expect(evaluator.evaluate()).toBe(true);

    controller.isCombat = false;
    controller.isAlife = true;

    expect(evaluator.evaluate()).toBe(true);
  });
});
