import { describe, expect, it } from "@jest/globals";
import { property_storage } from "xray16";

import { EvaluatorMovementRunTarget } from "@/engine/core/objects/ai/state/movement/EvaluatorMovementRunTarget";
import type { StalkerStateManager } from "@/engine/core/objects/ai/state/StalkerStateManager";
import { ClientObject } from "@/engine/lib/types";
import { mockClientGameObject } from "@/fixtures/xray";

describe("EvaluatorMovementRunTarget class", () => {
  it("should correctly check if run state when needed", () => {
    const object: ClientObject = mockClientGameObject();
    const evaluator: EvaluatorMovementRunTarget = new EvaluatorMovementRunTarget({
      targetState: "run",
    } as StalkerStateManager);

    evaluator.setup(object, new property_storage());

    expect(evaluator.evaluate()).toBe(true);
  });

  it("should correctly check if run state when not needed", () => {
    const object: ClientObject = mockClientGameObject();
    const evaluator: EvaluatorMovementRunTarget = new EvaluatorMovementRunTarget({
      targetState: "idle",
    } as StalkerStateManager);

    evaluator.setup(object, new property_storage());

    expect(evaluator.evaluate()).toBe(false);
  });
});
