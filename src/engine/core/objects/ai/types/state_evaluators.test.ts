import { describe, expect, it } from "@jest/globals";

import { EStateEvaluatorId } from "@/engine/core/objects/ai/types";

describe("'state_evaluators' constants integrity", () => {
  it("should contain only unique identifier values", () => {
    const existing: Set<unknown> = new Set();

    Object.values(EStateEvaluatorId).forEach((value) => {
      expect(existing.has(value)).toBeFalsy();
      existing.add(value);
    });
  });
});
