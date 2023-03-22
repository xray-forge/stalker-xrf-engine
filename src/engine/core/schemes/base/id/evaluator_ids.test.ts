import { describe, expect, it } from "@jest/globals";

import { EEvaluatorId } from "@/engine/core/schemes/base/id/evaluator_ids";

describe("'evaluator_ids' constants integrity", () => {
  it("should contain only unique identifier values", () => {
    const existing: Set<number> = new Set();

    Object.entries(EEvaluatorId).forEach(([key, value]) => {
      expect(existing.has(value)).toBeFalsy();
      existing.add(value);
    });
  });
});
