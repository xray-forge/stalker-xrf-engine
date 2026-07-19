import { describe, expect, it } from "@jest/globals";
import { MockGameObject } from "xray16/mocks";

import { StalkerStateManager } from "@/engine/core/ai/state/StalkerStateManager";
import { EvaluatorStateLockedExternal } from "@/engine/core/ai/state/state/EvaluatorStateLockedExternal";

describe("EvaluatorStateLockedExternal", () => {
  it("reports a lock while combat or alife controls the object", () => {
    const stateManager: StalkerStateManager = new StalkerStateManager(MockGameObject.mock());
    const evaluator: EvaluatorStateLockedExternal = new EvaluatorStateLockedExternal(stateManager);

    stateManager.isCombat = false;
    stateManager.isAlife = false;

    expect(evaluator.evaluate()).toBe(false);

    stateManager.isCombat = true;

    expect(evaluator.evaluate()).toBe(true);

    stateManager.isCombat = false;
    stateManager.isAlife = true;

    expect(evaluator.evaluate()).toBe(true);
  });
});
