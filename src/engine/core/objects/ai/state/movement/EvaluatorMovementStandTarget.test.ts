import { describe, expect, it } from "@jest/globals";
import { property_storage } from "xray16";

import { EvaluatorMovementStandTarget } from "@/engine/core/objects/ai/state/movement/EvaluatorMovementStandTarget";
import type { StalkerStateManager } from "@/engine/core/objects/ai/state/StalkerStateManager";
import { ClientObject } from "@/engine/lib/types";
import { mockClientGameObject } from "@/fixtures/xray";

describe("EvaluatorMovementStandTarget class", () => {
  it("should correctly check if run state when needed", () => {
    const object: ClientObject = mockClientGameObject();
    const evaluator: EvaluatorMovementStandTarget = new EvaluatorMovementStandTarget({
      targetState: "probe_stand",
    } as StalkerStateManager);

    evaluator.setup(object, new property_storage());

    expect(evaluator.evaluate()).toBe(true);
  });

  it("should correctly check if run state when not needed", () => {
    const object: ClientObject = mockClientGameObject();
    const evaluator: EvaluatorMovementStandTarget = new EvaluatorMovementStandTarget({
      targetState: "walk",
    } as StalkerStateManager);

    evaluator.setup(object, new property_storage());

    expect(evaluator.evaluate()).toBe(false);
  });
});
